import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../src/app.js';
import { repositorioEditais } from '../src/repositorios/repositorioEditais.js';
import { obterPoolConexoes } from '../src/configuracao/banco.js';

const caminhoArquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(caminhoArquivoAtual);

async function testarUploads() {
  console.log('🧪 TESTANDO UPLOAD E EXTRAÇÃO DE PDF (T4 & T5)...');
  const porta = 3098;
  const servidor = app.listen(porta);
  const urlBase = `http://localhost:${porta}/api`;

  try {
    // 1. Cria um edital temporário
    const edital = await repositorioEditais.criar({
      titulo: 'Edital para Teste de Upload PDF',
      categoria: 'Outro',
      status: 'rascunho',
    });

    // 2. Caminho do PDF em EditalTeste
    const pastaEditalTeste = path.resolve(diretorioAtual, '../../EditalTeste');
    const arquivosPdf = fs.existsSync(pastaEditalTeste)
      ? fs.readdirSync(pastaEditalTeste).filter((f) => f.toLowerCase().endsWith('.pdf'))
      : [];
    const nomeArquivoPdf = arquivosPdf.includes('edital_teste_editais_em_acao.pdf')
      ? 'edital_teste_editais_em_acao.pdf'
      : arquivosPdf[0];

    const caminhoPdfReal = nomeArquivoPdf ? path.join(pastaEditalTeste, nomeArquivoPdf) : null;
    if (!caminhoPdfReal || !fs.existsSync(caminhoPdfReal)) {
      throw new Error(`PDF de teste não encontrado na pasta EditalTeste: ${pastaEditalTeste}`);
    }

    // 3. Testa envio de PDF válido usando FormData nativo do Node 20+
    const bufferPdf = fs.readFileSync(caminhoPdfReal);
    const blobPdf = new Blob([bufferPdf], { type: 'application/pdf' });
    const formDataValido = new FormData();
    formDataValido.append('arquivo', blobPdf, nomeArquivoPdf);

    const respValida = await fetch(`${urlBase}/editais/${edital.id}/arquivo`, {
      method: 'POST',
      body: formDataValido,
    });

    if (respValida.status !== 200) {
      const err = await respValida.text();
      throw new Error(`Falha no upload de PDF válido: ${respValida.status} - ${err}`);
    }

    const resultadoValido = await respValida.json();
    console.log(`✅ [APROVADO] T4: PDF válido processado com sucesso! Páginas: ${resultadoValido.totalPaginas}, Caracteres: ${resultadoValido.caracteresExtraidos}`);

    // 4. Testa envio de arquivo com MIME inválido (T5)
    const blobInvalido = new Blob(['conteudo de texto simples'], { type: 'text/plain' });
    const formDataInvalido = new FormData();
    formDataInvalido.append('arquivo', blobInvalido, 'documento_falso.txt');

    const respInvalida = await fetch(`${urlBase}/editais/${edital.id}/arquivo`, {
      method: 'POST',
      body: formDataInvalido,
    });

    if (respInvalida.status !== 415 && respInvalida.status !== 400) {
      throw new Error(`Status HTTP inesperado para arquivo inválido: ${respInvalida.status}`);
    }

    console.log('✅ [APROVADO] T5: Arquivo de formato inválido rejeitado com segurança (HTTP 415/400)!');

    // Limpa o edital de teste
    await repositorioEditais.excluir(edital.id);
    console.log('✅ Limpeza de dados temporários de teste concluída.');
  } finally {
    const pool = obterPoolConexoes();
    try {
      await pool.end();
    } catch (_) {}
    servidor.close();
  }
}

testarUploads().catch((err) => {
  console.error('❌ Erro no teste de upload:', err);
  process.exit(1);
});
