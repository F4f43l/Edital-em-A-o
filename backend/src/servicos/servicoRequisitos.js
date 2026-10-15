import { repositorioRequisitos } from '../repositorios/repositorioRequisitos.js';
import { repositorioAnalises } from '../repositorios/repositorioAnalises.js';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoRequisitos = {
  async listarPorAnaliseId(analiseId) {
    const analise = await repositorioAnalises.buscarPorId(analiseId);
    if (!analise) {
      throw new ErroAplicacao('Análise não encontrada para listar requisitos.', 404, 'ANALISE_NAO_ENCONTRADA');
    }
    return repositorioRequisitos.buscarPorAnaliseId(analiseId);
  },

  async buscarRequisitoPorId(id) {
    const requisito = await repositorioRequisitos.buscarPorId(id);
    if (!requisito) {
      throw new ErroAplicacao('Requisito não encontrado.', 404, 'REQUISITO_NAO_ENCONTRADO');
    }
    return requisito;
  },

  async criarRequisito(dados) {
    const analise = await repositorioAnalises.buscarPorId(dados.analise_id);
    if (!analise) {
      throw new ErroAplicacao('Análise informada para o requisito não foi encontrada.', 404, 'ANALISE_NAO_ENCONTRADA');
    }
    return repositorioRequisitos.criar({
      ...dados,
      origem_dado: dados.origem_dado || 'manual',
    });
  },

  async atualizarRequisito(id, dados) {
    await this.buscarRequisitoPorId(id);
    return repositorioRequisitos.atualizar(id, dados);
  },

  async excluirRequisito(id) {
    await this.buscarRequisitoPorId(id);
    return repositorioRequisitos.excluir(id);
  },
};
