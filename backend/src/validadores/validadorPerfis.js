import { z } from 'zod';

export const esquemaCriarPerfil = z.object({
  nome_exibicao: z
    .string({ required_error: 'O nome de exibição é obrigatório.' })
    .min(2, 'O nome deve ter no mínimo 2 caracteres.')
    .max(150, 'O nome não pode exceder 150 caracteres.'),
  nivel_ensino: z.string().max(100).nullable().optional(),
  instituicao: z.string().max(255).nullable().optional(),
  curso: z.string().max(255).nullable().optional(),
  municipio: z.string().max(150).nullable().optional(),
  situacao_trabalho: z.string().max(100).nullable().optional(),
  faixa_renda: z.string().max(100).nullable().optional(),
  tamanho_familia: z
    .preprocess(
      (valor) => (valor === '' || valor === null || valor === undefined ? null : Number(valor)),
      z.number().int().min(1, 'O tamanho da família deve ser pelo menos 1.').max(50).nullable().optional()
    ),
});

export const esquemaAtualizarPerfil = esquemaCriarPerfil.partial();
