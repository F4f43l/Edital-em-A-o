import { repositorioAnalises } from '../repositorios/repositorioAnalises.js';
import { repositorioEditais } from '../repositorios/repositorioEditais.js';
import { repositorioPerfis } from '../repositorios/repositorioPerfis.js';
import { repositorioRequisitos } from '../repositorios/repositorioRequisitos.js';
import { repositorioTarefas } from '../repositorios/repositorioTarefas.js';
import { servicoInteligenciaArtificial } from './servicoInteligenciaArtificial.js';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoAnalises = {
  async listarAnalises(filtros) {
    return repositorioAnalises.buscarTodas(filtros);
  },

  async buscarAnalisePorId(id) {
    const analise = await repositorioAnalises.buscarPorId(id);
    if (!analise) {
      throw new ErroAplicacao('Análise não encontrada.', 404, 'ANALISE_NAO_ENCONTRADA');
    }

    const requisitos = await repositorioRequisitos.buscarPorAnaliseId(id);
    const tarefas = await repositorioTarefas.buscarTodas({ analise_id: id });

    return {
      ...analise,
      requisitos,
      tarefas,
    };
  },

  async criarAnalise(dados) {
    const edital = await repositorioEditais.buscarPorId(dados.edital_id);
    if (!edital) {
      throw new ErroAplicacao('Edital informado não existe.', 404, 'EDITAL_NAO_ENCONTRADO');
    }

    let perfil = null;
    if (dados.perfil_id) {
      perfil = await repositorioPerfis.buscarPorId(dados.perfil_id);
      if (!perfil) {
        throw new ErroAplicacao('Perfil de usuário informado não foi encontrado.', 404, 'PERFIL_NAO_ENCONTRADO');
      }
    }

    // Texto para análise: texto extraído do PDF ou resumo cadastrado
    const textoParaAnalise = edital.texto_extraido || edital.resumo || '';
    if (!textoParaAnalise.trim()) {
      throw new ErroAplicacao(
        'Este edital ainda não possui texto extraído nem resumo cadastrado. Faça o envio do arquivo PDF do edital ou informe o conteúdo manualmente antes de iniciar a análise.',
        400,
        'EDITAL_SEM_CONTEUDO'
      );
    }

    // 1. Executa a análise (Gemini ou Extração por Regras/Heurística)
    const resultadoIa = await servicoInteligenciaArtificial.analisarTextoEdital(textoParaAnalise, perfil);

    // 2. Se a análise identificou prazo ou custos e o edital não tinha, atualiza o edital
    const atualizacoesEdital = {};
    if (resultadoIa.prazo_inscricao && !edital.prazo_inscricao) {
      atualizacoesEdital.prazo_inscricao = resultadoIa.prazo_inscricao;
    }
    if (resultadoIa.custos_logistica && !edital.custos_logistica) {
      atualizacoesEdital.custos_logistica = resultadoIa.custos_logistica;
    }
    if (Object.keys(atualizacoesEdital).length > 0) {
      await repositorioEditais.atualizar(edital.id, atualizacoesEdital);
    }

    // 3. Salva a análise principal
    const analiseSalva = await repositorioAnalises.criar({
      edital_id: edital.id,
      perfil_id: perfil ? perfil.id : null,
      resumo: resultadoIa.resumo_simples,
      resultado_orientativo: resultadoIa.resultado_orientativo || 'possivel_compatibilidade',
      status: 'concluida',
      provedor_ia: resultadoIa.provedor_ia,
      modelo_ia: resultadoIa.modelo_ia,
      custos_logistica: resultadoIa.custos_logistica || null,
    });

    // 4. Salva os requisitos vinculados
    const requisitosParaSalvar = (resultadoIa.requisitos || []).map((req) => ({
      analise_id: analiseSalva.id,
      titulo: req.titulo,
      descricao: req.descricao,
      tipo: req.tipo,
      obrigatorio: req.obrigatorio,
      status_perfil: req.status_perfil,
      evidencia_texto: req.evidencia_texto,
      pagina_origem: req.pagina_origem,
      origem_dado: req.origem_dado || 'ia',
      observacao: req.observacao,
    }));

    let requisitosCriados = [];
    if (requisitosParaSalvar.length > 0) {
      requisitosCriados = await repositorioRequisitos.criarVarios(requisitosParaSalvar);
    }

    // 5. Gera automaticamente as tarefas do plano de ação correspondentes
    const tarefasIniciais = [];
    for (const req of requisitosCriados) {
      if (req.tipo === 'documento') {
        tarefasIniciais.push({
          analise_id: analiseSalva.id,
          requisito_id: req.id,
          titulo: `Separar e digitalizar: ${req.titulo}`,
          descricao: `Providenciar cópia legível do documento solicitado (${req.descricao || req.titulo}).`,
          data_limite: edital.prazo_inscricao || null,
          prioridade: req.obrigatorio ? 'alta' : 'media',
          status: 'pendente',
        });
      } else if (req.tipo === 'elegibilidade' && req.status_perfil === 'confirmar') {
        tarefasIniciais.push({
          analise_id: analiseSalva.id,
          requisito_id: req.id,
          titulo: `Verificar critério de elegibilidade: ${req.titulo}`,
          descricao: `Conferir documentos ou certificados que atestem o cumprimento deste critério (${req.titulo}).`,
          data_limite: edital.prazo_inscricao || null,
          prioridade: 'media',
          status: 'pendente',
        });
      }
    }

    // Tarefa final de envio
    tarefasIniciais.push({
      analise_id: analiseSalva.id,
      requisito_id: null,
      titulo: `Conferir checklist final e submeter inscrição: ${edital.titulo}`,
      descricao: 'Realizar a conferência de todos os anexos e submeter a inscrição no portal oficial do edital.',
      data_limite: edital.prazo_inscricao || null,
      prioridade: 'urgente',
      status: 'pendente',
    });

    await repositorioTarefas.criarVarias(tarefasIniciais);

    // Retorna a análise completa consolidada
    return this.buscarAnalisePorId(analiseSalva.id);
  },

  async atualizarAnalise(id, dados) {
    await this.buscarAnalisePorId(id);
    return repositorioAnalises.atualizar(id, dados);
  },

  async obterResumoExclusao(id) {
    await this.buscarAnalisePorId(id);
    return repositorioAnalises.contarDependentes(id);
  },

  async excluirAnalise(id) {
    await this.buscarAnalisePorId(id);
    return repositorioAnalises.excluir(id);
  },
};
