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

/**
 * Rótulos para as 6 etapas distintas de progresso dos documentos
 */
export const ROTULOS_STATUS_ETAPA_DOCUMENTO = {
  pendente_obtencao: {
    texto: 'Pendente de Obtenção',
    variante: 'atencao',
    rotuloCurto: '1. Obtenção',
    badge: '⏳ Pendente de Obtenção',
    descricao: 'Documento ainda não providenciado ou aguardando emissão pelo órgão competente.',
    fase: 'preparacao',
  },
  obtido: {
    texto: 'Documento Obtido',
    variante: 'info',
    rotuloCurto: '2. Obtido',
    badge: '📄 Documento Obtido',
    descricao: 'Documento emitido e em posse do candidato (físico ou arquivo digital).',
    fase: 'preparacao',
  },
  conferido: {
    texto: 'Documento Conferido',
    variante: 'info',
    rotuloCurto: '3. Conferido',
    badge: '🔍 Documento Conferido',
    descricao: 'Legibilidade, período de validade, assinaturas e formato técnico (PDF) conferidos.',
    fase: 'preparacao',
  },
  enviado: {
    texto: 'Documento Enviado',
    variante: 'sucesso',
    rotuloCurto: '4. Enviado',
    badge: '🚀 Documento Enviado',
    descricao: 'Anexo transmitido pelo canal oficial correto dentro do prazo estipulado.',
    fase: 'envio',
  },
  recebimento_confirmado: {
    texto: 'Recebimento Confirmado',
    variante: 'sucesso',
    rotuloCurto: '5. Recebido',
    badge: '📬 Recebimento Confirmado',
    descricao: 'Protocolo de entrega ou recibo emitido pelo sistema/órgão e arquivado pelo candidato.',
    fase: 'envio',
  },
  validado_instituicao: {
    texto: 'Validado pela Instituição',
    variante: 'primario',
    rotuloCurto: '6. Validado Oficialmente',
    badge: '🏛️ Validado pela Instituição',
    descricao: 'Documento deferido e aprovado pela banca examinadora em resultado oficial homologado.',
    fase: 'institucional',
  },
};

/**
 * Rótulos e cores para classificação da fonte de informação e evidências
 */
export const ROTULOS_CLASSIFICACAO_FONTE = {
  confirmado_edital: {
    texto: 'Confirmado no Edital',
    variante: 'info',
    badge: '📘 Confirmado no Edital',
    cor: '#18324b',
    fundo: '#e0f2fe',
    borda: '#bae6fd',
    descricao: 'Informação extraída e sustentada com citação literal no texto original do edital.',
  },
  confirmado_outra_fonte: {
    texto: 'Confirmado em Outra Fonte Oficial',
    variante: 'sucesso',
    badge: '🌐 Fonte Oficial Externa',
    cor: '#0369a1',
    fundo: '#f0f9ff',
    borda: '#7dd3fc',
    descricao: 'Informação confirmada em página, manual ou comunicado oficial da instituição parceira.',
  },
  recomendacao_organizacao: {
    texto: 'Recomendação de Organização',
    variante: 'atencao',
    badge: '💡 Sugestão de Organização',
    cor: '#b45309',
    fundo: '#fef3c7',
    borda: '#fde68a',
    descricao: 'Boa prática recomendada pela plataforma para evitar perda de prazos (não é obrigação do edital).',
  },
  nao_localizado: {
    texto: 'Não Localizado no Edital',
    variante: 'perigo',
    badge: '❓ Não Localizado',
    cor: '#dc2626',
    fundo: '#fee2e2',
    borda: '#fecaca',
    descricao: 'Informação não explicitada no documento. Pendência sinalizada para conferência com a instituição.',
  },
  ambiguo_pendente: {
    texto: 'Ambíguo ou Pendente de Confirmação',
    variante: 'atencao',
    badge: '⚠️ Pendente de Confirmação',
    cor: '#d97706',
    fundo: '#fffbeb',
    borda: '#fde68a',
    descricao: 'Informação com redação dúbia, prazos conflitantes ou que depende de publicação de retificação.',
  },
};

