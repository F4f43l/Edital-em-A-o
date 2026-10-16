-- =============================================================================
-- PROJETO EDITAL EM AÇÃO - BANCO DE DADOS MYSQL
-- Schema Relacional em conformidade com a Especificação Técnica (ODS 10)
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS edital_em_acao
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE edital_em_acao;

-- Desativar verificação de FK temporariamente para recriação limpa quando executado
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS documentos_exigidos;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS requisitos;
DROP TABLE IF EXISTS analises;
DROP TABLE IF EXISTS perfis;
DROP TABLE IF EXISTS editais;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. TABELA: editais
-- Armazena os editais cadastrados manualmente ou via upload de PDF.
-- -----------------------------------------------------------------------------
CREATE TABLE editais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  instituicao VARCHAR(255) NULL,
  categoria VARCHAR(100) NOT NULL DEFAULT 'Outro',
  resumo TEXT NULL,
  url_origem VARCHAR(500) NULL,
  nome_arquivo VARCHAR(255) NULL,
  caminho_arquivo VARCHAR(500) NULL,
  texto_extraido MEDIUMTEXT NULL,
  prazo_inscricao DATE NULL,
  prazo_recurso DATE NULL,
  data_resultado DATE NULL,
  status ENUM('rascunho', 'ativo', 'encerrado', 'arquivado') NOT NULL DEFAULT 'ativo',
  custos_logistica JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_editais_status (status),
  INDEX idx_editais_categoria (categoria),
  INDEX idx_editais_prazo (prazo_inscricao),
  INDEX idx_editais_titulo (titulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABELA: perfis
-- Armazena perfis minimizados do usuário para conferência com requisitos.
-- Não armazena dados ultrassensíveis (sem CPF, dados bancários ou saúde).
-- -----------------------------------------------------------------------------
CREATE TABLE perfis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_exibicao VARCHAR(150) NOT NULL,
  nivel_ensino VARCHAR(100) NULL,
  instituicao VARCHAR(255) NULL,
  curso VARCHAR(255) NULL,
  municipio VARCHAR(150) NULL,
  situacao_trabalho VARCHAR(100) NULL,
  faixa_renda VARCHAR(100) NULL,
  tamanho_familia INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_perfis_nome (nome_exibicao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABELA: analises
-- Registra a análise orientativa de um edital em relação ao perfil do usuário.
-- Vínculo com edital em CASCADE (exclusão do edital remove suas análises).
-- Vínculo com perfil em ON DELETE SET NULL (preserva histórico de análises).
-- -----------------------------------------------------------------------------
CREATE TABLE analises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  edital_id INT NOT NULL,
  perfil_id INT NULL,
  resumo TEXT NULL,
  resultado_orientativo ENUM('possivel_compatibilidade', 'criterios_incompativeis', 'faltam_informacoes', 'pendente') NOT NULL DEFAULT 'pendente',
  status ENUM('pendente', 'concluida', 'falhou', 'manual') NOT NULL DEFAULT 'pendente',
  provedor_ia VARCHAR(50) NOT NULL DEFAULT 'manual',
  modelo_ia VARCHAR(100) NULL,
  custos_logistica JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_analises_edital FOREIGN KEY (edital_id)
    REFERENCES editais (id) ON DELETE CASCADE,
  CONSTRAINT fk_analises_perfil FOREIGN KEY (perfil_id)
    REFERENCES perfis (id) ON DELETE SET NULL,
  INDEX idx_analises_edital (edital_id),
  INDEX idx_analises_perfil (perfil_id),
  INDEX idx_analises_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABELA: requisitos
-- Armazena os critérios e exigências extraídos ou inseridos manualmente.
-- Vinculado à análise por CASCADE.
-- -----------------------------------------------------------------------------
CREATE TABLE requisitos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analise_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  tipo ENUM('elegibilidade', 'documento', 'etapa', 'prazo', 'outro') NOT NULL DEFAULT 'outro',
  obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
  status_perfil ENUM('atendido', 'nao_atendido', 'confirmar', 'nao_aplicavel') NOT NULL DEFAULT 'confirmar',
  evidencia_texto TEXT NULL,
  pagina_origem INT NULL,
  origem_dado ENUM('ia', 'manual', 'extraido_pdf', 'exemplo') NOT NULL DEFAULT 'manual',
  observacao TEXT NULL,
  procedimento_detalhado JSON NULL,
  classificacao_fonte ENUM('confirmado_edital', 'confirmado_outra_fonte', 'recomendacao_organizacao', 'nao_localizado', 'ambiguo_pendente') NOT NULL DEFAULT 'confirmado_edital',
  secao_edital VARCHAR(150) NULL,
  link_fonte_oficial VARCHAR(500) NULL,
  data_verificacao_externa DATE NULL,
  observacao_pendencia TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_requisitos_analise FOREIGN KEY (analise_id)
    REFERENCES analises (id) ON DELETE CASCADE,
  INDEX idx_requisitos_analise (analise_id),
  INDEX idx_requisitos_tipo (tipo),
  INDEX idx_requisitos_status_perfil (status_perfil),
  INDEX idx_requisitos_fonte (classificacao_fonte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABELA: documentos_exigidos
-- Armazena o tratamento individual de cada documento com seu procedimento completo,
-- canal de entrega, condições de validade, etapas de progresso e checklist independente.
-- -----------------------------------------------------------------------------
CREATE TABLE documentos_exigidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analise_id INT NOT NULL,
  requisito_id INT NULL,
  nome VARCHAR(255) NOT NULL,
  finalidade TEXT NULL,
  quem_fornece VARCHAR(255) NULL,
  orgao_emissor VARCHAR(255) NULL,
  como_obter TEXT NULL,
  documentos_alternativos TEXT NULL,
  formato_aceito VARCHAR(255) NULL,
  exigencias_validade TEXT NULL,
  local_entrega VARCHAR(255) NULL,
  url_entrega VARCHAR(500) NULL,
  secao_entrega VARCHAR(255) NULL,
  etapa_processo VARCHAR(150) NULL,
  prazo_envio DATE NULL,
  prazo_envio_descricao VARCHAR(255) NULL,
  como_confirmar_envio TEXT NULL,
  instrucoes_protocolo TEXT NULL,
  status_etapa ENUM(
    'pendente_obtencao',
    'obtido',
    'conferido',
    'enviado',
    'recebimento_confirmado',
    'validado_instituicao'
  ) NOT NULL DEFAULT 'pendente_obtencao',
  checklist_etapas JSON NULL,
  protocolo_comprovante VARCHAR(255) NULL,
  classificacao_fonte ENUM(
    'confirmado_edital',
    'confirmado_outra_fonte',
    'recomendacao_organizacao',
    'nao_localizado',
    'ambiguo_pendente'
  ) NOT NULL DEFAULT 'confirmado_edital',
  secao_edital VARCHAR(150) NULL,
  pagina_origem INT NULL,
  trecho_evidencia TEXT NULL,
  link_fonte_oficial VARCHAR(500) NULL,
  data_verificacao_externa DATE NULL,
  observacao_pendencia TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_documentos_analise FOREIGN KEY (analise_id)
    REFERENCES analises (id) ON DELETE CASCADE,
  CONSTRAINT fk_documentos_requisito FOREIGN KEY (requisito_id)
    REFERENCES requisitos (id) ON DELETE SET NULL,
  INDEX idx_documentos_analise (analise_id),
  INDEX idx_documentos_requisito (requisito_id),
  INDEX idx_documentos_status (status_etapa),
  INDEX idx_documentos_fonte (classificacao_fonte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABELA: tarefas (Plano de Ação / Checklist)
-- Tarefas práticas geradas a partir da análise ou criadas pelo usuário.
-- Vínculo com análise por CASCADE. Vínculo com requisito opcional (SET NULL).
-- -----------------------------------------------------------------------------
CREATE TABLE tarefas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analise_id INT NOT NULL,
  requisito_id INT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  data_limite DATE NULL,
  prioridade ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
  status ENUM('pendente', 'em_andamento', 'concluida', 'bloqueada', 'nao_se_aplica') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tarefas_analise FOREIGN KEY (analise_id)
    REFERENCES analises (id) ON DELETE CASCADE,
  CONSTRAINT fk_tarefas_requisito FOREIGN KEY (requisito_id)
    REFERENCES requisitos (id) ON DELETE SET NULL,
  INDEX idx_tarefas_analise (analise_id),
  INDEX idx_tarefas_status (status),
  INDEX idx_tarefas_prioridade (prioridade),
  INDEX idx_tarefas_data_limite (data_limite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
