import { repositorioTarefas } from '../repositorios/repositorioTarefas.js';
import { repositorioAnalises } from '../repositorios/repositorioAnalises.js';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoTarefas = {
  async listarTarefas(filtros) {
    return repositorioTarefas.buscarTodas(filtros);
  },

  async buscarTarefaPorId(id) {
    const tarefa = await repositorioTarefas.buscarPorId(id);
    if (!tarefa) {
      throw new ErroAplicacao('Tarefa não encontrada.', 404, 'TAREFA_NAO_ENCONTRADA');
    }
    return tarefa;
  },

  async criarTarefa(dados) {
    const analise = await repositorioAnalises.buscarPorId(dados.analise_id);
    if (!analise) {
      throw new ErroAplicacao('Análise informada para a tarefa não foi encontrada.', 404, 'ANALISE_NAO_ENCONTRADA');
    }
    return repositorioTarefas.criar(dados);
  },

  async atualizarTarefa(id, dados) {
    await this.buscarTarefaPorId(id);
    return repositorioTarefas.atualizar(id, dados);
  },

  async alternarConclusao(id) {
    const tarefa = await this.buscarTarefaPorId(id);
    const novoStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
    return repositorioTarefas.atualizar(id, { status: novoStatus });
  },

  async alterarStatus(id, novoStatus) {
    await this.buscarTarefaPorId(id);
    return repositorioTarefas.atualizar(id, { status: novoStatus });
  },

  async excluirTarefa(id) {
    await this.buscarTarefaPorId(id);
    return repositorioTarefas.excluir(id);
  },
};
