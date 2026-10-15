/**
 * Formata data no padrão brasileiro pt-BR (DD/MM/YYYY)
 */
export function formatarDataPtBr(dataIso) {
  if (!dataIso) return 'Não informado';
  const dataLimpa = String(dataIso).slice(0, 10);
  const partes = dataLimpa.split('-');
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
  return dataIso;
}

/**
 * Calcula dias restantes para um prazo
 */
export function calcularDiasRestantes(dataIso) {
  if (!dataIso) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [ano, mes, dia] = String(dataIso).slice(0, 10).split('-').map(Number);
  const dataAlvo = new Date(ano, mes - 1, dia);

  const diferencaTempo = dataAlvo.getTime() - hoje.getTime();
  const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

  return diferencaDias;
}

/**
 * Retorna rótulos em português para os status de critérios e requisitos
 */
export const ROTULOS_STATUS_CRITERIO = {
  atendido: {
    texto: 'Parece atendido',
    variante: 'sucesso',
    descricao: 'As informações do seu perfil são compatíveis com o texto identificado.',
  },
  nao_atendido: {
    texto: 'Não parece atendido',
    variante: 'perigo',
    descricao: 'Há incompatibilidade aparente entre seu perfil e a regra do edital.',
  },
  confirmar: {
    texto: 'Precisa confirmar',
    variante: 'atencao',
    descricao: 'Informação ausente, ambígua ou que depende de avaliação da instituição.',
  },
  nao_aplicavel: {
    texto: 'Não se aplica',
    variante: 'neutro',
    descricao: 'Critério não incidente segundo as regras gerais do edital.',
  },
};

/**
 * Retorna rótulos em português para o resultado orientativo geral
 */
export const ROTULOS_RESULTADO_ORIENTATIVO = {
  possivel_compatibilidade: {
    texto: 'Possível Compatibilidade',
    variante: 'sucesso',
    explicacao: 'Com base nas informações fornecidas, seu perfil parece atender aos requisitos principais.',
  },
  criterios_incompativeis: {
    texto: 'Critérios Aparentemente Incompatíveis',
    variante: 'perigo',
    explicacao: 'Foram identificadas condições no edital que não parecem compatíveis com seu perfil.',
  },
  faltam_informacoes: {
    texto: 'Faltam Informações para Avaliar',
    variante: 'atencao',
    explicacao: 'Alguns critérios exigem confirmação documental ou preenchimento de campos adicionais no perfil.',
  },
  pendente: {
    texto: 'Análise Pendente',
    variante: 'neutro',
    explicacao: 'Aguardando processamento.',
  },
};

/**
 * Rótulos para prioridade das tarefas
 */
export const ROTULOS_PRIORIDADE = {
  urgente: { texto: 'Urgente', variante: 'perigo' },
  alta: { texto: 'Alta', variante: 'atencao' },
  media: { texto: 'Média', variante: 'info' },
  baixa: { texto: 'Baixa', variante: 'neutro' },
};

/**
 * Rótulos para status das tarefas
 */
export const ROTULOS_STATUS_TAREFA = {
  pendente: { texto: 'Pendente', variante: 'atencao' },
  em_andamento: { texto: 'Em andamento', variante: 'info' },
  concluida: { texto: 'Concluída', variante: 'sucesso' },
  bloqueada: { texto: 'Bloqueada', variante: 'perigo' },
  nao_se_aplica: { texto: 'Não se aplica', variante: 'neutro' },
};
