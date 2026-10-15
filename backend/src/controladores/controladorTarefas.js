import { servicoTarefas } from '../servicos/servicoTarefas.js';
import {
  esquemaCriarTarefa,
  esquemaAtualizarTarefa,
  esquemaAlterarStatusTarefa,
} from '../validadores/validadorTarefas.js';

export const controladorTarefas = {
  async listar(req, res, next) {
    try {
      const { status, prioridade, analise_id } = req.query;
      const tarefas = await servicoTarefas.listarTarefas({
        status,
        prioridade,
        analise_id: analise_id ? parseInt(analise_id, 10) : undefined,
      });
      return res.status(200).json(tarefas);
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const tarefa = await servicoTarefas.buscarTarefaPorId(parseInt(id, 10));
      return res.status(200).json(tarefa);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const dadosValidados = esquemaCriarTarefa.parse(req.body);
      const novaTarefa = await servicoTarefas.criarTarefa(dadosValidados);
      return res.status(201).json(novaTarefa);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dadosValidados = esquemaAtualizarTarefa.parse(req.body);
      const tarefaAtualizada = await servicoTarefas.atualizarTarefa(parseInt(id, 10), dadosValidados);
      return res.status(200).json(tarefaAtualizada);
    } catch (erro) {
      next(erro);
    }
  },

  async alternarStatus(req, res, next) {
    try {
      const { id } = req.params;
      const tarefaAtualizada = await servicoTarefas.alternarConclusao(parseInt(id, 10));
      return res.status(200).json(tarefaAtualizada);
    } catch (erro) {
      next(erro);
    }
  },

  async alterarStatusRapido(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = esquemaAlterarStatusTarefa.parse(req.body);
      const tarefaAtualizada = await servicoTarefas.alterarStatus(parseInt(id, 10), status);
      return res.status(200).json(tarefaAtualizada);
    } catch (erro) {
      next(erro);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      await servicoTarefas.excluirTarefa(parseInt(id, 10));
      return res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  },
};
