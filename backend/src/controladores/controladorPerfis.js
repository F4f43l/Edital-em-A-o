import { servicoPerfis } from '../servicos/servicoPerfis.js';
import { esquemaCriarPerfil, esquemaAtualizarPerfil } from '../validadores/validadorPerfis.js';

export const controladorPerfis = {
  async listar(req, res, next) {
    try {
      const perfis = await servicoPerfis.listarPerfis();
      return res.status(200).json(perfis);
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const perfil = await servicoPerfis.buscarPerfilPorId(parseInt(id, 10));
      return res.status(200).json(perfil);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const dadosValidados = esquemaCriarPerfil.parse(req.body);
      const novoPerfil = await servicoPerfis.criarPerfil(dadosValidados);
      return res.status(201).json(novoPerfil);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dadosValidados = esquemaAtualizarPerfil.parse(req.body);
      const perfilAtualizado = await servicoPerfis.atualizarPerfil(parseInt(id, 10), dadosValidados);
      return res.status(200).json(perfilAtualizado);
    } catch (erro) {
      next(erro);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await servicoPerfis.excluirPerfil(parseInt(id, 10));
      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  },
};
