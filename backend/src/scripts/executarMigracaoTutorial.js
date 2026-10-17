import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { obterPoolConexoes } from '../configuracao/banco.js';

const caminhoAtual = fileURLToPath(import.meta.url);
const dirAtual = path.dirname(caminhoAtual);

async function executarMigracao() {
  const pool = obterPoolConexoes();
  const conn = await pool.getConnection();

  try {
    console.log('🔄 Executando migração de banco para campos de tutorial e vinculação de tarefas...');

    // Adiciona colunas se não existirem
    const [colsDoc] = await conn.query('DESCRIBE documentos_exigidos');
    const nomesColsDoc = colsDoc.map((c) => c.Field);

    if (!nomesColsDoc.includes('nome_simples')) {
      await conn.query('ALTER TABLE documentos_exigidos ADD COLUMN nome_simples VARCHAR(255) NULL AFTER nome');
      console.log('  ➕ Coluna nome_simples adicionada em documentos_exigidos');
    }

    if (!nomesColsDoc.includes('dados_solicitacao')) {
      await conn.query('ALTER TABLE documentos_exigidos ADD COLUMN dados_solicitacao TEXT NULL AFTER como_obter');
      console.log('  ➕ Coluna dados_solicitacao adicionada em documentos_exigidos');
    }

    if (!nomesColsDoc.includes('instrucoes_preparacao')) {
      await conn.query('ALTER TABLE documentos_exigidos ADD COLUMN instrucoes_preparacao TEXT NULL AFTER exigencias_validade');
      console.log('  ➕ Coluna instrucoes_preparacao adicionada em documentos_exigidos');
    }

    if (!nomesColsDoc.includes('como_digitalizar')) {
      await conn.query('ALTER TABLE documentos_exigidos ADD COLUMN como_digitalizar TEXT NULL AFTER instrucoes_preparacao');
      console.log('  ➕ Coluna como_digitalizar adicionada em documentos_exigidos');
    }

    const [colsTar] = await conn.query('DESCRIBE tarefas');
    const nomesColsTar = colsTar.map((c) => c.Field);

    if (!nomesColsTar.includes('documento_id')) {
      await conn.query(`
        ALTER TABLE tarefas
        ADD COLUMN documento_id INT NULL AFTER requisito_id,
        ADD CONSTRAINT fk_tarefas_documento FOREIGN KEY (documento_id) REFERENCES documentos_exigidos(id) ON DELETE CASCADE,
        ADD INDEX idx_tarefas_documento (documento_id)
      `);
      console.log('  ➕ Coluna documento_id e FK adicionada em tarefas');
    }

    console.log('✅ Migração executada com sucesso!');
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

executarMigracao().catch((err) => {
  console.error(err);
  process.exit(1);
});
