import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { servicoExtracaoPdf } from '../src/servicos/servicoExtracaoPdf.js';
import { servicoInteligenciaArtificial } from '../src/servicos/servicoInteligenciaArtificial.js';
import { repositorioEditais } from '../src/repositorios/repositorioEditais.js';
import { repositorioAnalises } from '../src/repositorios/repositorioAnalises.js';
import { repositorioTarefas } from '../src/repositorios/repositorioTarefas.js';
import { servicoEditais } from '../src/servicos/servicoEditais.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executarTestesRegressao() {
  console.log('========================================================================');
  console.log('🧪 SUÍTE DE TESTES DE REGRESSÃO: TAXAS, TABELAS E FLUXO COMPLETO');
  console.log('========================================================================\n');

  let totalAprovados = 0;
  let totalFalhas = 0;

  function asserir(condicao, mensagemSucesso, mensagemErro) {
    if (condicao) {
      console.log(`✅ [APROVADO] ${mensagemSucesso}`);
      totalAprovados++;
    } else {
      console.error(`❌ [FALHA] ${mensagemErro}`);
      totalFalhas++;
    }
  }

  // ---------------------------------------------------------------------------
  // CENÁRIO 1 & 2: Edital Real (Edital primavera.pdf)
  // Extração de tabelas, colunas, valores monetários e associação por cargo/nível
  // ---------------------------------------------------------------------------
  console.log('🔹 CENÁRIO 1 & 2: Edital Real (Edital primavera.pdf) - Extração e Associação');
  const caminhoEditalReal = path.join(__dirname, '../uploads/Edital primavera.pdf');

  if (!fs.existsSync(caminhoEditalReal)) {
    console.error(`Arquivo não encontrado em: ${caminhoEditalReal}`);
    process.exit(1);
  }

  const resultadoExtracao = await servicoExtracaoPdf.extrairTextoPdf(caminhoEditalReal);

  asserir(
    resultadoExtracao.totalPaginas === 72,
    `Processamento integral de todas as 72 páginas e anexos (total: ${resultadoExtracao.totalPaginas})`,
    `Esperado 72 páginas, mas foram processadas apenas ${resultadoExtracao.totalPaginas}`
  );

  asserir(
    resultadoExtracao.paginas.length === 72,
    'Todas as páginas foram indexadas individualmente com metadados e números de página',
    'Array de páginas extraídas incompleto'
  );

  // Executa extração de taxas heurística avançada (independente de IA)
  const taxasExtraidas = servicoInteligenciaArtificial.extrairTabelaTaxasInscricao(resultadoExtracao.paginas, resultadoExtracao.textoExtraido);

  asserir(
    taxasExtraidas.possui_taxa === true,
    'Detecção precisa de existência de taxa de inscrição no edital',
    'Falha ao detectar taxa de inscrição no documento'
  );

  asserir(
    taxasExtraidas.tabela_taxas.length >= 25,
    `Extração de tabela discriminada com ${taxasExtraidas.tabela_taxas.length} cargos mapeados`,
    `Tabela incompleta: esperava pelo menos 25 cargos, obteve ${taxasExtraidas.tabela_taxas.length}`
  );

  // Verifica os 3 patamares de valores monetários
  const tem90 = taxasExtraidas.tabela_taxas.some((t) => t.valor === 'R$ 90,00');
  const tem120 = taxasExtraidas.tabela_taxas.some((t) => t.valor === 'R$ 120,00');
  const tem180 = taxasExtraidas.tabela_taxas.some((t) => t.valor === 'R$ 180,00');

  asserir(
    tem90 && tem120 && tem180,
    'Identificação de todos os valores monetários da tabela: R$ 90,00, R$ 120,00 e R$ 180,00',
    `Nem todos os valores monetários foram encontrados: R$ 90: ${tem90}, R$ 120: ${tem120}, R$ 180: ${tem180}`
  );

  // Verifica associação correta entre taxa e cargo
  const monitoramento = taxasExtraidas.tabela_taxas.find((t) => /monitoramento/i.test(t.cargo));
  const assistenteSocial = taxasExtraidas.tabela_taxas.find((t) => /assistente social/i.test(t.cargo));
  const medico = taxasExtraidas.tabela_taxas.find((t) => /médico/i.test(t.cargo));

  asserir(
    monitoramento && monitoramento.valor === 'R$ 90,00' && /médio/i.test(monitoramento.nivel),
    `Associação correta Nível Médio: ${monitoramento?.cargo} -> ${monitoramento?.valor} (${monitoramento?.nivel})`,
    `Associação incorreta para cargo de nível médio: ${JSON.stringify(monitoramento)}`
  );

  asserir(
    assistenteSocial && assistenteSocial.valor === 'R$ 120,00' && /superior/i.test(assistenteSocial.nivel),
    `Associação correta Nível Superior: ${assistenteSocial?.cargo} -> ${assistenteSocial?.valor} (${assistenteSocial?.nivel})`,
    `Associação incorreta para cargo superior: ${JSON.stringify(assistenteSocial)}`
  );

  asserir(
    medico && medico.valor === 'R$ 180,00',
    `Associação correta Nível Superior Médicos: ${medico?.cargo} -> ${medico?.valor}`,
    `Associação incorreta para médicos: ${JSON.stringify(medico)}`
  );

  asserir(
    taxasExtraidas.pagina_origem >= 31 && taxasExtraidas.pagina_origem <= 34,
    `Rastreabilidade da página de origem no Anexo I: Página ${taxasExtraidas.pagina_origem}`,
    `Página de origem incorreta: ${taxasExtraidas.pagina_origem}`
  );

  // ---------------------------------------------------------------------------
  // CENÁRIO 3: Leitura de tabelas com várias colunas e quebras de linha
  // ---------------------------------------------------------------------------
  console.log('\n🔹 CENÁRIO 3: Tabela com múltiplas colunas e quebras de linha');
  const textoTabelaQuebrada = `
ANEXO I - QUADRO DE CARGOS E TAXAS DE INSCRIÇÃO
[PÁGINA 10]
CÓDIGO | CARGO / FUNÇÃO                  | ESCOLARIDADE         | VAGAS | REMUNERAÇÃO | TAXA
01     | ANALISTA DE SISTEMAS            | SUPERIOR COMPLETO    | 02    | R$ 8.500,00 | R$ 130,00
       | COM ÊNFASE EM BANCO DE DADOS    |                      |       |             |
02     | AGENTE ADMINISTRATIVO           | ENSINO MÉDIO         | 10    | R$ 3.200,00 | R$ 80,00
       | DE SAÚDE PÚBLICA                | COMPLETO             |       |             |
03     | TÉCNICO EM ENFERMAGEM           | MÉDIO TÉCNICO        | 05    | R$ 3.800,00 | R$ 80,00
`;

  const extraidaQuebrada = servicoInteligenciaArtificial.extrairTabelaTaxasInscricao(textoTabelaQuebrada);

  asserir(
    extraidaQuebrada.tabela_taxas.length === 3,
    `Identificação correta de 3 cargos em tabela com quebras de linha multilinhas`,
    `Esperava 3 cargos, obteve ${extraidaQuebrada.tabela_taxas.length}`
  );

  const analista = extraidaQuebrada.tabela_taxas.find((t) => /analista/i.test(t.cargo));
  asserir(
    analista && analista.valor === 'R$ 130,00',
    `Associação em tabela com colunas adicionais (remuneração/vagas): ${analista?.cargo} -> ${analista?.valor}`,
    `Falha na extração de tabela multilinhas: ${JSON.stringify(analista)}`
  );

  // ---------------------------------------------------------------------------
  // CENÁRIO 4: Preservação de ponta a ponta (Extração -> IA/Regras -> API/DB)
  // ---------------------------------------------------------------------------
  console.log('\n🔹 CENÁRIO 4: Preservação de dados no MySQL e Geração de Tarefas de Checklist');

  // Cria edital e análise usando o serviço real
  const analiseHeuristica = servicoInteligenciaArtificial.extrairPorRegras(
    resultadoExtracao.textoExtraido,
    { escolaridade: 'superior', cargo_pretendido: 'Assistente Social' },
    resultadoExtracao.paginas
  );

  asserir(
    analiseHeuristica.custos_logistica.taxa_inscricao.taxa_perfil_candidato === 'R$ 120,00',
    `Taxa personalizada para o perfil do candidato (Assistente Social): ${analiseHeuristica.custos_logistica.taxa_inscricao.taxa_perfil_candidato}`,
    `Falha ao calcular taxa do perfil: ${analiseHeuristica.custos_logistica.taxa_inscricao.taxa_perfil_candidato}`
  );

  const editalCriado = await repositorioEditais.criar({
    titulo: 'Edital Primavera Teste Regressão',
    instituicao: 'Prefeitura de Primavera do Leste',
    categoria: 'Concurso Público',
    prazo_inscricao: '2026-08-30',
    prazo_recurso: '2026-09-05',
    data_resultado: '2026-11-20',
    texto_extraido: resultadoExtracao.textoCompleto.slice(0, 50000),
    custos_logistica: analiseHeuristica.custos_logistica,
  });

  const analiseCriada = await repositorioAnalises.criar({
    edital_id: editalCriado.id,
    resumo: 'Análise de regressão de taxas',
    resultado_orientativo: 'possivel_compatibilidade',
    status: 'concluida',
    provedor_ia: 'regras',
    modelo_ia: 'heuristica-v3',
    custos_logistica: analiseHeuristica.custos_logistica,
  });

  // Salva tarefas iniciais de pagamento e isenção via fluxo de confirmação com análise
  const respostaCriacao = await servicoEditais.confirmarCadastroComAnalise({
    edital: {
      titulo: 'Edital Primavera Teste Confirmado',
      instituicao: 'Prefeitura de Primavera do Leste',
      categoria: 'Concurso Público',
      prazo_inscricao: '2026-08-30',
      custos_logistica: analiseHeuristica.custos_logistica,
    },
    analise: {
      resumo: 'Análise de teste confirmada',
      resultado_orientativo: 'possivel_compatibilidade',
      custos_logistica: analiseHeuristica.custos_logistica,
    },
    requisitos: [],
    documentos: [],
  });

  // Consulta do MySQL
  const analiseConsultada = await repositorioAnalises.buscarPorId(analiseCriada.id);
  const custosPersistidos = analiseConsultada.custos_logistica;

  asserir(
    custosPersistidos && custosPersistidos.taxa_inscricao && custosPersistidos.taxa_inscricao.valor.includes('R$ 90,00'),
    'Preservação íntegra da estrutura de custos e taxas no banco MySQL',
    `Estrutura corrompida ou ausente no banco: ${JSON.stringify(custosPersistidos)}`
  );

  asserir(
    Array.isArray(custosPersistidos.taxa_inscricao.tabela_taxas) && custosPersistidos.taxa_inscricao.tabela_taxas.length > 0,
    `Preservação da tabela de taxas completa no MySQL (${custosPersistidos.taxa_inscricao.tabela_taxas.length} itens)`,
    'Tabela de taxas não foi persistida no JSON do MySQL'
  );

  // Verifica tarefas geradas
  const tarefasSalvas = await repositorioTarefas.buscarTodas({ analise_id: respostaCriacao.analise.id });
  const tarefaPagamento = tarefasSalvas.find((t) => /pagamento da taxa/i.test(t.titulo));
  const tarefaIsencao = tarefasSalvas.find((t) => /isenção da taxa/i.test(t.titulo));

  const formatarData = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d || '').slice(0, 10));
  const dataPagamentoStr = tarefaPagamento?.data_limite ? formatarData(tarefaPagamento.data_limite) : null;
  const dataIsencaoStr = tarefaIsencao?.data_limite ? formatarData(tarefaIsencao.data_limite) : null;

  asserir(
    tarefaPagamento && dataPagamentoStr === '2026-08-31',
    `Geração automática de tarefa de pagamento de taxa com vencimento correto (2026-08-31): "${tarefaPagamento?.titulo}"`,
    `Tarefa de pagamento incorreta: ${JSON.stringify(tarefaPagamento)}`
  );

  asserir(
    tarefaIsencao && dataIsencaoStr === '2026-07-10',
    `Geração automática de tarefa de isenção de taxa com prazo correto (2026-07-10): "${tarefaIsencao?.titulo}"`,
    `Tarefa de isenção incorreta: ${JSON.stringify(tarefaIsencao)}`
  );

  // Limpeza
  await repositorioEditais.excluir(editalCriado.id);
  await repositorioEditais.excluir(respostaCriacao.edital.id);

  // ---------------------------------------------------------------------------
  // CENÁRIO 5: Documento sem taxa / Gratuito / Totalmente ausente
  // ---------------------------------------------------------------------------
  console.log('\n🔹 CENÁRIO 5: Comportamento quando o edital é Gratuito ou Isento');
  const textoEditalGratuito = `
EDITAL DE SELEÇÃO PÚBLICA SIMPLIFICADA Nº 01/2026
DO PROCESSO DE INSCRIÇÃO
A inscrição será inteiramente gratuita, não sendo cobrada nenhuma taxa de participação dos candidatos.
Local das provas: Escola Municipal Central.
`;

  const analiseGratuita = servicoInteligenciaArtificial.extrairCustosLogisticaHeuristica(textoEditalGratuito);

  asserir(
    analiseGratuita.taxa_inscricao.possui_taxa === false && analiseGratuita.taxa_inscricao.valor === 'Gratuito',
    `Identificação correta de edital gratuito: possui_taxa = ${analiseGratuita.taxa_inscricao.possui_taxa}, valor = "${analiseGratuita.taxa_inscricao.valor}"`,
    `Falha no edital gratuito: ${JSON.stringify(analiseGratuita.taxa_inscricao)}`
  );

  const textoSemMencao = `
EDITAL N. 99/2026
DISPOSIÇÕES PRELIMINARES
O processo destina-se ao credenciamento de pareceristas culturais.
As avaliações serão realizadas de forma remota via parecer técnico.
`;

  const analiseSemMencao = servicoInteligenciaArtificial.extrairCustosLogisticaHeuristica(textoSemMencao);

  asserir(
    analiseSemMencao.taxa_inscricao.possui_taxa === null && analiseSemMencao.taxa_inscricao.valor === 'Não identificado no edital',
    `Documento sem menção a taxas retorna honestamente "Não identificado no edital" sem alucinar valores`,
    `Esperava não identificado, obteve: ${JSON.stringify(analiseSemMencao.taxa_inscricao)}`
  );

  // ---------------------------------------------------------------------------
  // CENÁRIO 6: Informações ambíguas no documento
  // ---------------------------------------------------------------------------
  console.log('\n🔹 CENÁRIO 6: Informações parciais ou ambíguas');
  const textoAmbiguo = `
EDITAL PRELIMINAR Nº 05/2026
TAXA DE INSCRIÇÃO
Os valores da taxa de inscrição serão regulamentados em edital complementar a ser divulgado no dia 15/12/2026.
`;

  const analiseAmbigua = servicoInteligenciaArtificial.extrairCustosLogisticaHeuristica(textoAmbiguo);

  asserir(
    analiseAmbigua.taxa_inscricao.possui_taxa === true &&
    (analiseAmbigua.taxa_inscricao.valor.toLowerCase().includes('complementar') ||
     analiseAmbigua.taxa_inscricao.valor.toLowerCase().includes('instruções')),
    `Identificação de menção a edital complementar sem inventar valores numéricos: "${analiseAmbigua.taxa_inscricao.valor}"`,
    `Falha no tratamento de texto ambíguo: ${JSON.stringify(analiseAmbigua.taxa_inscricao)}`
  );

  // ---------------------------------------------------------------------------
  // CENÁRIO 7: Fluxo alternativo quando IA indisponível
  // ---------------------------------------------------------------------------
  console.log('\n🔹 CENÁRIO 7: Fluxo alternativo por regras quando IA está indisponível');
  // Força simulação de indisponibilidade de IA chamando extrairPorRegras diretamente
  const analiseFluxoAlternativo = servicoInteligenciaArtificial.extrairPorRegras(
    resultadoExtracao.textoExtraido,
    null,
    resultadoExtracao.paginas
  );

  asserir(
    analiseFluxoAlternativo.provedor_ia === 'regras' &&
    analiseFluxoAlternativo.custos_logistica.taxa_inscricao.possui_taxa === true &&
    analiseFluxoAlternativo.custos_logistica.taxa_inscricao.tabela_taxas.length > 20,
    `Fluxo alternativo por regras extrai com sucesso tabela de ${analiseFluxoAlternativo.custos_logistica.taxa_inscricao.tabela_taxas.length} cargos com valores reais sem depender de API externa`,
    `Falha no fluxo alternativo: ${JSON.stringify(analiseFluxoAlternativo.custos_logistica.taxa_inscricao)}`
  );

  asserir(
    analiseFluxoAlternativo.prazo_inscricao === '2026-08-30',
    `Fluxo alternativo extrai prazo de inscrição correto: ${analiseFluxoAlternativo.prazo_inscricao}`,
    `Prazo de inscrição incorreto no fluxo alternativo: ${analiseFluxoAlternativo.prazo_inscricao}`
  );

  asserir(
    analiseFluxoAlternativo.custos_logistica.taxa_inscricao.prazo_pagamento === '2026-08-31',
    `Fluxo alternativo extrai vencimento do boleto normalizado: ${analiseFluxoAlternativo.custos_logistica.taxa_inscricao.prazo_pagamento}`,
    `Vencimento incorreto: ${analiseFluxoAlternativo.custos_logistica.taxa_inscricao.prazo_pagamento}`
  );

  asserir(
    analiseFluxoAlternativo.custos_logistica.isencao.prazo_solicitacao === '2026-07-10',
    `Fluxo alternativo extrai prazo de isenção normalizado: ${analiseFluxoAlternativo.custos_logistica.isencao.prazo_solicitacao}`,
    `Prazo de isenção incorreto: ${analiseFluxoAlternativo.custos_logistica.isencao.prazo_solicitacao}`
  );

  console.log('\n========================================================================');
  console.log(`📊 RESULTADO DOS TESTES DE REGRESSÃO: ${totalAprovados} Aprovados, ${totalFalhas} Falhas.`);
  console.log('========================================================================\n');

  if (totalFalhas > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

executarTestesRegressao().catch((err) => {
  console.error('Erro fatal nos testes de regressão:', err);
  process.exit(1);
});
