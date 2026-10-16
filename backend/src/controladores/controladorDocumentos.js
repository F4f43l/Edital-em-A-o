import { servicoDocumentos } from '../servicos/servicoDocumentos.js';
import {
  esquemaCriarDocumento,
  esquemaAtualizarDocumento,
  esquemaAtualizarStatusEtapa,
  esquemaAtualizarChecklist,
  esquemaAtualizarProtocolo,
} from '../validadores/validadorDocumentos.js';

export const controladorDocumentos = {
  async listarDocumentos(req, res, next) {
    try {
      const filtros = {
        analise_id: req.params.analiseId ? parseInt(req.params.analiseId, 10) : req.query.analise_id ? parseInt(req.query.analise_id, 10) : undefined,
        requisito_id: req.query.requisito_id ? parseInt(req.query.requisito_id, 10) : undefined,
        status_etapa: req.query.status_etapa || undefined,
      };
      const documentos = await servicoDocumentos.listarDocumentos(filtros);
      return res.json(documentos);
    } catch (erro) {
      return next(erro);
    }
  },

  async buscarDocumentoPorId(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const documento = await servicoDocumentos.buscarDocumentoPorId(id);
      return res.json(documento);
    } catch (erro) {
      return next(erro);
    }
  },

  async criarDocumento(req, res, next) {
    try {
      const analiseId = req.params.analiseId ? parseInt(req.params.analiseId, 10) : req.body.analise_id;
      const dadosValidados = esquemaCriarDocumento.parse({
        ...req.body,
        analise_id: analiseId,
      });
      const novoDocumento = await servicoDocumentos.criarDocumento(dadosValidados);
      return res.status(201).json(novoDocumento);
    } catch (erro) {
      return next(erro);
    }
  },

  async atualizarDocumento(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const dadosValidados = esquemaAtualizarDocumento.parse(req.body);
      const documentoAtualizado = await servicoDocumentos.atualizarDocumento(id, dadosValidados);
      return res.json(documentoAtualizado);
    } catch (erro) {
      return next(erro);
    }
  },

  async atualizarStatusEtapa(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status_etapa } = esquemaAtualizarStatusEtapa.parse(req.body);
      const documentoAtualizado = await servicoDocumentos.atualizarStatusEtapa(id, status_etapa);
      return res.json(documentoAtualizado);
    } catch (erro) {
      return next(erro);
    }
  },

  async atualizarChecklist(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { checklist_etapas } = esquemaAtualizarChecklist.parse(req.body);
      const documentoAtualizado = await servicoDocumentos.atualizarChecklist(id, checklist_etapas);
      return res.json(documentoAtualizado);
    } catch (erro) {
      return next(erro);
    }
  },

  async atualizarProtocolo(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { protocolo_comprovante } = esquemaAtualizarProtocolo.parse(req.body);
      const documentoAtualizado = await servicoDocumentos.atualizarProtocolo(id, protocolo_comprovante);
      return res.json(documentoAtualizado);
    } catch (erro) {
      return next(erro);
    }
  },

  async excluirDocumento(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await servicoDocumentos.excluirDocumento(id);
      return res.status(204).send();
    } catch (erro) {
      return next(erro);
    }
  },
};
