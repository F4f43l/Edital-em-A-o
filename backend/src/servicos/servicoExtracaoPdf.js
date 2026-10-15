import fs from 'fs';
import pdfParse from 'pdf-parse';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoExtracaoPdf = {
  /**
   * Extrai o texto real pesquisável e metadados de um arquivo PDF no servidor.
   */
  async extrairTextoPdf(caminhoArquivo) {
    if (!fs.existsSync(caminhoArquivo)) {
      throw new ErroAplicacao('O arquivo do edital não foi encontrado no servidor.', 404, 'ARQUIVO_NAO_ENCONTRADO');
    }

    try {
      const buffer = fs.readFileSync(caminhoArquivo);
      if (!buffer || buffer.length === 0) {
        throw new ErroAplicacao('O arquivo PDF enviado está vazio (0 bytes).', 400, 'ARQUIVO_VAZIO');
      }

      const dadosPdf = await pdfParse(buffer, {
        max: 50, // Limite de 50 páginas para proteção contra sobrecarga
      });

      const texto = (dadosPdf.text || '').trim();

      if (!texto || texto.length < 20) {
        throw new ErroAplicacao(
          'Não foi possível identificar camada de texto pesquisável no PDF. O arquivo pode ser uma imagem digitalizada/escaneada ou estar protegido por senha. Por favor, forneça um PDF com texto selecionável.',
          400,
          'PDF_SEM_TEXTO_PESQUISAVEL'
        );
      }

      return {
        textoExtraido: texto,
        totalPaginas: dadosPdf.numpages || 1,
        metadados: dadosPdf.info || {},
      };
    } catch (erro) {
      if (erro instanceof ErroAplicacao) {
        throw erro;
      }
      console.error('[ERRO EXTRACAO PDF]', erro.message);
      throw new ErroAplicacao(
        `Falha ao ler o arquivo PDF: ${erro.message || 'Arquivo corrompido ou formato incompatível'}. Certifique-se de que é um documento válido.`,
        400,
        'FALHA_LEITURA_PDF'
      );
    }
  },
};
