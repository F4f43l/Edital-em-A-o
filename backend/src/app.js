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
const origensPermitidas = [
  configuracaoAmbiente.URL_FRONTEND,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origem, callback) => {
    // Permite chamadas sem origem (como ferramentas locais de teste ou curl)
    if (!origem || origensPermitidas.includes(origem)) {
      return callback(null, true);
    }
    return callback(new Error('Acesso bloqueado pela política de CORS da aplicação.'));
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
