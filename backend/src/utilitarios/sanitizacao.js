import path from 'path';

/**
 * Sanitiza o nome original de um arquivo para exibição segura,
 * prevenindo ataques de injeção de caminho (path traversal) e caracteres especiais indevidos.
 */
export function sanitizarNomeArquivo(nomeOriginal) {
  if (!nomeOriginal || typeof nomeOriginal !== 'string') {
    return 'documento.pdf';
  }
  const nomeBase = path.basename(nomeOriginal);
  const sanitizado = nomeBase
    .replace(/[^\w\d_.-]/gi, '_')
    .replace(/_{2,}/g, '_');

  return sanitizado.slice(0, 200) || 'documento.pdf';
}
