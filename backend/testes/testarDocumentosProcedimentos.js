import { app } from '../src/app.js';
import { obterPoolConexoes } from '../src/configuracao/banco.js';

async function testarDocumentosEProcedimentos() {
  console.log('========================================================================');
  console.log('📑 TESTES DE ACEITAÇÃO: DOCUMENTOS, PROCEDIMENTOS E COMPROVAÇÃO');
  console.log('========================================================================');

  const portaTeste = 3105;
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
    // Preparar edital e análise de teste
    let editalId = null;
    let analiseId = null;
    let requisitoId = null;
    let docId = null;

    await testar('P1: Criar edital com análise inicial para teste de procedimentos', async () => {
      // 1. Cria edital
      const respEdital = await fetch(`${urlBase}/editais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: '[TESTE ACEITAÇÃO] Edital de Concessão de Bolsa de Permanência 2026',
          instituicao: 'Universidade Federal de Testes (UFT)',
          categoria: 'Auxílio Permanência',
          resumo: 'Edital para seleção socioeconômica de estudantes em vulnerabilidade.',
          prazo_inscricao: '2026-11-30',
          prazo_recurso: '2026-12-05',
          data_resultado: '2026-12-15',
          status: 'ativo',
        }),
      });
      if (respEdital.status !== 201) throw new Error(`Falha ao criar edital: ${respEdital.status}`);
      const dadosEdital = await respEdital.json();
      editalId = dadosEdital.id;

      // 2. Cria análise
      const respAnalise = await fetch(`${urlBase}/analises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edital_id: editalId,
          resultado_orientativo: 'possivel_compatibilidade',
          resumo: 'Análise detalhada de requisitos e comprovação documental.',
        }),
      });
      if (respAnalise.status !== 201) throw new Error(`Falha ao criar análise: ${respAnalise.status}`);
      const dadosAnalise = await respAnalise.json();
      analiseId = dadosAnalise.id;
    });

    await testar('P2: Cadastrar requisito com procedimento detalhado em 16 pontos e fonte confiável', async () => {
      const procedimento16Pontos = {
        o_que_exige: 'Comprovação de renda bruta familiar per capita de até 1,5 salário mínimo',
        condicao_valor: 'Renda per capita menor ou igual a R$ 2.118,00',
        quem_deve_cumprir: 'Todos os membros do grupo familiar maiores de 18 anos',
        como_verificar_atendimento: 'Somar rendimentos brutos dos últimos 3 meses e dividir pelo número de membros',
        documentos_comprobatorios: 'Holerite, extrato CNIS ou declaração de trabalho autônomo com recibos',
        como_obter: 'Acessar o portal Meu INSS para emitir CNIS ou solicitar holerites ao empregador',
        quem_emite: 'Empregador ou Instituto Nacional do Seguro Social (INSS)',
        formatos_aceitos: 'PDF legível, máximo de 5MB por arquivo',
        exigencias_validade_assinatura: 'Assinatura digital gov.br ou carimbo com identificação legível da fonte pagadora',
        onde_entregar: 'Portal de Assistência Estudantil da UFT',
        como_acessar_canal: 'Acessar o portal oficial com credenciais institucionais e ir à aba Envio de Documentos',
        etapa_apresentacao: 'Etapa de Inscrição e Habilitação Socioeconômica',
        prazo_exato: 'Até as 23h59 do dia 30/11/2026',
        como_verificar_envio: 'Verificar status «Em análise» e recibo gerado no painel do candidato',
        como_guardar_protocolo: 'Fazer download do arquivo de comprovante e anotar o código de autenticidade',
        fonte_oficial: 'Edital nº 08/2026 - Seção 4.2 e Anexo II',
      };

      const resp = await fetch(`${urlBase}/analises/${analiseId}/requisitos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Critério Socioeconômico de Renda Per Capita',
          descricao: 'Renda familiar per capita máxima de 1,5 salário mínimo',
          tipo: 'elegibilidade',
          obrigatorio: true,
          status_perfil: 'confirmar',
          evidencia_texto: 'A renda familiar bruta mensal per capita não poderá ultrapassar 1,5 salário mínimo vigente.',
          pagina_origem: 3,
          secao_edital: 'Seção 4.2',
          classificacao_fonte: 'confirmado_edital',
          procedimento_detalhado: procedimento16Pontos,
        }),
      });

      if (resp.status !== 201) throw new Error(`Falha ao criar requisito: ${resp.status}`);
      const dados = await resp.json();
      requisitoId = dados.id;

      let procSalvo = dados.procedimento_detalhado;
      if (typeof procSalvo === 'string') procSalvo = JSON.parse(procSalvo);
      if (!procSalvo || procSalvo.quem_deve_cumprir !== procedimento16Pontos.quem_deve_cumprir) {
        throw new Error('Procedimento detalhado de 16 pontos não persistido corretamente no MySQL');
      }
    });

    await testar('P3: Tratamento individual de documentos — criação de documento comprobatório vinculado', async () => {
      const resp = await fetch(`${urlBase}/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analise_id: analiseId,
          requisito_id: requisitoId,
          nome: 'Extrato Previdenciário CNIS Completo',
          finalidade: 'Comprovar histórico de vínculos empregatícios e remunerações de todos os adultos da família',
          quem_fornece: 'Candidato e membros adultos da família',
          orgao_emissor: 'INSS / Governo Federal (Meu INSS)',
          como_obter: 'Acessar o portal gov.br > Meu INSS > Serviços > Extrato de Contribuição (CNIS) e baixar versão em PDF',
          documentos_alternativos: 'Carteira de Trabalho Digital (páginas de contrato e remuneração) caso CNIS esteja indisponível',
          formato_aceito: 'PDF pesquisável ou imagem nítida, máx 10MB',
          exigencias_validade_assinatura: 'Emitido nos últimos 30 dias com código de autenticação digital verificável',
          local_entrega: 'Portal de Inscrições da UFT',
          url_entrega: null, // Canal sem URL explícita no edital
          secao_entrega: 'Módulo de Bolsas e Auxílios > Anexos Socioeconômicos',
          etapa_processo: 'Inscrição',
          prazo_envio: '2026-11-30',
          prazo_envio_descricao: 'Prazo final improrrogável até 23h59',
          como_confirmar_envio: 'Verificar se o status do anexo mudou para «Recebido com sucesso»',
          instrucoes_protocolo: 'Fazer download do recibo oficial com hash SHA-256 gerado pelo sistema',
          status_etapa: 'pendente_obtencao',
          classificacao_fonte: 'confirmado_edital',
          secao_edital: 'Anexo III, Item 1.2',
          pagina_origem: 8,
          trecho_evidencia: 'Deverá ser apresentado o extrato CNIS de todos os componentes familiares maiores de 18 anos.',
          observacao_pendencia: 'A URL direta do portal não consta expressamente no edital; consultar link na intranet da UFT.',
        }),
      });

      if (resp.status !== 201) throw new Error(`Falha ao criar documento individual: ${resp.status}`);
      const dados = await resp.json();
      docId = dados.id;

      if (!dados.id || dados.nome !== 'Extrato Previdenciário CNIS Completo') {
        throw new Error('Documento criado não possui atributos válidos');
      }
      if (dados.status_etapa !== 'pendente_obtencao') {
        throw new Error(`Status de etapa inicial incorreto: ${dados.status_etapa}`);
      }
    });

    await testar('P4: Atualização interativa e persistência do Checklist de 5 Etapas no MySQL', async () => {
      const checklistAtualizado = {
        entender_necessidade: true,
        obter_documento: true,
        conferir_validade_formato: true,
        enviar_canal_correto: false,
        registrar_protocolo: false,
      };

      const resp = await fetch(`${urlBase}/documentos/${docId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: checklistAtualizado }),
      });

      if (resp.status !== 200) throw new Error(`Falha ao atualizar checklist: ${resp.status}`);
      const dados = await resp.json();

      let chk = dados.checklist_etapas;
      if (typeof chk === 'string') chk = JSON.parse(chk);
      if (!chk.entender_necessidade || !chk.obter_documento || !chk.conferir_validade_formato) {
        throw new Error('Checklist de 5 etapas não persistido corretamente');
      }
    });

    await testar('P5: Diferenciação de etapas: preparação vs envio vs validação institucional', async () => {
      // 1. Muda para conferido
      let resp = await fetch(`${urlBase}/documentos/${docId}/etapa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_etapa: 'conferido' }),
      });
      if (resp.status !== 200) throw new Error('Falha ao atualizar status para conferido');

      // 2. Muda para enviado
      resp = await fetch(`${urlBase}/documentos/${docId}/etapa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_etapa: 'enviado' }),
      });
      if (resp.status !== 200) throw new Error('Falha ao atualizar status para enviado');

      // 3. Muda para recebimento_confirmado
      resp = await fetch(`${urlBase}/documentos/${docId}/etapa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_etapa: 'recebimento_confirmado' }),
      });
      if (resp.status !== 200) throw new Error('Falha ao atualizar status para recebimento_confirmado');
      const docAtualizado = await resp.json();
      if (docAtualizado.status_etapa !== 'recebimento_confirmado') {
        throw new Error(`Status de etapa não é recebimento_confirmado: ${docAtualizado.status_etapa}`);
      }
    });

    await testar('P6: Registro e persistência do Protocolo/Comprovante de Envio no MySQL', async () => {
      const protocoloValor = 'PROTOCOLO-UFT-2026-BOLSA-994821 - Recibo emitido às 14h20';
      const resp = await fetch(`${urlBase}/documentos/${docId}/protocolo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolo_comprovante: protocoloValor }),
      });

      if (resp.status !== 200) throw new Error(`Falha ao registrar protocolo: ${resp.status}`);
      const dados = await resp.json();
      if (dados.protocolo_comprovante !== protocoloValor) {
        throw new Error('Protocolo não persistido corretamente');
      }

      // Consulta direta via GET /api/documentos/:id
      const consulta = await fetch(`${urlBase}/documentos/${docId}`);
      const dadosConsulta = await consulta.json();
      if (dadosConsulta.protocolo_comprovante !== protocoloValor) {
        throw new Error('Protocolo divergente na consulta individual');
      }
    });

    await testar('P7: Verificação do relatório consolidado da análise com requisitos e documentos', async () => {
      const resp = await fetch(`${urlBase}/analises/${analiseId}`);
      if (resp.status !== 200) throw new Error(`Falha ao consultar análise: ${resp.status}`);
      const dados = await resp.json();

      if (!dados.requisitos || dados.requisitos.length === 0) {
        throw new Error('Análise não retornou lista de requisitos');
      }
      if (!dados.documentos || dados.documentos.length === 0) {
        throw new Error('Análise não retornou lista individual de documentos');
      }

      const docRetornado = dados.documentos.find((d) => d.id === docId);
      if (!docRetornado) throw new Error('Documento criado não encontrado na análise');
      if (docRetornado.status_etapa !== 'recebimento_confirmado') {
        throw new Error('Status de etapa não mantido no retorno consolidado da análise');
      }
    });

    await testar('P8: Remoção em cascata e limpeza de dados de teste', async () => {
      // Exclui o edital criado no teste, o que deve remover em cascata análise, requisitos e documentos
      const resp = await fetch(`${urlBase}/editais/${editalId}`, { method: 'DELETE' });
      if (resp.status !== 204) throw new Error(`Falha ao excluir edital de teste: ${resp.status}`);

      // Confirma que o documento foi removido
      const respDoc = await fetch(`${urlBase}/documentos/${docId}`);
      if (respDoc.status !== 404) {
        throw new Error('Documento não foi removido na exclusão em cascata do edital/análise');
      }
    });
  } finally {
    servidor.close();
  }

  console.log('========================================================================');
  console.log(`📊 RESULTADO FINAL DOS TESTES: ${sucessos} aprovados, ${falhas} falhas.`);
  console.log('========================================================================');

  if (falhas > 0) {
    process.exit(1);
  }
}

testarDocumentosEProcedimentos().catch((erro) => {
  console.error('Erro fatal ao rodar suíte de testes de documentos:', erro);
  process.exit(1);
});
