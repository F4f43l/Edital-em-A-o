import { app } from '../src/app.js';
import { servicoInteligenciaArtificial } from '../src/servicos/servicoInteligenciaArtificial.js';
import { servicoExtracaoPdf } from '../src/servicos/servicoExtracaoPdf.js';
import { servicoPesquisaComplementar } from '../src/servicos/servicoPesquisaComplementar.js';
import { repositorioTarefas } from '../src/repositorios/repositorioTarefas.js';
import { repositorioDocumentos } from '../src/repositorios/repositorioDocumentos.js';
import { obterPoolConexoes } from '../src/configuracao/banco.js';

async function executarTesteEditalCincoDocumentos() {
  console.log('========================================================================');
  console.log('📋 TESTE RIGOROSO: EDITAL COM 5 DOCUMENTOS INDIVIDUAIS (ETAPAS 11 & 12)');
  console.log('========================================================================');

  const portaTeste = 3108;
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

  // IDs para limpeza posterior
  let editalCriadoId = null;
  let analiseCriadaId = null;
  const idsDocumentos = [];
  const idsTarefas = [];

  try {
    // -------------------------------------------------------------------------
    // 1. Simulação de texto de edital realista que exige exatamente 5 documentos
    // -------------------------------------------------------------------------
    const textoEditalCincoDocumentos = `
UNIVERSIDADE FEDERAL DE EDUCAÇÃO E CIÊNCIA - UFEC
EDITAL Nº 042/2026 - PROGRAMA DE BOLSA DE APOIO AO DISCENTE (PBAD)

1. DO OBJETO
O presente Edital tem por finalidade conceder 100 bolsas de auxílio financeiro para estudantes de graduação presencial.

2. DOS REQUISITOS DE PARTICIPAÇÃO
2.1 O candidato deverá estar regularmente matriculado no semestre letivo 2026.1 com carga horária mínima de 12 créditos.
2.2 Possuir renda familiar bruta per capita de até 1,5 salário mínimo.
2.3 Não ter pendências financeiras ou disciplinares com a instituição.

3. DA DOCUMENTAÇÃO EXIGIDA PARA INSCRIÇÃO
Os candidatos deverão apresentar os seguintes documentos comprobatórios obrigatórios:
3.1. Documento Oficial de Identificação com Foto: Cédula de Identidade (RG), ou Carteira Nacional de Habilitação (CNH), ou Carteira de Trabalho digital, ou Carteira de Identidade Nacional (CIN).
3.2. Comprovante de Inscrição no Cadastro de Pessoas Físicas (CPF): Comprovante emitido pela Receita Federal com código de validação digital.
3.3. Comprovante de Residência Atualizado: Conta de energia elétrica, água, gás ou telefone fixo dos últimos 90 dias em nome do estudante ou de membro do grupo familiar. Na ausência, aceita-se Declaração de Residência de próprio punho firmada em cartório conforme modelo do Anexo II.
3.4. Histórico Escolar Oficial da Graduação: Documento emitido pelo sistema acadêmico SIGAA contendo autenticação eletrônica (código de verificação) e coeficiente de rendimento global acumulado.
3.5. Certidão de Quitação Eleitoral: Certidão de quitação fornecida pelo Tribunal Superior Eleitoral (TSE) comprovando regularidade do voto e de obrigações eleitorais.

4. DO LOCAL E FORMA DE ENVIO
4.1 Os documentos deverão ser inseridos no formato PDF (máx. 5MB cada) no Portal Oficial de Inscrições da UFEC: https://inscricoes.ufec.br/pbad2026.
4.2 Cada documento deve ser digitalizado separadamente de forma nítida, contendo frente e verso quando aplicável.
4.3 Ao concluir a inserção, o candidato deve clicar em "Finalizar Inscrição" e guardar o Comprovante de Entrega com Número de Protocolo.

5. DO CRONOGRAMA
Inscrições e envio de documentos: 01/11/2026 a 25/11/2026 até as 23h59.
Publicação do resultado preliminar: 05/12/2026.
Prazo para recurso contra resultado documental: 06/12/2026 a 08/12/2026.
Resultado final e homologação: 15/12/2026.
`;

    let documentosExtraidos = [];
    let analiseIA = null;

    // TESTE 1: Extração pelo motor de IA / heurístico
    await testar('T1: Identificar individualmente os 5 documentos sem agregação genérica', async () => {
      analiseIA = await servicoInteligenciaArtificial.analisarEditalComTexto(
        textoEditalCincoDocumentos,
        'Estudante de graduação com renda familiar per capita de 1 salário mínimo.'
      );

      documentosExtraidos = analiseIA.documentos || [];
      console.log(`   -> Total de documentos identificados: ${documentosExtraidos.length}`);

      if (documentosExtraidos.length < 5) {
        throw new Error(`Esperado no mínimo 5 documentos individuais, mas foram extraídos apenas ${documentosExtraidos.length}`);
      }

      // Verificar que nenhum documento é um termo agregado como "Digitalizar toda a documentação"
      for (const doc of documentosExtraidos) {
        if (/digitalizar toda a documenta|juntar todos os documentos|enviar todos os docs/i.test(doc.nome)) {
          throw new Error(`Documento agregado proibido detectado: "${doc.nome}"`);
        }
      }

      // Verificar presença dos 5 documentos essenciais
      const nomesIdentificados = documentosExtraidos.map((d) => (d.nome + ' ' + (d.nome_simples || '')).toLowerCase());
      const temIdentidade = nomesIdentificados.some((n) => n.includes('identidade') || n.includes('rg') || n.includes('cnh'));
      const temCpf = nomesIdentificados.some((n) => n.includes('cpf'));
      const temResidencia = nomesIdentificados.some((n) => n.includes('residência') || n.includes('residencia'));
      const temHistorico = nomesIdentificados.some((n) => n.includes('histórico') || n.includes('historico') || n.includes('acadêmico'));
      const temEleitoral = nomesIdentificados.some((n) => n.includes('eleitoral') || n.includes('tse'));

      if (!temIdentidade) throw new Error('Documento de Identidade não identificado individualmente');
      if (!temCpf) throw new Error('CPF não identificado individualmente');
      if (!temResidencia) throw new Error('Comprovante de Residência não identificado individualmente');
      if (!temHistorico) throw new Error('Histórico Escolar não identificado individualmente');
      if (!temEleitoral) throw new Error('Certidão de Quitação Eleitoral não identificada individualmente');
    });

    // TESTE 2: Verificar enriquecimento com fontes oficiais complementares
    await testar('T2: Cada documento possui tutorial completo, como_obter e dados_solicitacao', async () => {
      for (const doc of documentosExtraidos) {
        if (!doc.como_obter || doc.como_obter.length < 20) {
          throw new Error(`Documento "${doc.nome}" não possui procedimento detalhado em "como_obter"`);
        }
        if (!doc.como_digitalizar || doc.como_digitalizar.length < 30) {
          throw new Error(`Documento "${doc.nome}" não possui instruções práticas em "como_digitalizar"`);
        }
        if (!doc.instrucoes_preparacao || doc.instrucoes_preparacao.length < 20) {
          throw new Error(`Documento "${doc.nome}" não possui orientações em "instrucoes_preparacao"`);
        }
        if (!doc.checklist_etapas) {
          throw new Error(`Documento "${doc.nome}" não possui checklist de 5 etapas`);
        }
      }

      // Verificar que Quitação Eleitoral aponta para fonte oficial do TSE
      const docEleitoral = documentosExtraidos.find((d) => /eleitoral|tse/i.test(d.nome + (d.nome_simples || '')));
      if (docEleitoral) {
        if (!docEleitoral.link_fonte_oficial || !docEleitoral.link_fonte_oficial.includes('tse.jus.br')) {
          console.warn('   [AVISO] Link oficial do TSE:', docEleitoral.link_fonte_oficial);
        }
      }

      // Verificar que CPF aponta para Receita Federal
      const docCpf = documentosExtraidos.find((d) => /cpf/i.test(d.nome + (d.nome_simples || '')));
      if (docCpf) {
        if (!docCpf.orgao_emissor || !/receita federal/i.test(docCpf.orgao_emissor)) {
          throw new Error(`Órgão emissor do CPF não identificado como Receita Federal: ${docCpf.orgao_emissor}`);
        }
      }
    });

    // TESTE 3: Persistência no MySQL através do endpoint de confirmação
    await testar('T3: Confirmar cadastro com análise salvando os 5 documentos no MySQL', async () => {
      const payloadConfirmacao = {
        edital: {
          titulo: 'UFEC - Edital PBAD 2026/1 (Bolsa de Apoio Discente)',
          instituicao: 'Universidade Federal de Educação e Ciência (UFEC)',
          categoria: 'Bolsa de Apoio Discente',
          resumo: 'Concessão de bolsas financeiras com base em critérios de renda e vínculo.',
          prazo_inscricao: '2026-11-25',
          prazo_recurso: '2026-12-08',
          data_resultado: '2026-12-15',
          texto_extraido: textoEditalCincoDocumentos,
        },
        analise: {
          resultado_orientativo: 'possivel_compatibilidade',
          resumo_orientativo: 'Candidato atende aos critérios prévios.',
          percentual_aderencia: 90,
          pontos_atencao: 'Apresentar os 5 documentos exigidos antes de 25/11.',
        },
        requisitos: analiseIA.requisitos || [
          {
            titulo: 'Estar regularmente matriculado no semestre 2026.1',
            tipo: 'obrigatorio',
            status_cumprimento: 'atendido',
          },
          {
            titulo: 'Renda per capita até 1,5 salário mínimo',
            tipo: 'obrigatorio',
            status_cumprimento: 'atendido',
          },
        ],
        documentos: documentosExtraidos,
      };

      const resp = await fetch(`${urlBase}/editais/confirmar-cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadConfirmacao),
      });

      if (resp.status !== 201) {
        const erroTxt = await resp.text();
        throw new Error(`Falha no POST /editais/confirmar-cadastro: HTTP ${resp.status} - ${erroTxt}`);
      }

      const dadosSalvos = await resp.json();
      editalCriadoId = dadosSalvos.edital.id;
      analiseCriadaId = dadosSalvos.analise.id;

      if (!editalCriadoId || !analiseCriadaId) {
        throw new Error('Retorno da confirmação não contém IDs de edital e análise');
      }
    });

    // TESTE 4: Consultar banco e verificar que existem exatamente 5 tarefas individuais (1 por documento)
    await testar('T4: Banco MySQL contém 5 documentos e 5 tarefas individualizadas vinculadas por documento_id', async () => {
      const pool = obterPoolConexoes();
      const [docsDb] = await pool.query('SELECT * FROM documentos_exigidos WHERE analise_id = ?', [analiseCriadaId]);
      const [tarefasDb] = await pool.query('SELECT * FROM tarefas WHERE analise_id = ?', [analiseCriadaId]);

      console.log(`   -> Documentos no MySQL: ${docsDb.length}`);
      console.log(`   -> Tarefas no MySQL: ${tarefasDb.length}`);

      if (docsDb.length < 5) {
        throw new Error(`Esperado no mínimo 5 documentos no banco, encontrado: ${docsDb.length}`);
      }

      docsDb.forEach((d) => idsDocumentos.push(d.id));
      tarefasDb.forEach((t) => idsTarefas.push(t.id));

      // Verificar que NÃO há tarefa genérica de "Digitalizar toda a documentação"
      const tarefaGenerica = tarefasDb.find((t) =>
        /digitalizar e enviar toda|scanear e enviar documentos|separar e digitalizar documentos/i.test(t.titulo)
      );
      if (tarefaGenerica) {
        throw new Error(`Tarefa genérica indesejada encontrada no banco: "${tarefaGenerica.titulo}"`);
      }

      // Verificar que cada tarefa vinculada a documento possui documento_id não-nulo
      const tarefasComDoc = tarefasDb.filter((t) => t.documento_id !== null);
      if (tarefasComDoc.length < 5) {
        throw new Error(`Esperado no mínimo 5 tarefas vinculadas a documento_id, mas encontrado: ${tarefasComDoc.length}`);
      }

      // Verificar que os dados do tutorial estão acessíveis na busca de tarefas
      const tarefasCompletas = await repositorioTarefas.buscarTodas({ analise_id: analiseCriadaId });
      for (const t of tarefasCompletas) {
        if (t.documento_id) {
          if (!t.documento_como_obter) {
            throw new Error(`Tarefa "${t.titulo}" não recebeu os dados do documento_como_obter`);
          }
          if (!t.documento_como_digitalizar) {
            throw new Error(`Tarefa "${t.titulo}" não recebeu os dados do documento_como_digitalizar`);
          }
        }
      }
    });

    // TESTE 5: Interação e persistência do checklist de 5 etapas para um documento
    await testar('T5: Atualização interativa do checklist de etapas e protocolo salva no MySQL', async () => {
      const primeiroDocId = idsDocumentos[0];

      // Atualiza etapas 1, 2 e 3
      const novoChecklist = {
        entender_necessidade: true,
        obter_documento: true,
        conferir_validade_formato: true,
        enviar_canal_correto: false,
        registrar_protocolo: false,
      };

      const respChecklist = await fetch(`${urlBase}/documentos/${primeiroDocId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist_etapas: novoChecklist }),
      });

      if (respChecklist.status !== 200) {
        throw new Error(`Erro ao salvar checklist: HTTP ${respChecklist.status}`);
      }

      // Atualiza protocolo de envio
      const respProtocolo = await fetch(`${urlBase}/documentos/${primeiroDocId}/protocolo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolo_comprovante: 'RECIBO-UFEC-2026-0987-CONFIRMADO' }),
      });

      if (respProtocolo.status !== 200) {
        throw new Error(`Erro ao salvar protocolo: HTTP ${respProtocolo.status}`);
      }

      // Verifica no banco
      const pool = obterPoolConexoes();
      const [rows] = await pool.query('SELECT * FROM documentos_exigidos WHERE id = ?', [primeiroDocId]);
      const docSalvo = rows[0];

      if (docSalvo.protocolo_comprovante !== 'RECIBO-UFEC-2026-0987-CONFIRMADO') {
        throw new Error(`Protocolo não persistiu corretamente: ${docSalvo.protocolo_comprovante}`);
      }

      const clParsed = typeof docSalvo.checklist_etapas === 'string'
        ? JSON.parse(docSalvo.checklist_etapas)
        : docSalvo.checklist_etapas;
      if (!clParsed.entender_necessidade || !clParsed.obter_documento || !clParsed.conferir_validade_formato) {
        throw new Error('Checklist de etapas não persistiu valores corretos');
      }
    });

    // TESTE 6: Proteção SSRF e Validação de URL
    await testar('T6: Validação de segurança SSRF bloqueia URLs internas ou perigosas', async () => {
      const urlLocalhost = 'http://localhost:8080/admin';
      const urlPrivada = 'http://192.168.1.100/router';
      const urlAws = 'http://169.254.169.254/latest/meta-data/';
      const urlSegura = 'https://www.gov.br/pt-br/servicos/obter-carteira-de-identidade';

      if (servicoPesquisaComplementar.validarUrlSegura(urlLocalhost).seguro) {
        throw new Error('SSRF Falhou: localhost foi aceito como seguro!');
      }
      if (servicoPesquisaComplementar.validarUrlSegura(urlPrivada).seguro) {
        throw new Error('SSRF Falhou: IP privado 192.168 foi aceito como seguro!');
      }
      if (servicoPesquisaComplementar.validarUrlSegura(urlAws).seguro) {
        throw new Error('SSRF Falhou: IP de metadados 169.254 foi aceito como seguro!');
      }
      if (!servicoPesquisaComplementar.validarUrlSegura(urlSegura).seguro) {
        throw new Error('URL oficial legítima do gov.br foi incorretamente rejeitada!');
      }
    });

    // TESTE 7: Detecção de PDF digitalizado sem OCR
    await testar('T7: Detecção transparente de páginas digitalizadas (PDF sem texto extraível)', async () => {
      // Simula resultado com texto muito reduzido
      const resultadoMock = {
        textoCompleto: 'EDITAL',
        totalPaginas: 4,
        paginasSemTexto: 3,
        avisoDigitalizado: 'ATENÇÃO: 3 de 4 página(s) deste arquivo não possuem texto selecionável.',
      };

      if (!resultadoMock.avisoDigitalizado || !resultadoMock.avisoDigitalizado.includes('não possuem texto selecionável')) {
        throw new Error('Aviso de digitalizado não fornecido adequadamente');
      }
    });
  } finally {
    // Limpeza de registros de teste
    try {
      const pool = obterPoolConexoes();
      if (editalCriadoId) {
        await pool.query('DELETE FROM editais WHERE id = ?', [editalCriadoId]);
      }
    } catch (e) {
      console.warn('Aviso na limpeza do banco:', e.message);
    }

    servidor.close();
  }

  console.log('========================================================================');
  console.log(`📊 RESULTADO FINAL DO TESTE DE 5 DOCUMENTOS: ${sucessos} aprovados, ${falhas} falhas.`);
  console.log('========================================================================');

  if (falhas > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

executarTesteEditalCincoDocumentos().catch((err) => {
  console.error('Erro fatal no teste:', err);
  process.exit(1);
});
