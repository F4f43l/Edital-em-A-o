/**
 * Normaliza datas para o formato ISO YYYY-MM-DD suportado pelo MySQL DATE.
 */
export function normalizarData(valor) {
  if (!valor) return null;

  if (typeof valor === 'object' && valor instanceof Date) {
    if (isNaN(valor.getTime())) return null;
    return valor.toISOString().slice(0, 10);
  }

  const texto = String(valor).trim();
  if (!texto) return null;

  // Formato ISO: YYYY-MM-DD
  const correspondenciaIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (correspondenciaIso) {
    const [_, ano, mes, dia] = correspondenciaIso;
    const numAno = parseInt(ano, 10);
    const numMes = parseInt(mes, 10);
    const numDia = parseInt(dia, 10);
    if (numAno >= 1900 && numAno <= 2100 && numMes >= 1 && numMes <= 12 && numDia >= 1 && numDia <= 31) {
      return `${ano}-${mes}-${dia}`;
    }
  }

  // Formato padrão brasileiro: DD/MM/YYYY
  const correspondenciaBr = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (correspondenciaBr) {
    const [_, d, m, y] = correspondenciaBr;
    const diaFormatado = d.padStart(2, '0');
    const mesFormatado = m.padStart(2, '0');
    return `${y}-${mesFormatado}-${diaFormatado}`;
  }

  return null;
}
