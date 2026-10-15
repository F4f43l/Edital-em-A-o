import { repositorioPerfis } from '../repositorios/repositorioPerfis.js';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoPerfis = {
  async listarPerfis() {
    return repositorioPerfis.buscarTodos();
  },

  async buscarPerfilPorId(id) {
    const perfil = await repositorioPerfis.buscarPorId(id);
    if (!perfil) {
      throw new ErroAplicacao('Perfil de usuário não encontrado.', 404, 'PERFIL_NAO_ENCONTRADO');
    }
    return perfil;
  },

  async criarPerfil(dados) {
    return repositorioPerfis.criar(dados);
  },

  async atualizarPerfil(id, dados) {
    await this.buscarPerfilPorId(id);
    return repositorioPerfis.atualizar(id, dados);
  },

  async excluirPerfil(id) {
    await this.buscarPerfilPorId(id);
    const quantidadeAnalises = await repositorioPerfis.contarAnalisesDependentes(id);

    // O relacionamento com análises é configurado com ON DELETE SET NULL para preservar histórico
    const removido = await repositorioPerfis.excluir(id);
    return {
      sucesso: removido,
      analisesHistoricasPreservadas: quantidadeAnalises,
    };
  },
};
