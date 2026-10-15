import { obterPoolConexoes } from '../configuracao/banco.js';

async function migrar() {
  const pool = obterPoolConexoes();
  console.log('🔄 Aplicando migrações no banco MySQL...');

  try {
    const [eCols] = await pool.query("SHOW COLUMNS FROM editais LIKE 'custos_logistica'");
    if (eCols.length === 0) {
      await pool.query('ALTER TABLE editais ADD COLUMN custos_logistica JSON NULL AFTER status');
      console.log('✅ Coluna custos_logistica adicionada à tabela editais');
    } else {
      console.log('ℹ️ Coluna custos_logistica já existe na tabela editais');
    }

    const [aCols] = await pool.query("SHOW COLUMNS FROM analises LIKE 'custos_logistica'");
    if (aCols.length === 0) {
      await pool.query('ALTER TABLE analises ADD COLUMN custos_logistica JSON NULL AFTER modelo_ia');
      console.log('✅ Coluna custos_logistica adicionada à tabela analises');
    } else {
      console.log('ℹ️ Coluna custos_logistica já existe na tabela analises');
    }

    await pool.query(
      "ALTER TABLE tarefas MODIFY COLUMN status ENUM('pendente', 'em_andamento', 'concluida', 'bloqueada', 'nao_se_aplica') NOT NULL DEFAULT 'pendente'"
    );
    console.log("✅ ENUM de status em tarefas atualizado com sucesso ('nao_se_aplica')");

    console.log('🎉 Migração concluída com sucesso!');
  } catch (erro) {
    console.error('❌ Erro na migração:', erro);
    throw erro;
  } finally {
    await pool.end();
  }
}

migrar().catch(() => process.exit(1));
