import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { configuracaoAmbiente } from './configuracao/ambiente.js';
import { rotasPrincipais } from './rotas/index.js';
import { manipuladorErros, manipuladorRotaNaoEncontrada } from './intermediarios/manipuladorErros.js';

const caminhoArquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(caminhoArquivoAtual);

const app = express();

// Middlewares de segurança e cabeçalhos HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Configuração de CORS restrito ao frontend
const origensConfiguradas = configuracaoAmbiente.URL_FRONTEND
  ? configuracaoAmbiente.URL_FRONTEND.split(',').map((url) => url.trim()).filter(Boolean)
  : [];

const origensPadrao = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const origensPermitidas = Array.from(new Set([...origensConfiguradas, ...origensPadrao]));

function ehOrigemPermitida(origem) {
  // Permite chamadas sem origem (ferramentas locais de teste, curl ou proxy interno)
  if (!origem) return true;

  // Lista explícita de origens configuradas/padrão
  if (origensPermitidas.includes(origem)) {
    return true;
  }

  // No ambiente de desenvolvimento, aceita origens de rede local privada (RFC 1918) nas portas do frontend
  if (configuracaoAmbiente.AMBIENTE === 'development') {
    const regexRedeLocal = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:(5173|4173|3000))?$/;
    if (regexRedeLocal.test(origem)) {
      return true;
    }
  }

  return false;
}

app.use(cors({
  origin: (origem, callback) => {
    if (ehOrigemPermitida(origem)) {
      return callback(null, true);
    }
    return callback(new Error(`Acesso bloqueado pela política de CORS da aplicação para a origem: ${origem}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parser para corpo de requisições JSON e URL encoded
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Servir arquivos estáticos da pasta de uploads de forma segura
const pastaUploads = path.resolve(diretorioAtual, '../uploads');
app.use('/uploads', express.static(pastaUploads));

// Registro das rotas com prefixo obrigatório /api
app.use('/api', rotasPrincipais);

// Tratamento de rotas inexistentes
app.use(manipuladorRotaNaoEncontrada);

// Manipulador centralizado de erros
app.use(manipuladorErros);

export { app };
