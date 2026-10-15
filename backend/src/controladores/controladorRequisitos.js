import { servicoRequisitos } from '../servicos/servicoRequisitos.js';
import { esquemaCriarRequisito, esquemaAtualizarRequisito } from '../validadores/validadorRequisitos.js';

export const controladorRequisitos = {
  async listarPorAnalise(req, res, next) {
    try {
      const { id } = req.params;
      const requisitos = await servicoRequisitos.listarPorAnaliseId(parseInt(id, 10));
      return res.status(200).json(requisitos);
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const requisito = await servicoRequisitos.buscarRequisitoPorId(parseInt(id, 10));
      return res.status(200).json(requisito);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { id } = req.params;
      const dadosComAnalise = {
        ...req.body,
        analise_id: parseInt(id, 10),
      };
      const dadosValidados = esquemaCriarRequisito.parse(dadosComAnalise);
      const novoRequisito = await servicoRequisitos.criarRequisito(dadosValidados);
      return res.status(201).json(novoRequisito);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dadosValidados = esquemaAtualizarRequisito.parse(req.body);
      const requisitoAtualizado = await servicoRequisitos.atualizarRequisito(parseInt(id, 10), dadosValidados);
      return res.status(200).json(requisitoAtualizado);
    } catch (erro) {
      next(erro);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      await servicoRequisitos.excluirRequisito(parseInt(id, 10));
      return res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  },
};
