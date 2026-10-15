import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { configuracaoAmbiente } from '../configuracao/ambiente.js';
import { ErroAplicacao } from './manipuladorErros.js';

const caminhoArquivoAtual = fileURLToPath(import.meta.url);
const diretorioAtual = path.dirname(caminhoArquivoAtual);
const caminhoPastaUploads = path.resolve(diretorioAtual, '../../uploads');

if (!fs.existsSync(caminhoPastaUploads)) {
  fs.mkdirSync(caminhoPastaUploads, { recursive: true });
}

const armazenamento = multer.diskStorage({
  destination: (requisicao, arquivo, retorno) => {
    retorno(null, caminhoPastaUploads);
  },
  filename: (requisicao, arquivo, retorno) => {
    const identificadorAleatorio = crypto.randomBytes(12).toString('hex');
    const extensaoSegura = '.pdf';
    retorno(null, `edital_${Date.now()}_${identificadorAleatorio}${extensaoSegura}`);
  },
});

const filtroArquivo = (requisicao, arquivo, retorno) => {
  const mimeValido = arquivo.mimetype === 'application/pdf';
  const extensaoValida = path.extname(arquivo.originalname).toLowerCase() === '.pdf';

  if (!mimeValido && !extensaoValida) {
    return retorno(
      new ErroAplicacao(
        'Tipo de arquivo não permitido. Apenas documentos no formato PDF são aceitos pela plataforma.',
        415,
        'TIPO_ARQUIVO_NAO_SUPORTADO'
      ),
      false
    );
  }
  retorno(null, true);
};

export const intermediarioUploadPdf = multer({
  storage: armazenamento,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: configuracaoAmbiente.LIMITE_UPLOAD_MB * 1024 * 1024,
  },
});
