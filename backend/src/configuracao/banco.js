import mysql from 'mysql2/promise';
import { configuracaoAmbiente } from './ambiente.js';

let poolConexoes;

/**
 * Retorna o pool de conexões do MySQL
 */
export function obterPoolConexoes() {
  if (!poolConexoes) {
    poolConexoes = mysql.createPool({
      host: configuracaoAmbiente.BANCO_HOST,
      port: configuracaoAmbiente.BANCO_PORTA,
      user: configuracaoAmbiente.BANCO_USUARIO,
      password: configuracaoAmbiente.BANCO_SENHA,
      database: configuracaoAmbiente.BANCO_NOME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4_unicode_ci',
      decimalNumbers: true,
      timezone: 'Z',
    });
  }
  return poolConexoes;
}

/**
 * Testa a integridade da conexão com o banco de dados MySQL
 */
export async function testarConexaoBanco() {
  try {
    const pool = obterPoolConexoes();
    const [linhas] = await pool.query('SELECT 1 as teste_conexao');
    return {
      conectado: true,
      banco: configuracaoAmbiente.BANCO_NOME,
      host: configuracaoAmbiente.BANCO_HOST,
      porta: configuracaoAmbiente.BANCO_PORTA,
    };
  } catch (erro) {
    return {
      conectado: false,
      banco: configuracaoAmbiente.BANCO_NOME,
      host: configuracaoAmbiente.BANCO_HOST,
      porta: configuracaoAmbiente.BANCO_PORTA,
      mensagem: erro.message || 'Falha ao conectar ao banco de dados MySQL',
    };
  }
}
