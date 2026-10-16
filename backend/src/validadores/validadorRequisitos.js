import { z } from 'zod';

export const CLASSIFICACAO_FONTE_REQUISITO_ENUM = [
  'confirmado_edital',
  'confirmado_outra_fonte',
  'recomendacao_organizacao',
  'nao_localizado',
  'ambiguo_pendente',
];

export const esquemaCriarRequisito = z.object({
  analise_id: z.coerce.number().int().positive('O identificador da análise é obrigatório.'),
  titulo: z.string().min(2, 'O título do requisito é obrigatório.').max(255),
  descricao: z.string().nullable().optional(),
  tipo: z.enum(['elegibilidade', 'documento', 'etapa', 'prazo', 'outro']).default('outro'),
  obrigatorio: z.boolean().default(true),
  status_perfil: z.enum(['atendido', 'nao_atendido', 'confirmar', 'nao_aplicavel']).default('confirmar'),
  evidencia_texto: z.string().nullable().optional(),
  pagina_origem: z.coerce.number().int().positive().nullable().optional(),
  origem_dado: z.enum(['ia', 'manual', 'extraido_pdf', 'exemplo']).default('manual'),
  observacao: z.string().nullable().optional(),
  procedimento_detalhado: z.record(z.any()).nullable().optional(),
  classificacao_fonte: z.enum(CLASSIFICACAO_FONTE_REQUISITO_ENUM).default('confirmado_edital'),
  secao_edital: z.string().max(150).nullable().optional(),
  link_fonte_oficial: z.string().max(500).nullable().optional(),
  data_verificacao_externa: z.string().nullable().optional(),
  observacao_pendencia: z.string().nullable().optional(),
});

export const esquemaAtualizarRequisito = z.object({
  titulo: z.string().min(2).max(255).optional(),
  descricao: z.string().nullable().optional(),
  tipo: z.enum(['elegibilidade', 'documento', 'etapa', 'prazo', 'outro']).optional(),
  obrigatorio: z.boolean().optional(),
  status_perfil: z.enum(['atendido', 'nao_atendido', 'confirmar', 'nao_aplicavel']).optional(),
  evidencia_texto: z.string().nullable().optional(),
  pagina_origem: z.coerce.number().int().positive().nullable().optional(),
  origem_dado: z.enum(['ia', 'manual', 'extraido_pdf', 'exemplo']).optional(),
  observacao: z.string().nullable().optional(),
  procedimento_detalhado: z.record(z.any()).nullable().optional(),
  classificacao_fonte: z.enum(CLASSIFICACAO_FONTE_REQUISITO_ENUM).optional(),
  secao_edital: z.string().max(150).nullable().optional(),
  link_fonte_oficial: z.string().max(500).nullable().optional(),
  data_verificacao_externa: z.string().nullable().optional(),
  observacao_pendencia: z.string().nullable().optional(),
});
