import { servicoAnalises } from '../servicos/servicoAnalises.js';
import { esquemaCriarAnalise, esquemaAtualizarAnalise } from '../validadores/validadorAnalises.js';

export const controladorAnalises = {
  async listar(req, res, next) {
    try {
      const { edital_id, perfil_id } = req.query;
      const analises = await servicoAnalises.listarAnalises({
        edital_id: edital_id ? parseInt(edital_id, 10) : undefined,
        perfil_id: perfil_id ? parseInt(perfil_id, 10) : undefined,
      });
      return res.status(200).json(analises);
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const analise = await servicoAnalises.buscarAnalisePorId(parseInt(id, 10));
      return res.status(200).json(analise);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const dadosValidados = esquemaCriarAnalise.parse(req.body);
      const novaAnalise = await servicoAnalises.criarAnalise(dadosValidados);
      return res.status(201).json(novaAnalise);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dadosValidados = esquemaAtualizarAnalise.parse(req.body);
      const analiseAtualizada = await servicoAnalises.atualizarAnalise(parseInt(id, 10), dadosValidados);
      return res.status(200).json(analiseAtualizada);
    } catch (erro) {
      next(erro);
    }
  },

  async resumoExclusao(req, res, next) {
    try {
      const { id } = req.params;
      const resumo = await servicoAnalises.obterResumoExclusao(parseInt(id, 10));
      return res.status(200).json(resumo);
    } catch (erro) {
      next(erro);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      await servicoAnalises.excluirAnalise(parseInt(id, 10));
      return res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  },
};
