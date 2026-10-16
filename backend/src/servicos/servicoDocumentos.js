import { repositorioDocumentos } from '../repositorios/repositorioDocumentos.js';
import { repositorioAnalises } from '../repositorios/repositorioAnalises.js';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoDocumentos = {
  async listarDocumentos(filtros) {
    return repositorioDocumentos.buscarTodos(filtros);
  },

  async buscarDocumentoPorId(id) {
    const doc = await repositorioDocumentos.buscarPorId(id);
    if (!doc) {
      throw new ErroAplicacao('Documento exigido não encontrado.', 404, 'DOCUMENTO_NAO_ENCONTRADO');
    }
    return doc;
  },

  async criarDocumento(dados) {
    const analise = await repositorioAnalises.buscarPorId(dados.analise_id);
    if (!analise) {
      throw new ErroAplicacao('Análise informada não existe.', 404, 'ANALISE_NAO_ENCONTRADA');
    }
    return repositorioDocumentos.criar(dados);
  },

  async atualizarDocumento(id, dados) {
    await this.buscarDocumentoPorId(id);
    return repositorioDocumentos.atualizar(id, dados);
  },

  async atualizarStatusEtapa(id, statusEtapa) {
    const doc = await this.buscarDocumentoPorId(id);

    // Validação de integridade de negócio:
    // Se o usuário tentar marcar recebimento_confirmado sem protocolo ou comprovante,
    // permitimos mas mantemos a clareza de registro.
    return repositorioDocumentos.atualizarStatusEtapa(id, statusEtapa);
  },

  async atualizarChecklist(id, checklistEtapas) {
    const doc = await this.buscarDocumentoPorId(id);

    const checklistAtual = typeof doc.checklist_etapas === 'string'
      ? JSON.parse(doc.checklist_etapas || '{}')
      : (doc.checklist_etapas || {});

    const checklistMesclada = {
      ...checklistAtual,
      ...checklistEtapas,
    };

    // Sincronização inteligente de status baseada nas etapas da checklist:
    // 1. entender_necessidade
    // 2. obter_documento -> status pelo menos 'obtido'
    // 3. conferir_validade_formato -> status pelo menos 'conferido'
    // 4. enviar_canal_correto -> status pelo menos 'enviado'
    // 5. registrar_protocolo -> status 'recebimento_confirmado' (com comprovante)
    // NOTA: 'validado_instituicao' NUNCA é assumido automaticamente pela checklist (exigência da especificação)
    let novoStatusEtapa = doc.status_etapa;

    if (doc.status_etapa !== 'validado_instituicao') {
      if (checklistMesclada.registrar_protocolo && checklistMesclada.enviar_canal_correto) {
        novoStatusEtapa = 'recebimento_confirmado';
      } else if (checklistMesclada.enviar_canal_correto) {
        novoStatusEtapa = 'enviado';
      } else if (checklistMesclada.conferir_validade_formato) {
        novoStatusEtapa = 'conferido';
      } else if (checklistMesclada.obter_documento) {
        novoStatusEtapa = 'obtido';
      } else if (novoStatusEtapa !== 'pendente_obtencao' && !checklistMesclada.obter_documento) {
        novoStatusEtapa = 'pendente_obtencao';
      }
    }

    if (novoStatusEtapa !== doc.status_etapa) {
      await repositorioDocumentos.atualizarStatusEtapa(id, novoStatusEtapa);
    }

    return repositorioDocumentos.atualizarChecklist(id, checklistMesclada);
  },

  async atualizarProtocolo(id, protocoloComprovante) {
    await this.buscarDocumentoPorId(id);
    return repositorioDocumentos.atualizarProtocolo(id, protocoloComprovante);
  },

  async excluirDocumento(id) {
    await this.buscarDocumentoPorId(id);
    return repositorioDocumentos.excluir(id);
  },
};
