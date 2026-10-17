import { z } from 'zod';

export const STATUS_ETAPA_ENUM = [
  'pendente_obtencao',
  'obtido',
  'conferido',
  'enviado',
  'recebimento_confirmado',
  'validado_instituicao',
];

export const CLASSIFICACAO_FONTE_ENUM = [
  'confirmado_edital',
  'confirmado_outra_fonte',
  'recomendacao_organizacao',
  'nao_localizado',
  'ambiguo_pendente',
];

export const esquemaCriarDocumento = z.object({
  analise_id: z.coerce.number().int().positive('O ID da análise é obrigatório.'),
  requisito_id: z.coerce.number().int().positive().nullable().optional(),
  nome: z.string().min(2, 'O nome do documento é obrigatório.').max(255),
  nome_simples: z.string().max(255).nullable().optional(),
  finalidade: z.string().nullable().optional(),
  quem_fornece: z.string().max(255).nullable().optional(),
  orgao_emissor: z.string().max(255).nullable().optional(),
  como_obter: z.string().nullable().optional(),
  dados_solicitacao: z.string().nullable().optional(),
  documentos_alternativos: z.string().nullable().optional(),
  formato_aceito: z.string().max(255).nullable().optional(),
  exigencias_validade: z.string().nullable().optional(),
  instrucoes_preparacao: z.string().nullable().optional(),
  como_digitalizar: z.string().nullable().optional(),
  local_entrega: z.string().max(255).nullable().optional(),
  url_entrega: z.string().max(500).nullable().optional(),
  secao_entrega: z.string().max(255).nullable().optional(),
  etapa_processo: z.string().max(150).nullable().optional(),
  prazo_envio: z.string().nullable().optional(),
  prazo_envio_descricao: z.string().max(255).nullable().optional(),
  como_confirmar_envio: z.string().nullable().optional(),
  instrucoes_protocolo: z.string().nullable().optional(),
  status_etapa: z.enum(STATUS_ETAPA_ENUM).default('pendente_obtencao'),
  checklist_etapas: z.record(z.any()).nullable().optional(),
  protocolo_comprovante: z.string().max(255).nullable().optional(),
  classificacao_fonte: z.enum(CLASSIFICACAO_FONTE_ENUM).default('confirmado_edital'),
  secao_edital: z.string().max(150).nullable().optional(),
  pagina_origem: z.coerce.number().int().positive().nullable().optional(),
  trecho_evidencia: z.string().nullable().optional(),
  link_fonte_oficial: z.string().max(500).nullable().optional(),
  data_verificacao_externa: z.string().nullable().optional(),
  observacao_pendencia: z.string().nullable().optional(),
});

export const esquemaAtualizarDocumento = z.object({
  requisito_id: z.coerce.number().int().positive().nullable().optional(),
  nome: z.string().min(2).max(255).optional(),
  nome_simples: z.string().max(255).nullable().optional(),
  finalidade: z.string().nullable().optional(),
  quem_fornece: z.string().max(255).nullable().optional(),
  orgao_emissor: z.string().max(255).nullable().optional(),
  como_obter: z.string().nullable().optional(),
  dados_solicitacao: z.string().nullable().optional(),
  documentos_alternativos: z.string().nullable().optional(),
  formato_aceito: z.string().max(255).nullable().optional(),
  exigencias_validade: z.string().nullable().optional(),
  instrucoes_preparacao: z.string().nullable().optional(),
  como_digitalizar: z.string().nullable().optional(),
  local_entrega: z.string().max(255).nullable().optional(),
  url_entrega: z.string().max(500).nullable().optional(),
  secao_entrega: z.string().max(255).nullable().optional(),
  etapa_processo: z.string().max(150).nullable().optional(),
  prazo_envio: z.string().nullable().optional(),
  prazo_envio_descricao: z.string().max(255).nullable().optional(),
  como_confirmar_envio: z.string().nullable().optional(),
  instrucoes_protocolo: z.string().nullable().optional(),
  status_etapa: z.enum(STATUS_ETAPA_ENUM).optional(),
  checklist_etapas: z.record(z.any()).nullable().optional(),
  protocolo_comprovante: z.string().max(255).nullable().optional(),
  classificacao_fonte: z.enum(CLASSIFICACAO_FONTE_ENUM).optional(),
  secao_edital: z.string().max(150).nullable().optional(),
  pagina_origem: z.coerce.number().int().positive().nullable().optional(),
  trecho_evidencia: z.string().nullable().optional(),
  link_fonte_oficial: z.string().max(500).nullable().optional(),
  data_verificacao_externa: z.string().nullable().optional(),
  observacao_pendencia: z.string().nullable().optional(),
});

export const esquemaAtualizarStatusEtapa = z.object({
  status_etapa: z.enum(STATUS_ETAPA_ENUM, {
    errorMap: () => ({ message: 'Status da etapa inválido. Valores aceitos: pendente_obtencao, obtido, conferido, enviado, recebimento_confirmado, validado_instituicao.' }),
  }),
});

export const esquemaAtualizarChecklist = z
  .object({
    checklist_etapas: z
      .object({
        entender_necessidade: z.boolean().optional(),
        obter_documento: z.boolean().optional(),
        conferir_validade_formato: z.boolean().optional(),
        enviar_canal_correto: z.boolean().optional(),
        registrar_protocolo: z.boolean().optional(),
        observacoes_usuario: z.string().optional(),
      })
      .optional(),
    checklist: z
      .object({
        entender_necessidade: z.boolean().optional(),
        obter_documento: z.boolean().optional(),
        conferir_validade_formato: z.boolean().optional(),
        enviar_canal_correto: z.boolean().optional(),
        registrar_protocolo: z.boolean().optional(),
        observacoes_usuario: z.string().optional(),
      })
      .optional(),
  })
  .transform((dados) => ({
    checklist_etapas: dados.checklist_etapas || dados.checklist || {},
  }));

export const esquemaAtualizarProtocolo = z.object({
  protocolo_comprovante: z.string().max(255, 'Número de protocolo excede 255 caracteres.'),
});
