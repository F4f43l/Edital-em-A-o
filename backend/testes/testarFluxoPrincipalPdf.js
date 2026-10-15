import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../src/app.js';
import { repositorioEditais } from '../src/repositorios/repositorioEditais.js';
import { repositorioAnalises } from '../src/repositorios/repositorioAnalises.js';
import { repositorioRequisitos } from '../src/repositorios/repositorioRequisitos.js';
import { repositorioTarefas } from '../src/repositorios/repositorioTarefas.js';
import { obterPoolConexoes } from '../src/configuracao/banco.js';

const caminhoArquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(caminhoArquivoAtual);

async function testarNovoFluxoPrincipal() {
  console.log('====================================================');
  console.log('🧪 TESTE COMPLETO: NOVO FLUXO PRINCIPAL (PDF -> IA -> REVISÃO -> MYSQL)');
  console.log('====================================================');

  const porta = 3097;
  const servidor = app.listen(porta);
  const urlBase = `http://localhost:${porta}/api`;

  let editalCriadoId = null;

  try {
    const caminhoPdf = "c:/Edital em ação/Guia para geracao/EditalEmAcao.pdf";
    if (!fs.existsSync(caminhoPdf)) {
      throw new Error(`PDF não encontrado em: ${caminhoPdf}`);
    }

    console.log('1️⃣ Enviando PDF para extração e análise inicial (POST /api/editais/processar-pdf)...');
    const bufferPdf = fs.readFileSync(caminhoPdf);
    const blobPdf = new Blob([bufferPdf], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('arquivo', blobPdf, 'EditalEmAcao.pdf');

    const respProcessar = await fetch(`${urlBase}/editais/processar-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (respProcessar.status !== 200) {
      const errTexto = await respProcessar.text();
      throw new Error(`Erro ao processar PDF: HTTP ${respProcessar.status} - ${errTexto}`);
    }

    const jsonProcessar = await respProcessar.json();
    console.log('✅ Resposta recebida com sucesso!');
    console.log('📦 Metadados:', {
      totalPaginas: jsonProcessar.arquivo?.total_paginas,
      caminho_arquivo: jsonProcessar.arquivo?.caminho_arquivo,
      tamanho_bytes: jsonProcessar.arquivo?.tamanho_bytes,
    });

    const dados = jsonProcessar.dados_extraidos;
    console.log('\n🔍 DADOS IDENTIFICADOS PELA ANÁLISE:');
    console.log('- Título:', dados.titulo_detectado || '(não identificado)');
    console.log('- Instituição:', dados.instituicao || '(não identificada)');
    console.log('- Categoria:', dados.categoria || '(não identificada)');
    console.log('- Provedor IA utilizado:', dados.provedor_ia, '| Modelo:', dados.modelo_ia);
    console.log('- Prazo de Inscrição:', dados.prazo_inscricao, '| Evidência:', dados.cronograma?.prazo_inscricao?.trecho_evidencia);
    console.log('- Prazo de Recurso:', dados.prazo_recurso, '| Evidência:', dados.cronograma?.prazo_recurso?.trecho_evidencia);
    console.log('- Data de Resultado:', dados.data_resultado, '| Evidência:', dados.cronograma?.data_resultado?.trecho_evidencia);
    console.log('- Link Oficial:', dados.url_origem || '(não identificado)');
    console.log('- Total de Requisitos/Critérios:', dados.requisitos?.length || 0);

    // Validações do requisito do usuário:
    if (!jsonProcessar.arquivo?.caminho_arquivo) {
      throw new Error('Caminho do arquivo não retornado pelo processamento');
    }

    console.log('\n2️⃣ Confirmando o cadastro com dados revisados (POST /api/editais/confirmar-cadastro)...');
    const payloadConfirmacao = {
      edital: {
        titulo: dados.titulo_detectado || 'Edital em Ação - Processo Seletivo',
        instituicao: dados.instituicao || 'Instituição Organizadora',
        categoria: dados.categoria || 'Capacitação/Curso',
        resumo: dados.resumo_simples || 'Resumo do edital analisado.',
        url_origem: dados.url_origem || null,
        prazo_inscricao: dados.prazo_inscricao || '2026-11-20',
        prazo_recurso: dados.prazo_recurso || null,
        data_resultado: dados.data_resultado || null,
        nome_arquivo: jsonProcessar.arquivo?.nome_original,
        caminho_arquivo: jsonProcessar.arquivo?.caminho_arquivo,
        texto_extraido: jsonProcessar.texto_extraido,
        status: 'ativo',
        custos_logistica: dados.custos_logistica || null,
      },
      analise: {
        perfil_id: null,
        resumo: dados.resumo_simples,
        resultado_orientativo: dados.resultado_orientativo || 'possivel_compatibilidade',
        provedor_ia: dados.provedor_ia || 'manual',
        modelo_ia: dados.modelo_ia || null,
        custos_logistica: dados.custos_logistica || null,
      },
      requisitos: (dados.requisitos || []).slice(0, 8),
    };

    const respConfirmar = await fetch(`${urlBase}/editais/confirmar-cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadConfirmacao),
    });

    if (respConfirmar.status !== 201) {
      const errConf = await respConfirmar.text();
      throw new Error(`Erro ao confirmar cadastro: HTTP ${respConfirmar.status} - ${errConf}`);
    }

    const jsonConfirmar = await respConfirmar.json();
    editalCriadoId = jsonConfirmar.edital.id;
    console.log(`✅ Edital persistido com sucesso no MySQL! ID: ${editalCriadoId}`);
    console.log(`   Tarefas de checklist geradas: ${jsonConfirmar.totalTarefas}`);

    console.log('\n3️⃣ Verificando integridade dos dados no MySQL via endpoints de consulta...');

    // Consulta do edital
    const respEdital = await fetch(`${urlBase}/editais/${editalCriadoId}`);
    if (respEdital.status !== 200) throw new Error('Falha ao consultar edital criado');
    const editalDb = await respEdital.json();
    console.log('✅ Edital no banco:', {
      id: editalDb.id,
      titulo: editalDb.titulo,
      prazo_inscricao: editalDb.prazo_inscricao,
      prazo_recurso: editalDb.prazo_recurso,
      data_resultado: editalDb.data_resultado,
      possui_custos_logistica: Boolean(editalDb.custos_logistica),
    });

    if (!editalDb.custos_logistica) {
      throw new Error('custos_logistica não foi persistido no edital no MySQL!');
    }

    // Consulta da análise
    const respAnalise = await fetch(`${urlBase}/analises/${jsonConfirmar.analise.id}`);
    if (respAnalise.status !== 200) throw new Error('Falha ao consultar análise do edital');
    const analiseDb = await respAnalise.json();
    console.log('✅ Análise persistida no MySQL:', {
      id: analiseDb.id,
      resultado_orientativo: analiseDb.resultado_orientativo,
      provedor_ia: analiseDb.provedor_ia,
      modelo_ia: analiseDb.modelo_ia,
      possui_custos_logistica: Boolean(analiseDb.custos_logistica),
    });

    if (!analiseDb.custos_logistica) {
      throw new Error('custos_logistica não foi persistido na análise no MySQL!');
    }

    // Consulta dos requisitos
    const respReqs = await fetch(`${urlBase}/analises/${jsonConfirmar.analise.id}/requisitos`);
    const reqsDb = await respReqs.json();
    console.log(`✅ Requisitos persistidos no MySQL: ${reqsDb.length} registros`);

    // Consulta do plano de ação (tarefas)
    const respTarefas = await fetch(`${urlBase}/tarefas?analise_id=${jsonConfirmar.analise.id}`);
    const tarefasDb = await respTarefas.json();
    console.log(`✅ Plano de ação persistido no MySQL: ${tarefasDb.length} tarefas geradas`);

    console.log('\n🎉 NOVO FLUXO PRINCIPAL VALIDADO COM SUCESSO DE PONTA A PONTA!');
  } finally {
    // Limpeza opcional do registro de teste
    if (editalCriadoId) {
      try {
        console.log(`\n🧹 Removendo edital temporário de teste #${editalCriadoId}...`);
        await repositorioEditais.excluir(editalCriadoId);
        console.log('✅ Limpeza concluída.');
      } catch (errLimpeza) {
        console.warn('Aviso ao limpar edital de teste:', errLimpeza.message);
      }
    }

    const pool = obterPoolConexoes();
    try {
      await pool.end();
    } catch (_) { }
    servidor.close();
  }
}

testarNovoFluxoPrincipal().catch((err) => {
  console.error('❌ ERRO NO TESTE:', err);
  process.exit(1);
});
