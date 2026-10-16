import { repositorioAnalises } from '../repositorios/repositorioAnalises.js';
import { repositorioEditais } from '../repositorios/repositorioEditais.js';
import { repositorioPerfis } from '../repositorios/repositorioPerfis.js';
import { repositorioRequisitos } from '../repositorios/repositorioRequisitos.js';
import { repositorioDocumentos } from '../repositorios/repositorioDocumentos.js';
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
    const documentos = await repositorioDocumentos.buscarTodos({ analise_id: id });
    const tarefas = await repositorioTarefas.buscarTodas({ analise_id: id });

    return {
      ...analise,
      requisitos,
      documentos,
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

    // 4. Salva os requisitos vinculados com seus procedimentos completos
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
      procedimento_detalhado: req.procedimento_detalhado || null,
      classificacao_fonte: req.classificacao_fonte || 'confirmado_edital',
      secao_edital: req.secao_edital || null,
      link_fonte_oficial: req.link_fonte_oficial || null,
      data_verificacao_externa: req.data_verificacao_externa || null,
      observacao_pendencia: req.observacao_pendencia || null,
    }));

    let requisitosCriados = [];
    if (requisitosParaSalvar.length > 0) {
      requisitosCriados = await repositorioRequisitos.criarVarios(requisitosParaSalvar);
    }

    // 5. Salva os documentos exigidos vinculados com tratamento individual
    const documentosParaSalvar = (resultadoIa.documentos || []).map((doc) => {
      // Tenta correlacionar com o requisito correspondente
      const reqVinculado = requisitosCriados.find(
        (r) =>
          (doc.requisito_relacionado && r.titulo.toLowerCase().includes(doc.requisito_relacionado.toLowerCase())) ||
          (doc.nome && r.titulo.toLowerCase().includes(doc.nome.toLowerCase())) ||
          (r.tipo === 'documento' && doc.nome.toLowerCase().includes(r.titulo.toLowerCase()))
      );

      return {
        analise_id: analiseSalva.id,
        requisito_id: reqVinculado ? reqVinculado.id : null,
        nome: doc.nome,
        finalidade: doc.finalidade || null,
        quem_fornece: doc.quem_fornece || null,
        orgao_emissor: doc.orgao_emissor || null,
        como_obter: doc.como_obter || null,
        documentos_alternativos: doc.documentos_alternativos || null,
        formato_aceito: doc.formato_aceito || null,
        exigencias_validade: doc.exigencias_validade || null,
        local_entrega: doc.local_entrega || null,
        url_entrega: doc.url_entrega || null,
        secao_entrega: doc.secao_entrega || null,
        etapa_processo: doc.etapa_processo || 'Inscrição Inicial',
        prazo_envio: doc.prazo_envio || edital.prazo_inscricao || null,
        prazo_envio_descricao: doc.prazo_envio_descricao || null,
        como_confirmar_envio: doc.como_confirmar_envio || null,
        instrucoes_protocolo: doc.instrucoes_protocolo || null,
        status_etapa: doc.status_etapa || 'pendente_obtencao',
        checklist_etapas: doc.checklist_etapas || {
          entender_necessidade: false,
          obter_documento: false,
          conferir_validade_formato: false,
          enviar_canal_correto: false,
          registrar_protocolo: false,
        },
        protocolo_comprovante: doc.protocolo_comprovante || null,
        classificacao_fonte: doc.classificacao_fonte || 'confirmado_edital',
        secao_edital: doc.secao_edital || null,
        pagina_origem: doc.pagina_origem || null,
        trecho_evidencia: doc.trecho_evidencia || null,
        link_fonte_oficial: doc.link_fonte_oficial || null,
        data_verificacao_externa: doc.data_verificacao_externa || null,
        observacao_pendencia: doc.observacao_pendencia || null,
      };
    });

    let documentosCriados = [];
    if (documentosParaSalvar.length > 0) {
      documentosCriados = await repositorioDocumentos.criarVarios(documentosParaSalvar);
    }

    // 6. Gera automaticamente as tarefas do plano de ação correspondentes
    const tarefasIniciais = [];

    // Tarefas para documentos individuais
    for (const doc of documentosCriados) {
      tarefasIniciais.push({
        analise_id: analiseSalva.id,
        requisito_id: doc.requisito_id || null,
        titulo: `Obter e conferir: ${doc.nome}`,
        descricao: `Emitir documento junto a ${doc.orgao_emissor || 'órgão competente'} (${doc.como_obter || 'conforme edital'}). Conferir formato (${doc.formato_aceito || 'PDF'}) e condições de validade (${doc.exigencias_validade || 'recente'}).`,
        data_limite: doc.prazo_envio || edital.prazo_inscricao || null,
        prioridade: 'alta',
        status: doc.status_etapa === 'conferido' || doc.status_etapa === 'obtido' ? 'em_andamento' : 'pendente',
      });
    }

    // Tarefas para requisitos de elegibilidade que demandam confirmação
    for (const req of requisitosCriados) {
      if (req.tipo === 'elegibilidade' && req.status_perfil === 'confirmar') {
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

    // Tarefa final de envio e protocolo
    tarefasIniciais.push({
      analise_id: analiseSalva.id,
      requisito_id: null,
      titulo: `Conferir checklist final e submeter inscrição: ${edital.titulo}`,
      descricao: 'Realizar a conferência de todos os anexos e submeter a inscrição no portal oficial do edital. Salvar e registrar o comprovante/protocolo.',
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
