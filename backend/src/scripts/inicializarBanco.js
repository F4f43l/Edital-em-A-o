import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { configuracaoAmbiente } from '../configuracao/ambiente.js';

const caminhoArquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(caminhoArquivoAtual);

async function inicializarBanco() {
  console.log('----------------------------------------------------');
  console.log('🔄 INICIALIZAÇÃO DO BANCO DE DADOS MYSQL');
  console.log('----------------------------------------------------');
  console.log(`Host: ${configuracaoAmbiente.BANCO_HOST}:${configuracaoAmbiente.BANCO_PORTA}`);
  console.log(`Usuário: ${configuracaoAmbiente.BANCO_USUARIO}`);
  console.log(`Base de Dados: ${configuracaoAmbiente.BANCO_NOME}`);

  let conexao;
  try {
    // Conecta inicialmente sem selecionar a base para garantir que o banco possa ser criado
    conexao = await mysql.createConnection({
      host: configuracaoAmbiente.BANCO_HOST,
      port: configuracaoAmbiente.BANCO_PORTA,
      user: configuracaoAmbiente.BANCO_USUARIO,
      password: configuracaoAmbiente.BANCO_SENHA,
      multipleStatements: true,
      charset: 'utf8mb4_unicode_ci',
    });

    console.log('✅ Conexão inicial com o servidor MySQL bem-sucedida.');

    const caminhoSchema = path.resolve(diretorioAtual, '../../../database/schema.sql');
    const caminhoSeed = path.resolve(diretorioAtual, '../../../database/seed.sql');

    if (!fs.existsSync(caminhoSchema)) {
      throw new Error(`Arquivo schema.sql não encontrado em: ${caminhoSchema}`);
    }

    console.log('📜 Executando database/schema.sql...');
    const conteudoSchema = fs.readFileSync(caminhoSchema, 'utf8');
    await conexao.query(conteudoSchema);
    console.log('✅ Tabelas criadas com sucesso!');

    if (fs.existsSync(caminhoSeed)) {
      console.log('🌱 Executando database/seed.sql...');
      const conteudoSeed = fs.readFileSync(caminhoSeed, 'utf8');
      await conexao.query(conteudoSeed);
      console.log('✅ Dados de demonstração inseridos com sucesso!');
    }

    console.log('----------------------------------------------------');
    console.log('🎉 BANCO DE DADOS CONFIGURADO E PRONTO PARA USO!');
    console.log('----------------------------------------------------');
  } catch (erro) {
    console.error('❌ Falha ao inicializar banco de dados MySQL:');
    console.error(`   Mensagem: ${erro.message}`);
    console.error('👉 Verifique se a senha informada em backend/.env (DB_PASSWORD) está correta.');
    process.exit(1);
  } finally {
    if (conexao) {
      await conexao.end();
    }
  }
}

inicializarBanco();
