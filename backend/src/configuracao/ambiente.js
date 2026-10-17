import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const caminhoArquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(caminhoArquivoAtual);

// Carrega as variáveis de ambiente a partir do arquivo .env no diretório backend
dotenv.config({ path: path.resolve(diretorioAtual, '../../.env') });

export const configuracaoAmbiente = {
  PORTA: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  HOST: process.env.HOST || '0.0.0.0',
  AMBIENTE: process.env.NODE_ENV || 'development',
  URL_FRONTEND: process.env.FRONTEND_URL || 'http://localhost:5173',

  BANCO_HOST: process.env.DB_HOST || 'localhost',
  BANCO_PORTA: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  BANCO_USUARIO: process.env.DB_USER || 'root',
  BANCO_SENHA: process.env.DB_PASSWORD || '',
  BANCO_NOME: process.env.DB_NAME || 'edital_em_acao',

  DIRETORIO_UPLOADS: process.env.UPLOAD_DIR || 'uploads',
  LIMITE_UPLOAD_MB: process.env.MAX_UPLOAD_MB ? parseInt(process.env.MAX_UPLOAD_MB, 10) : 10,

  PROVEDOR_IA: process.env.AI_PROVIDER || 'gemini',
  CHAVE_API_GEMINI: process.env.GEMINI_API_KEY || '',
  MODELO_GEMINI: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};

/**
 * Validação não destrutiva de variáveis essenciais sem expor segredos.
 */
export function validarConfiguracao() {
  const avisos = [];
  if (!configuracaoAmbiente.BANCO_NOME) {
    avisos.push('BANCO_NOME não foi informado (usando valor padrão: edital_em_acao).');
  }
  if (!configuracaoAmbiente.CHAVE_API_GEMINI) {
    avisos.push('GEMINI_API_KEY não encontrada. A aplicação operará no modo demonstração com análise heurística/regras locais.');
  }

  if (avisos.length > 0) {
    console.log('[CONFIGURAÇÃO] Informações de inicialização:');
    avisos.forEach((aviso) => console.log(` • ${aviso}`));
  }
}
