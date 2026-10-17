import { z } from 'zod';

export const esquemaCriarTarefa = z.object({
  analise_id: z.coerce.number().int().positive('O identificador da análise é obrigatório.'),
  requisito_id: z.coerce.number().int().positive().nullable().optional(),
  documento_id: z.coerce.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'O título da tarefa é obrigatório.').max(255),
  descricao: z.string().nullable().optional(),
  data_limite: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'A data limite deve estar no formato YYYY-MM-DD.')
    .nullable()
    .optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  status: z.enum(['pendente', 'em_andamento', 'concluida', 'bloqueada', 'nao_se_aplica']).default('pendente'),
});

export const esquemaAtualizarTarefa = z.object({
  requisito_id: z.coerce.number().int().positive().nullable().optional(),
  documento_id: z.coerce.number().int().positive().nullable().optional(),
  titulo: z.string().min(2).max(255).optional(),
  descricao: z.string().nullable().optional(),
  data_limite: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'A data limite deve estar no formato YYYY-MM-DD.')
    .nullable()
    .optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  status: z.enum(['pendente', 'em_andamento', 'concluida', 'bloqueada', 'nao_se_aplica']).optional(),
});

export const esquemaAlterarStatusTarefa = z.object({
  status: z.enum(['pendente', 'em_andamento', 'concluida', 'bloqueada', 'nao_se_aplica'], {
    required_error: 'O novo status da atividade é obrigatório.',
    invalid_type_error: 'Status inválido. Escolha entre: pendente, em_andamento, concluida, bloqueada ou nao_se_aplica.',
  }),
});
