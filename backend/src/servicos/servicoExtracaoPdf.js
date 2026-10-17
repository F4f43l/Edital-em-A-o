import fs from 'fs';
import pdfParse from 'pdf-parse';
import { ErroAplicacao } from '../intermediarios/manipuladorErros.js';

export const servicoExtracaoPdf = {
  /**
   * Extrai o texto real pesquisável página por página e metadados de um arquivo PDF.
   * Identifica páginas digitalizadas (sem camada de texto OCR) com precisão.
   */
  async extrairTextoPdf(caminhoArquivo, opcoes = {}) {
    if (!fs.existsSync(caminhoArquivo)) {
      throw new ErroAplicacao('O arquivo do edital não foi encontrado no servidor.', 404, 'ARQUIVO_NAO_ENCONTRADO');
    }

    try {
      const buffer = fs.readFileSync(caminhoArquivo);
      if (!buffer || buffer.length === 0) {
        throw new ErroAplicacao('O arquivo PDF enviado está vazio (0 bytes).', 400, 'ARQUIVO_VAZIO');
      }

      const paginasExtraidas = [];
      const maxPaginas = opcoes?.max || 250;

      function pagerender(pageData) {
        return pageData.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        }).then(function (textContent) {
          const items = [...(textContent.items || [])];

          // Ordena visualmente: de cima para baixo (Y decrescente) e da esquerda para a direita (X crescente)
          items.sort((a, b) => {
            const yA = a.transform[5];
            const yB = b.transform[5];
            const diffY = yB - yA;
            if (Math.abs(diffY) > 2.8) {
              return diffY;
            }
            return a.transform[4] - b.transform[4];
          });

          // Agrupa itens em linhas visuais com tolerância de altura Y
          const linhas = [];
          let linhaAtual = null;

          for (const item of items) {
            const x = item.transform[4];
            const y = item.transform[5];
            const str = item.str;
            const width = item.width || (str.length * 5);

            if (!linhaAtual || Math.abs(y - linhaAtual.y) > 2.8) {
              linhaAtual = {
                y,
                itens: [{ x, y, width, str }],
              };
              linhas.push(linhaAtual);
            } else {
              linhaAtual.itens.push({ x, y, width, str });
            }
          }

          // Reconstrói o texto preservando colunas de tabelas e espaçamento horizontal
          const linhasTexto = linhas.map((linha) => {
            let textoLinha = '';
            let ultimoXFim = null;

            for (const it of linha.itens) {
              if (!it.str) continue;
              if (ultimoXFim === null) {
                textoLinha += it.str;
              } else {
                const espacoHorizontal = it.x - ultimoXFim;
                if (espacoHorizontal > 14) {
                  textoLinha += '   ' + it.str; // Tabulação/coluna de tabela
                } else if (espacoHorizontal > 1.5 || !textoLinha.endsWith(' ')) {
                  textoLinha += ' ' + it.str;
                } else {
                  textoLinha += it.str;
                }
              }
              ultimoXFim = it.x + (it.width || (it.str.length * 4.5));
            }

            return textoLinha;
          });

          const textoPagina = linhasTexto.join('\n').trim();
          const numeroPagina = pageData.pageIndex + 1;

          paginasExtraidas.push({
            numero: numeroPagina,
            texto: textoPagina,
            linhas: linhasTexto,
            caracteres: textoPagina.length,
          });

          return `\n[PÁGINA ${numeroPagina}]\n` + textoPagina;
        });
      }

      const dadosPdf = await pdfParse(buffer, {
        pagerender,
        max: maxPaginas,
      });

      const totalPaginas = dadosPdf.numpages || paginasExtraidas.length || 1;
      const textoTotal = paginasExtraidas
        .map((p) => `--- PÁGINA ${p.numero} ---\n${p.texto}`)
        .join('\n\n')
        .trim();

      // Diagnóstico de OCR e legibilidade
      const paginasSemTexto = paginasExtraidas
        .filter((p) => p.caracteres < 15)
        .map((p) => p.numero);

      const mediaCaracteresPorPagina = totalPaginas > 0 ? Math.round(textoTotal.length / totalPaginas) : 0;

      // Rejeição rigorosa quando o documento inteiro é uma imagem escaneada
      if (!textoTotal || textoTotal.length < 30 || (totalPaginas > 1 && mediaCaracteresPorPagina < 15)) {
        throw new ErroAplicacao(
          `Não foi possível identificar camada de texto pesquisável no PDF (${totalPaginas} páginas detectadas, mas nenhuma possui texto selecionável legível). O arquivo é uma imagem digitalizada/escaneada ou está protegido. Por favor, forneça um PDF com texto selecionável (ou utilize uma ferramenta de OCR prévia para gerar a camada de texto pesquisável).`,
          400,
          'PDF_SEM_TEXTO_PESQUISAVEL'
        );
      }

      let avisoDigitalizado = null;
      if (paginasSemTexto.length > 0 && paginasSemTexto.length < totalPaginas) {
        avisoDigitalizado = `Atenção: As páginas [${paginasSemTexto.join(', ')}] não contêm texto selecionável pesquisável (podem ser anexos ou formulários escaneados como imagem). Apenas as páginas com texto puderam ser analisadas.`;
      }

      return {
        textoExtraido: textoTotal,
        textoCompleto: textoTotal,
        totalPaginas,
        paginas: paginasExtraidas,
        paginasSemTexto,
        avisoDigitalizado,
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
