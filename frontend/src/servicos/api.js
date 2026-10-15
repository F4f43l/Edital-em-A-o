/**
 * Cliente centralizado para consumo da API RESTful do Edital em Ação
 */
const URL_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function requisicao(endpoint, opcoes = {}) {
  const url = `${URL_BASE}${endpoint}`;
  const config = {
    ...opcoes,
    headers: {
      Accept: 'application/json',
      ...opcoes.headers,
    },
  };

  // Se o corpo não for FormData, converte para JSON e define o Content-Type
  if (config.body && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  try {
    const resposta = await fetch(url, config);

    // Resposta 204 No Content
    if (resposta.status === 204) {
      return null;
    }

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      const mensagemErro = dados?.error?.message || `Erro na requisição (código HTTP ${resposta.status}).`;
      const erro = new Error(mensagemErro);
      erro.codigo = dados?.error?.code || 'ERRO_DESCONHECIDO';
      erro.detalhes = dados?.error?.details || [];
      erro.statusHttp = resposta.status;
      throw erro;
    }

    return dados;
  } catch (erro) {
    if (erro.statusHttp) throw erro;
    console.error(`[FALHA DE REDE] ${endpoint}:`, erro.message);
    const erroRede = new Error('Não foi possível conectar ao servidor backend. Verifique se o servidor Node.js está em execução.');
    erroRede.codigo = 'ERRO_CONEXAO';
    throw erroRede;
  }
}

export const api = {
  // Saúde do sistema
  verificarSaude: () => requisicao('/health'),

  // Painel de Indicadores
  obterContadoresPainel: () => requisicao('/editais/contadores'),

  // Editais
  listarEditais: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.busca) params.append('busca', filtros.busca);
    const query = params.toString() ? `?${params.toString()}` : '';
    return requisicao(`/editais${query}`);
  },
  buscarEditalPorId: (id) => requisicao(`/editais/${id}`),
  criarEdital: (dados) => requisicao('/editais', { method: 'POST', body: dados }),
  atualizarEdital: (id, dados) => requisicao(`/editais/${id}`, { method: 'PUT', body: dados }),
  excluirEdital: (id) => requisicao(`/editais/${id}`, { method: 'DELETE' }),
  // Fluxo Principal com IA
  processarPdfInicial: (arquivo, perfilId = null) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    if (perfilId) formData.append('perfil_id', perfilId);
    return requisicao('/editais/processar-pdf', { method: 'POST', body: formData });
  },
  confirmarCadastroEdital: (dados) => requisicao('/editais/confirmar-cadastro', { method: 'POST', body: dados }),

  enviarPdfEdital: (id, arquivo) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return requisicao(`/editais/${id}/arquivo`, { method: 'POST', body: formData });
  },

  // Perfis
  listarPerfis: () => requisicao('/perfis'),
  buscarPerfilPorId: (id) => requisicao(`/perfis/${id}`),
  criarPerfil: (dados) => requisicao('/perfis', { method: 'POST', body: dados }),
  atualizarPerfil: (id, dados) => requisicao(`/perfis/${id}`, { method: 'PUT', body: dados }),
  excluirPerfil: (id) => requisicao(`/perfis/${id}`, { method: 'DELETE' }),

  // Análises
  listarAnalises: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.edital_id) params.append('edital_id', filtros.edital_id);
    if (filtros.perfil_id) params.append('perfil_id', filtros.perfil_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return requisicao(`/analises${query}`);
  },
  buscarAnalisePorId: (id) => requisicao(`/analises/${id}`),
  criarAnalise: (dados) => requisicao('/analises', { method: 'POST', body: dados }),
  atualizarAnalise: (id, dados) => requisicao(`/analises/${id}`, { method: 'PUT', body: dados }),
  obterResumoExclusaoAnalise: (id) => requisicao(`/analises/${id}/resumo-exclusao`),
  excluirAnalise: (id) => requisicao(`/analises/${id}`, { method: 'DELETE' }),

  // Requisitos da Análise
  listarRequisitosPorAnalise: (analiseId) => requisicao(`/analises/${analiseId}/requisitos`),
  criarRequisito: (analiseId, dados) => requisicao(`/analises/${analiseId}/requisitos`, { method: 'POST', body: dados }),
  atualizarRequisito: (id, dados) => requisicao(`/requisitos/${id}`, { method: 'PUT', body: dados }),
  excluirRequisito: (id) => requisicao(`/requisitos/${id}`, { method: 'DELETE' }),

  // Tarefas / Checklist
  listarTarefas: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.prioridade) params.append('prioridade', filtros.prioridade);
    if (filtros.analise_id) params.append('analise_id', filtros.analise_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return requisicao(`/tarefas${query}`);
  },
  buscarTarefaPorId: (id) => requisicao(`/tarefas/${id}`),
  criarTarefa: (dados) => requisicao('/tarefas', { method: 'POST', body: dados }),
  atualizarTarefa: (id, dados) => requisicao(`/tarefas/${id}`, { method: 'PUT', body: dados }),
  alterarStatusTarefa: (id, status) => requisicao(`/tarefas/${id}/status`, { method: 'PATCH', body: { status } }),
  alternarConclusaoTarefa: (id) => requisicao(`/tarefas/${id}/concluir`, { method: 'PATCH' }),
  excluirTarefa: (id) => requisicao(`/tarefas/${id}`, { method: 'DELETE' }),
};
