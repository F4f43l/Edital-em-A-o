-- =============================================================================
-- MIGRAÇÃO: Suporte a tutorial individualizado de documentos e vínculo com tarefas
-- Execução idempotente (adiciona colunas apenas se não existirem)
-- =============================================================================

USE edital_em_acao;

-- 1. Colunas adicionais em documentos_exigidos para tutorial completo e acessível
SET @existe_nome_simples = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'documentos_exigidos' AND COLUMN_NAME = 'nome_simples'
);
SET @sql_nome_simples = IF(@existe_nome_simples = 0,
  'ALTER TABLE documentos_exigidos ADD COLUMN nome_simples VARCHAR(255) NULL AFTER nome;',
  'SELECT "Coluna nome_simples já existe";'
);
PREPARE stmt FROM @sql_nome_simples;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @existe_como_digitalizar = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'documentos_exigidos' AND COLUMN_NAME = 'como_digitalizar'
);
SET @sql_como_digitalizar = IF(@existe_como_digitalizar = 0,
  'ALTER TABLE documentos_exigidos ADD COLUMN como_digitalizar TEXT NULL AFTER exigencias_validade;',
  'SELECT "Coluna como_digitalizar já existe";'
);
PREPARE stmt FROM @sql_como_digitalizar;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @existe_instrucoes_preparacao = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'documentos_exigidos' AND COLUMN_NAME = 'instrucoes_preparacao'
);
SET @sql_instrucoes_preparacao = IF(@existe_instrucoes_preparacao = 0,
  'ALTER TABLE documentos_exigidos ADD COLUMN instrucoes_preparacao TEXT NULL AFTER exigencias_validade;',
  'SELECT "Coluna instrucoes_preparacao já existe";'
);
PREPARE stmt FROM @sql_instrucoes_preparacao;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @existe_dados_solicitacao = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'documentos_exigidos' AND COLUMN_NAME = 'dados_solicitacao'
);
SET @sql_dados_solicitacao = IF(@existe_dados_solicitacao = 0,
  'ALTER TABLE documentos_exigidos ADD COLUMN dados_solicitacao TEXT NULL AFTER como_obter;',
  'SELECT "Coluna dados_solicitacao já existe";'
);
PREPARE stmt FROM @sql_dados_solicitacao;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Coluna documento_id em tarefas para vincular diretamente ao documento individual
SET @existe_documento_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tarefas' AND COLUMN_NAME = 'documento_id'
);
SET @sql_documento_id = IF(@existe_documento_id = 0,
  'ALTER TABLE tarefas ADD COLUMN documento_id INT NULL AFTER requisito_id, ADD CONSTRAINT fk_tarefas_documento FOREIGN KEY (documento_id) REFERENCES documentos_exigidos(id) ON DELETE CASCADE, ADD INDEX idx_tarefas_documento (documento_id);',
  'SELECT "Coluna documento_id já existe";'
);
PREPARE stmt FROM @sql_documento_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
