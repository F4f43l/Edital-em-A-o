import { z } from 'zod';

export const esquemaCriarAnalise = z.object({
  edital_id: z.coerce.number().int().positive('O identificador do edital é obrigatório.'),
  perfil_id: z.coerce.number().int().positive().nullable().optional(),
  resumo: z.string().nullable().optional(),
  resultado_orientativo: z
    .enum(['possivel_compatibilidade', 'criterios_incompativeis', 'faltam_informacoes', 'pendente'])
    .default('pendente'),
  status: z.enum(['pendente', 'concluida', 'falhou', 'manual']).default('pendente'),
  provedor_ia: z.string().max(50).default('manual'),
  modelo_ia: z.string().max(100).nullable().optional(),
  custos_logistica: z.any().nullable().optional(),
});

export const esquemaAtualizarAnalise = z.object({
  resumo: z.string().nullable().optional(),
  resultado_orientativo: z
    .enum(['possivel_compatibilidade', 'criterios_incompativeis', 'faltam_informacoes', 'pendente'])
    .optional(),
  status: z.enum(['pendente', 'concluida', 'falhou', 'manual']).optional(),
  custos_logistica: z.any().nullable().optional(),
});
