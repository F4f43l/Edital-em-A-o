import { app } from '../src/app.js';
import { configuracaoAmbiente } from '../src/configuracao/ambiente.js';
import { obterPoolConexoes } from '../src/configuracao/banco.js';

async function executarSuiteTestes() {
  console.log('====================================================');
  console.log('🧪 EXECUTANDO SUÍTE DE TESTES AUTOMATIZADOS (T1 - T8)');
  console.log('====================================================');

  const portaTeste = 3099;
  const servidor = app.listen(portaTeste);
  const urlBase = `http://localhost:${portaTeste}/api`;

  let falhas = 0;
  let sucessos = 0;

  async function testar(nome, funcao) {
    try {
      await funcao();
      console.log(`✅ [APROVADO] ${nome}`);
      sucessos++;
    } catch (erro) {
      console.error(`❌ [FALHA] ${nome}:`, erro.message);
      falhas++;
    }
  }

  try {
    // T0: Rota de Saúde e Conectividade
    await testar('T0: Rota GET /api/health responde com estado operacional', async () => {
      const resp = await fetch(`${urlBase}/health`);
      if (resp.status !== 200) throw new Error(`Status HTTP inesperado: ${resp.status}`);
      const dados = await resp.json();
      if (!dados.bancoDados?.conectado) throw new Error('Banco de dados não está conectado');
      if (dados.status !== 'operacional') throw new Error(`Status retornado: ${dados.status}`);
    });

    // T1: CRUD Edital
    let editalCriadoId = null;
    await testar('T1.1: Criar novo edital via POST /api/editais', async () => {
      const corpo = {
        titulo: '[TESTE UNITÁRIO] Edital de Monitoria Voluntária',
        instituicao: 'Departamento de Computação',
        categoria: 'Outro',
        resumo: 'Edital para seleção de monitores acadêmicos do semestre.',
        prazo_inscricao: '2026-11-20',
        status: 'ativo',
        texto_extraido: 'EDITAL DE MONITORIA 2026. Requisitos: Estar regularmente matriculado em curso de graduação. Ter obtido nota mínima 7,0. Prazo final: 20/11/2026.',
      };
      const resp = await fetch(`${urlBase}/editais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      if (resp.status !== 201) throw new Error(`Status ${resp.status}`);
      const dados = await resp.json();
      if (!dados.id || dados.titulo !== corpo.titulo) throw new Error('Edital criado não possui ID válido');
      editalCriadoId = dados.id;
    });

    await testar('T1.2: Editar edital via PUT /api/editais/:id', async () => {
      const resp = await fetch(`${urlBase}/editais/${editalCriadoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: '[TESTE ATUALIZADO] Edital de Monitoria Voluntária' }),
      });
      if (resp.status !== 200) throw new Error(`Status ${resp.status}`);
      const dados = await resp.json();
      if (dados.titulo !== '[TESTE ATUALIZADO] Edital de Monitoria Voluntária') {
        throw new Error('Título não atualizado');
      }
    });

    await testar('T1.3: Consultar edital via GET /api/editais/:id', async () => {
      const resp = await fetch(`${urlBase}/editais/${editalCriadoId}`);
      if (resp.status !== 200) throw new Error(`Status ${resp.status}`);
      const dados = await resp.json();
      if (dados.id !== editalCriadoId) throw new Error('ID divergente');
    });

    // T2: CRUD Perfil
    let perfilCriadoId = null;
    await testar('T2.1: Criar perfil de teste via POST /api/perfis', async () => {
      const corpo = {
        nome_exibicao: 'Estudante de Testes Automatizados',
        nivel_ensino: 'Graduação',
        instituicao: 'Universidade de Testes',
        curso: 'Sistemas de Informação',
        municipio: 'São Paulo',
        situacao_trabalho: 'Estudante',
        faixa_renda: 'Até 1,5 salário mínimo',
        tamanho_familia: 3,
      };
      const resp = await fetch(`${urlBase}/perfis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      if (resp.status !== 201) throw new Error(`Status ${resp.status}`);
      const dados = await resp.json();
      perfilCriadoId = dados.id;
    });

    await testar('T2.2: Criar perfil com campos opcionais nulos (respeito aos NULLs)', async () => {
      const corpo = {
        nome_exibicao: 'Candidato Mínimo Opcional',
      };
      const resp = await fetch(`${urlBase}/perfis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      if (resp.status !== 201) throw new Error(`Status ${resp.status}`);
      const dados = await resp.json();
      if (dados.nivel_ensino !== null && dados.nivel_ensino !== undefined) {
        throw new Error('Campo opcional deveria ser nulo');
      }
      // Remove perfil mínimo de teste
      await fetch(`${urlBase}/perfis/${dados.id}`, { method: 'DELETE' });
    });

    // T3: Análise e Geração de Checklist
    let analiseCriadaId = null;
    await testar('T3: Criar análise orientativa e gerar tarefas via POST /api/analises', async () => {
      const corpo = {
        edital_id: editalCriadoId,
        perfil_id: perfilCriadoId,
      };
      const resp = await fetch(`${urlBase}/analises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      if (resp.status !== 201) {
        const erroBody = await resp.text();
        throw new Error(`Status ${resp.status}: ${erroBody}`);
      }
      const analise = await resp.json();
      if (!analise.id) throw new Error('Análise criada não possui ID');
      if (!Array.isArray(analise.requisitos)) throw new Error('Requisitos não são um array');
      if (!Array.isArray(analise.tarefas)) throw new Error('Tarefas não são um array');
      analiseCriadaId = analise.id;
    });

    // T6: Operações de Tarefas / Checklist
    await testar('T6.1: Alternar conclusão de tarefa via PATCH /api/tarefas/:id/concluir', async () => {
      const respLista = await fetch(`${urlBase}/tarefas?analise_id=${analiseCriadaId}`);
      const tarefas = await respLista.json();
      if (!tarefas || tarefas.length === 0) throw new Error('Nenhuma tarefa foi gerada pela análise');

      const tarefaId = tarefas[0].id;
      const respConcluir = await fetch(`${urlBase}/tarefas/${tarefaId}/concluir`, { method: 'PATCH' });
      if (respConcluir.status !== 200) throw new Error(`Status ${respConcluir.status}`);
      const tarefaAtualizada = await respConcluir.json();
      if (tarefaAtualizada.status !== 'concluida') throw new Error('Tarefa não ficou concluída');
    });

    await testar('T6.2: Alterar status da atividade diretamente via PATCH /api/tarefas/:id/status (persiste no MySQL)', async () => {
      const respLista = await fetch(`${urlBase}/tarefas?analise_id=${analiseCriadaId}`);
      const tarefas = await respLista.json();
      const tarefaId = tarefas[0].id;

      // Testa transições para em_andamento, bloqueada e nao_se_aplica
      for (const novoStatus of ['em_andamento', 'bloqueada', 'nao_se_aplica', 'pendente']) {
        const resp = await fetch(`${urlBase}/tarefas/${tarefaId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: novoStatus }),
        });
        if (resp.status !== 200) throw new Error(`Falha ao alterar para ${novoStatus}: status HTTP ${resp.status}`);
        const tarefa = await resp.json();
        if (tarefa.status !== novoStatus) throw new Error(`Status esperado ${novoStatus}, recebido ${tarefa.status}`);

        // Consulta direta para atestar persistência no MySQL
        const respVerificacao = await fetch(`${urlBase}/tarefas/${tarefaId}`);
        const tarefaDb = await respVerificacao.json();
        if (tarefaDb.status !== novoStatus) {
          throw new Error(`Status não persistido no MySQL: esperado ${novoStatus}, obtido ${tarefaDb.status}`);
        }
      }
    });

    await testar('T6.3: Rejeitar status inválido com código HTTP 400', async () => {
      const respLista = await fetch(`${urlBase}/tarefas?analise_id=${analiseCriadaId}`);
      const tarefas = await respLista.json();
      const tarefaId = tarefas[0].id;

      const respInvalido = await fetch(`${urlBase}/tarefas/${tarefaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'status_inexistente_qualquer' }),
      });
      if (respInvalido.status !== 400) {
        throw new Error(`Deveria retornar 400, retornou HTTP ${respInvalido.status}`);
      }
    });

    // T7: Integridade e Exclusão em Cascata
    await testar('T7: Excluir análise e verificar exclusão em cascata de dependências', async () => {
      const respExcluir = await fetch(`${urlBase}/analises/${analiseCriadaId}`, { method: 'DELETE' });
      if (respExcluir.status !== 204) throw new Error(`Status ${respExcluir.status}`);

      // Verifica se requisitos órfãos foram removidos
      const pool = obterPoolConexoes();
      const [linhasReqs] = await pool.query('SELECT COUNT(*) as total FROM requisitos WHERE analise_id = ?', [analiseCriadaId]);
      if (linhasReqs[0].total > 0) throw new Error('Registros órfãos de requisitos ainda existem no banco');

      const [linhasTarefas] = await pool.query('SELECT COUNT(*) as total FROM tarefas WHERE analise_id = ?', [analiseCriadaId]);
      if (linhasTarefas[0].total > 0) throw new Error('Registros órfãos de tarefas ainda existem no banco');
    });

    // Limpeza dos dados de teste
    if (editalCriadoId) {
      await fetch(`${urlBase}/editais/${editalCriadoId}`, { method: 'DELETE' });
    }
    if (perfilCriadoId) {
      await fetch(`${urlBase}/perfis/${perfilCriadoId}`, { method: 'DELETE' });
    }

    console.log('====================================================');
    console.log(`📊 RESULTADO FINAL DOS TESTES: ${sucessos} Aprovados, ${falhas} Falhas.`);
    console.log('====================================================');
  } finally {
    const pool = obterPoolConexoes();
    try {
      await pool.end();
    } catch (_) {}
    servidor.close();
    if (falhas > 0) {
      process.exit(1);
    }
  }
}

executarSuiteTestes();
