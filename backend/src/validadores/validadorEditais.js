import { z } from 'zod';

export const esquemaCriarEdital = z.object({
  titulo: z
    .string({ required_error: 'O título do edital é obrigatório.' })
    .min(3, 'O título do edital deve ter pelo menos 3 caracteres.')
    .max(255, 'O título não pode exceder 255 caracteres.'),
  instituicao: z.string().max(255, 'O nome da instituição não pode exceder 255 caracteres.').nullable().optional(),
  categoria: z.string().max(100, 'A categoria não pode exceder 100 caracteres.').default('Outro'),
  resumo: z.string().nullable().optional(),
  url_origem: z.string().max(500, 'A URL de origem não pode exceder 500 caracteres.').nullable().optional(),
  prazo_inscricao: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'O prazo de inscrição deve estar no formato YYYY-MM-DD.')
    .nullable()
    .optional(),
  prazo_recurso: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'O prazo de recurso deve estar no formato YYYY-MM-DD.')
    .nullable()
    .optional(),
  data_resultado: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'A data de resultado deve estar no formato YYYY-MM-DD.')
    .nullable()
    .optional(),
  status: z.enum(['rascunho', 'ativo', 'encerrado', 'arquivado']).default('ativo'),
  texto_extraido: z.string().nullable().optional(),
  custos_logistica: z.any().nullable().optional(),
});

export const esquemaAtualizarEdital = esquemaCriarEdital.partial();
