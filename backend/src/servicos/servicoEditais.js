import fs from 'fs';
import path from 'path';
import { repositorioEditais } from '../repositorios/repositorioEditais.js';
import { repositorioAnalises } from '../repositorios/repositorioAnalises.js';
import { repositorioRequisitos } from '../repositorios/repositorioRequisitos.js';
import { repositorioTarefas } from '../repositorios/repositorioTarefas.js';
import { repositorioPerfis } from '../repositorios/repositorioPerfis.js';
import { servicoExtracaoPdf } from './servicoExtracaoPdf.js';
import { servicoInteligenciaArtificial } from './servicoInteligenciaArtificial.js';
import { sanitizarNomeArquivo } from '../utilitarios/sanitizacao.js';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoEditais = {
  async listarEditais(filtros) {
    return repositorioEditais.buscarTodos(filtros);
  },

  async buscarEditalPorId(id) {
    const edital = await repositorioEditais.buscarPorId(id);
    if (!edital) {
      throw new ErroAplicacao('Edital não encontrado.', 404, 'EDITAL_NAO_ENCONTRADO');
    }
    return edital;
  },

  async criarEdital(dados) {
    return repositorioEditais.criar(dados);
  },

  async atualizarEdital(id, dados) {
    await this.buscarEditalPorId(id);
    return repositorioEditais.atualizar(id, dados);
  },

  /**
   * FLUXO PRINCIPAL - ETAPA 1:
   * Recebe o PDF, extrai texto real e executa a análise com IA (ou motor heurístico),
   * retornando os dados estruturados para conferência e revisão pelo usuário ANTES de persistir.
   */
  async processarPdfInicial(arquivo, perfilId = null) {
    if (!arquivo) {
      throw new ErroAplicacao('Nenhum arquivo PDF foi enviado na requisição.', 400, 'ARQUIVO_AUSENTE');
    }

    try {
      // 1. Extração de texto real
      const resultadoPdf = await servicoExtracaoPdf.extrairTextoPdf(arquivo.path);
      const nomeSanitizado = sanitizarNomeArquivo(arquivo.originalname);
      const caminhoRelativo = path.join('uploads', path.basename(arquivo.path)).replace(/\\/g, '/');

      // 2. Busca perfil caso tenha sido selecionado
      let perfil = null;
      if (perfilId) {
        perfil = await repositorioPerfis.buscarPorId(parseInt(perfilId, 10));
      }

      // 3. Executa a análise com IA / Heurística
      const resultadoAnalise = await servicoInteligenciaArtificial.analisarTextoEdital(
        resultadoPdf.textoExtraido,
        perfil
      );

      return {
        arquivo: {
          nome_original: nomeSanitizado,
          caminho_arquivo: caminhoRelativo,
          tamanho_bytes: arquivo.size,
          total_paginas: resultadoPdf.totalPaginas,
        },
        texto_extraido: resultadoPdf.textoExtraido,
        dados_extraidos: resultadoAnalise,
        perfil_utilizado: perfil
          ? { id: perfil.id, nome: perfil.nome_exibicao, nivel_ensino: perfil.nivel_ensino }
          : null,
      };
    } catch (erro) {
      // Em caso de falha de extração, limpa arquivo temporário
      if (arquivo && fs.existsSync(arquivo.path)) {
        try {
          fs.unlinkSync(arquivo.path);
        } catch (_) {}
      }
      throw erro;
    }
  },

  /**
   * FLUXO PRINCIPAL - ETAPA 2:
   * Salva o edital revisado pelo usuário no MySQL e gera a análise e o plano de ação
   */
  async confirmarCadastroComAnalise(dados) {
    const { edital: dadosEdital, analise: dadosAnalise, requisitos: listaRequisitos = [] } = dados;

    if (!dadosEdital || !dadosEdital.titulo) {
      throw new ErroAplicacao('Os dados do edital são obrigatórios para a confirmação.', 400, 'DADOS_INVALIDOS');
    }

    // 1. Cria o registro do Edital no MySQL
    const custosLogisticaConsolidados = dadosAnalise?.custos_logistica || dadosEdital?.custos_logistica || null;

    const editalCriado = await repositorioEditais.criar({
      titulo: dadosEdital.titulo,
      instituicao: dadosEdital.instituicao || null,
      categoria: dadosEdital.categoria || 'Outro',
      resumo: dadosEdital.resumo || null,
      url_origem: dadosEdital.url_origem || null,
      nome_arquivo: dadosEdital.nome_arquivo || null,
      caminho_arquivo: dadosEdital.caminho_arquivo || null,
      texto_extraido: dadosEdital.texto_extraido || null,
      prazo_inscricao: dadosEdital.prazo_inscricao || null,
      prazo_recurso: dadosEdital.prazo_recurso || null,
      data_resultado: dadosEdital.data_resultado || null,
      status: dadosEdital.status || 'ativo',
      custos_logistica: custosLogisticaConsolidados,
    });

    // 2. Cria a Análise vinculada ao edital e perfil
    const analiseCriada = await repositorioAnalises.criar({
      edital_id: editalCriado.id,
      perfil_id: dadosAnalise?.perfil_id || null,
      resumo: dadosAnalise?.resumo || editalCriado.resumo,
      resultado_orientativo: dadosAnalise?.resultado_orientativo || 'possivel_compatibilidade',
      status: 'concluida',
      provedor_ia: dadosAnalise?.provedor_ia || 'manual',
      modelo_ia: dadosAnalise?.modelo_ia || null,
      custos_logistica: custosLogisticaConsolidados,
    });

    // 3. Salva os Requisitos validados pelo usuário
    const requisitosParaSalvar = listaRequisitos.map((r) => ({
      analise_id: analiseCriada.id,
      titulo: r.titulo,
      descricao: r.descricao || null,
      tipo: r.tipo || 'outro',
      obrigatorio: r.obrigatorio !== false,
      status_perfil: r.status_perfil || 'confirmar',
      evidencia_texto: r.evidencia_texto || null,
      pagina_origem: r.pagina_origem || null,
      origem_dado: r.origem_dado || 'ia',
      observacao: r.observacao || null,
    }));

    let requisitosCriados = [];
    if (requisitosParaSalvar.length > 0) {
      requisitosCriados = await repositorioRequisitos.criarVarios(requisitosParaSalvar);
    }

    // 4. Gera automaticamente as tarefas no Plano de Ação (Checklist)
    const tarefasIniciais = [];

    // Tarefas para documentos exigidos
    for (const req of requisitosCriados) {
      if (req.tipo === 'documento') {
        tarefasIniciais.push({
          analise_id: analiseCriada.id,
          requisito_id: req.id,
          titulo: `Separar e digitalizar: ${req.titulo}`,
          descricao: `Providenciar cópia legível do documento exigido (${req.descricao || req.titulo}).`,
          data_limite: editalCriado.prazo_inscricao || null,
          prioridade: req.obrigatorio ? 'alta' : 'media',
          status: 'pendente',
        });
      } else if (req.tipo === 'elegibilidade' && req.status_perfil === 'confirmar') {
        tarefasIniciais.push({
          analise_id: analiseCriada.id,
          requisito_id: req.id,
          titulo: `Verificar critério: ${req.titulo}`,
          descricao: `Conferir documentos comprobatórios para este critério (${req.titulo}).`,
          data_limite: editalCriado.prazo_inscricao || null,
          prioridade: 'media',
          status: 'pendente',
        });
      }
    }

    // Tarefa para submissão final da inscrição
    tarefasIniciais.push({
      analise_id: analiseCriada.id,
      requisito_id: null,
      titulo: `Submeter inscrição no edital: ${editalCriado.titulo}`,
      descricao: 'Conferir todos os documentos e submeter a inscrição no portal oficial antes do prazo final.',
      data_limite: editalCriado.prazo_inscricao || null,
      prioridade: 'urgente',
      status: 'pendente',
    });

    // Tarefa para acompanhamento de resultado
    if (editalCriado.data_resultado) {
      tarefasIniciais.push({
        analise_id: analiseCriada.id,
        requisito_id: null,
        titulo: 'Consultar divulgação do resultado oficial',
        descricao: 'Acessar o portal para verificar o resultado preliminar/final homologado.',
        data_limite: editalCriado.data_resultado,
        prioridade: 'media',
        status: 'pendente',
      });
    }

    // Tarefa para prazo de recurso (se aplicável)
    if (editalCriado.prazo_recurso) {
      tarefasIniciais.push({
        analise_id: analiseCriada.id,
        requisito_id: null,
        titulo: 'Prazo limite para interposição de recurso',
        descricao: 'Caso haja contestação ou necessidade de complementação documental.',
        data_limite: editalCriado.prazo_recurso,
        prioridade: 'alta',
        status: 'pendente',
      });
    }

    await repositorioTarefas.criarVarias(tarefasIniciais);

    return {
      edital: editalCriado,
      analise: analiseCriada,
      totalRequisitos: requisitosCriados.length,
      totalTarefas: tarefasIniciais.length,
    };
  },

  async processarUploadPdf(id, arquivo) {
    const edital = await this.buscarEditalPorId(id);
    if (!arquivo) {
      throw new ErroAplicacao('Nenhum arquivo PDF foi enviado na requisição.', 400, 'ARQUIVO_AUSENTE');
    }

    try {
      const resultadoPdf = await servicoExtracaoPdf.extrairTextoPdf(arquivo.path);
      const nomeSanitizado = sanitizarNomeArquivo(arquivo.originalname);
      const caminhoRelativo = path.join('uploads', path.basename(arquivo.path)).replace(/\\/g, '/');

      const resumoInicial = edital.resumo || resultadoPdf.textoExtraido.slice(0, 300).trim() + '...';

      const editalAtualizado = await repositorioEditais.atualizar(id, {
        nome_arquivo: nomeSanitizado,
        caminho_arquivo: caminhoRelativo,
        texto_extraido: resultadoPdf.textoExtraido,
        resumo: resumoInicial,
      });

      return {
        edital: editalAtualizado,
        totalPaginas: resultadoPdf.totalPaginas,
        caracteresExtraidos: resultadoPdf.textoExtraido.length,
      };
    } catch (erro) {
      if (fs.existsSync(arquivo.path)) {
        try {
          fs.unlinkSync(arquivo.path);
        } catch (_) {}
      }
      throw erro;
    }
  },

  async excluirEdital(id) {
    const edital = await this.buscarEditalPorId(id);

    if (edital.caminho_arquivo) {
      const caminhoCompleto = path.resolve(edital.caminho_arquivo);
      if (fs.existsSync(caminhoCompleto)) {
        try {
          fs.unlinkSync(caminhoCompleto);
        } catch (e) {
          console.warn('[ARQUIVO] Não foi possível remover arquivo físico do edital:', e.message);
        }
      }
    }

    return repositorioEditais.excluir(id);
  },

  async obterResumoPainel() {
    return repositorioEditais.obterContadoresPainel();
  },
};
