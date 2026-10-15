import { servicoEditais } from '../servicos/servicoEditais.js';
import { esquemaCriarEdital, esquemaAtualizarEdital } from '../validadores/validadorEditais.js';

export const controladorEditais = {
  async listar(req, res, next) {
    try {
      const { status, categoria, busca } = req.query;
      const editais = await servicoEditais.listarEditais({ status, categoria, busca });
      return res.status(200).json(editais);
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const edital = await servicoEditais.buscarEditalPorId(parseInt(id, 10));
      return res.status(200).json(edital);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const dadosValidados = esquemaCriarEdital.parse(req.body);
      const novoEdital = await servicoEditais.criarEdital(dadosValidados);
      return res.status(201).json(novoEdital);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dadosValidados = esquemaAtualizarEdital.parse(req.body);
      const editalAtualizado = await servicoEditais.atualizarEdital(parseInt(id, 10), dadosValidados);
      return res.status(200).json(editalAtualizado);
    } catch (erro) {
      next(erro);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      await servicoEditais.excluirEdital(parseInt(id, 10));
      return res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  },

  /**
   * FLUXO PRINCIPAL: Processa o PDF e retorna os dados extraídos para revisão
   */
  async processarPdfInicial(req, res, next) {
    try {
      const perfilId = req.body?.perfil_id || null;
      const resultado = await servicoEditais.processarPdfInicial(req.file, perfilId);
      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  },

  /**
   * FLUXO PRINCIPAL: Confirma os dados revisados pelo usuário e salva edital, análise e tarefas
   */
  async confirmarCadastro(req, res, next) {
    try {
      const resultado = await servicoEditais.confirmarCadastroComAnalise(req.body);
      return res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  },

  async uploadPdf(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await servicoEditais.processarUploadPdf(parseInt(id, 10), req.file);
      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  },

  async obterContadores(req, res, next) {
    try {
      const contadores = await servicoEditais.obterResumoPainel();
      return res.status(200).json(contadores);
    } catch (erro) {
      next(erro);
    }
  },
};
