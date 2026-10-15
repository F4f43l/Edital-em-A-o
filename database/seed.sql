-- =============================================================================
-- PROJETO EDITAL EM AÇÃO - SEED DE DEMONSTRAÇÃO
-- Dados iniciais realistas e categorizados claramente como demonstração
-- =============================================================================

USE edital_em_acao;

-- Limpar dados anteriores de forma controlada
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tarefas;
TRUNCATE TABLE requisitos;
TRUNCATE TABLE analises;
TRUNCATE TABLE perfis;
TRUNCATE TABLE editais;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. SEED: editais (Identificados claramente como demonstração)
-- -----------------------------------------------------------------------------
INSERT INTO editais (id, titulo, instituicao, categoria, resumo, url_origem, nome_arquivo, caminho_arquivo, texto_extraido, prazo_inscricao, prazo_recurso, data_resultado, status, custos_logistica) VALUES
(
  1,
  '[DEMONSTRAÇÃO] Programa Bolsa Permanência Universitária 2026/1',
  'Fundação Universitária de Apoio ao Estudante (FUAE)',
  'Bolsa de Estudos',
  'Edital para concessão de bolsas mensais de permanência e auxílio transporte para estudantes de graduação presencial em situação de vulnerabilidade socioeconômica. Renda familiar per capita máxima de até 1,5 salário mínimo.',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  'edital_fuae_bolsa_2026_exemplo.pdf',
  'uploads/exemplo_edital_fuae.pdf',
  'EDITAL Nº 01/2026 - FUAE - PROGRAMA DE BOLSA PERMANÊNCIA E AUXÍLIO TRANSPORTE\n\n1. DO OBJETIVO: Concessão de 200 bolsas mensais no valor de R$ 700,00 para estudantes matriculados em cursos de graduação presencial.\n\n2. DOS REQUISITOS DE ELEGIBILIDADE:\n2.1 Estar regularmente matriculado em curso de graduação presencial da instituição parceira.\n2.2 Comprovar renda familiar bruta per capita de até 1,5 (um vírgula cinco) salário mínimo nacional vigente.\n2.3 Não possuir vínculo empregatício formal nem ser beneficiário de outra bolsa institucional de mesma natureza.\n2.4 Residir no município sede ou região metropolitana atendida.\n\n3. DA DOCUMENTAÇÃO EXIGIDA:\n3.1 Cópia do documento de identidade oficial com foto (RG ou CNH).\n3.2 Comprovante de matrícula atualizado no semestre 2026/1.\n3.3 Comprovante de endereço recente (máximo 90 dias).\n3.4 Comprovantes de renda de todos os membros do grupo familiar ou declaração de trabalho autônomo.\n3.5 Histórico escolar da graduação demonstrando aproveitamento mínimo de 75% dos créditos cursados.\n\n4. DO CRONOGRAMA E PRAZOS:\n4.1 Período de inscrições: de 01/11/2026 até 30/11/2026 às 23h59 via portal do candidato.\n4.2 Divulgação do resultado preliminar: 10/12/2026.\n4.3 Período para interposição de recursos: 11/12/2026 e 12/12/2026.\n4.4 Resultado final homologado: 18/12/2026.',
  '2026-11-30',
  '2026-12-12',
  '2026-12-18',
  'ativo',
  '{"taxa_inscricao":{"valor":"Gratuito","possui_taxa":false,"prazo_pagamento":"Não aplicável (processo isento de taxa)","instrucoes_pagamento":"Inscrição gratuita para estudantes de graduação via portal do candidato.","trecho_evidencia":"1. DO OBJETIVO: Concessão de 200 bolsas mensais no valor de R$ 700,00 para estudantes matriculados em cursos de graduação presencial.","pagina_origem":1},"isencao":{"possui_isencao":false,"prazo_solicitacao":"Não aplicável (sem cobrança de taxa)","regras_isencao":"Não há cobrança de taxa de inscrição para este programa assistencial.","trecho_evidencia":null,"pagina_origem":null},"etapa_presencial":{"modalidade":"Não identificada prova presencial no edital","data_horario":"Não identificado no edital","cidade":"Não identificado no edital","endereco":"Não identificado no edital","exige_deslocamento":"Não determinado com as informações disponíveis no edital.","trecho_evidencia":"2.4 Residir no município sede ou região metropolitana atendida.","pagina_origem":1},"outros_custos":{"descricao":"Não identificado no edital. O programa prevê a concessão de bolsa permanência e auxílio transporte.","trecho_evidencia":"PROGRAMA DE BOLSA PERMANÊNCIA E AUXÍLIO TRANSPORTE","pagina_origem":1},"observacao_origem":"Informações extraídas exclusivamente do edital. Não foram utilizadas estimativas externas."}'
),
(
  2,
  '[DEMONSTRAÇÃO] Edital de Iniciação Científica e Inovação Tecnológica (PIBIC/PIBITI)',
  'Conselho de Pesquisa e Desenvolvimento Regional',
  'Iniciação Científica',
  'Seleção de bolsistas para projetos de pesquisa aplicada com duração de 12 meses. Exige proposta de plano de trabalho vinculada a orientador credenciado.',
  'https://exemplo.org.br/editais/pibic-2026',
  NULL,
  NULL,
  'EDITAL PIBIC 02/2026 - Concessão de cotas de bolsas para estudantes de graduação desenvolverem atividades de pesquisa científica. Prazo final de inscrição: 15/12/2026. Requer currículo Lattes atualizado nos últimos 30 dias e coeficiente de rendimento (CR) igual ou superior a 7,0.',
  '2026-12-15',
  NULL,
  NULL,
  'ativo'
),
(
  3,
  '[DEMONSTRAÇÃO] Programa Acelera Tech: Bolsas Integrais em Desenvolvimento Web',
  'Instituto Futuro Digital',
  'Capacitação/Curso',
  'Programa de formação intensiva para pessoas em transição de carreira ou início no mercado de tecnologia. Aulas remotas noturnas e mentoria profissional individual.',
  'https://exemplo.org.br/acelera-tech',
  NULL,
  NULL,
  'CHAMADA PÚBLICA 03/2026 - Formação em Desenvolvimento Web Fullstack. Inscrições abertas até 25/11/2026. Critérios: idade mínima de 18 anos, ensino médio completo, disponibilidade de 15 horas semanais.',
  '2026-11-25',
  NULL,
  NULL,
  'ativo'
);

-- -----------------------------------------------------------------------------
-- 2. SEED: perfis (Minimizados, para conferência orientativa)
-- -----------------------------------------------------------------------------
INSERT INTO perfis (id, nome_exibicao, nivel_ensino, instituicao, curso, municipio, situacao_trabalho, faixa_renda, tamanho_familia) VALUES
(
  1,
  'Maria Eduarda Silva (Perfil Demonstração)',
  'Graduação',
  'Universidade Federal do Sudeste',
  'Engenharia de Software',
  'São Paulo',
  'Estudante',
  'Até 1,5 salário mínimo',
  3
),
(
  2,
  'Carlos Alberto Santos (Perfil Demonstração)',
  'Ensino Médio',
  'Escola Estadual Central',
  'Ensino Médio Regular',
  'Rio de Janeiro',
  'Desempregado(a)',
  'Até 1,5 salário mínimo',
  4
);

-- -----------------------------------------------------------------------------
-- 3. SEED: analises
-- -----------------------------------------------------------------------------
INSERT INTO analises (id, edital_id, perfil_id, resumo, resultado_orientativo, status, provedor_ia, modelo_ia, custos_logistica) VALUES
(
  1,
  1,
  1,
  'Análise orientativa preliminar para o edital FUAE 2026. A estudante Maria Eduarda possui alto índice de compatibilidade com os critérios socioeconômicos e acadêmicos identificados. Há documentos comprobatórios que necessitam de providência antecipada.',
  'possivel_compatibilidade',
  'concluida',
  'manual',
  'demonstracao-assistida',
  '{"taxa_inscricao":{"valor":"Gratuito","possui_taxa":false,"prazo_pagamento":"Não aplicável (processo isento de taxa)","instrucoes_pagamento":"Inscrição gratuita para estudantes de graduação via portal do candidato.","trecho_evidencia":"1. DO OBJETIVO: Concessão de 200 bolsas mensais no valor de R$ 700,00 para estudantes matriculados em cursos de graduação presencial.","pagina_origem":1},"isencao":{"possui_isencao":false,"prazo_solicitacao":"Não aplicável (sem cobrança de taxa)","regras_isencao":"Não há cobrança de taxa de inscrição para este programa assistencial.","trecho_evidencia":null,"pagina_origem":null},"etapa_presencial":{"modalidade":"Não identificada prova presencial no edital","data_horario":"Não identificado no edital","cidade":"Não identificado no edital","endereco":"Não identificado no edital","exige_deslocamento":"Não determinado com as informações disponíveis no edital.","trecho_evidencia":"2.4 Residir no município sede ou região metropolitana atendida.","pagina_origem":1},"outros_custos":{"descricao":"Não identificado no edital. O programa prevê a concessão de bolsa permanência e auxílio transporte.","trecho_evidencia":"PROGRAMA DE BOLSA PERMANÊNCIA E AUXÍLIO TRANSPORTE","pagina_origem":1},"observacao_origem":"Informações extraídas exclusivamente do edital. Não foram utilizadas estimativas externas."}'
);

-- -----------------------------------------------------------------------------
-- 4. SEED: requisitos
-- -----------------------------------------------------------------------------
INSERT INTO requisitos (id, analise_id, titulo, descricao, tipo, obrigatorio, status_perfil, evidencia_texto, pagina_origem, origem_dado, observacao) VALUES
(
  1,
  1,
  'Matrícula em graduação presencial',
  'Estar regularmente matriculado em curso de graduação presencial de instituição conveniada.',
  'elegibilidade',
  TRUE,
  'atendido',
  '2.1 Estar regularmente matriculado em curso de graduação presencial da instituição parceira.',
  1,
  'exemplo',
  'Perfil informa graduação em Engenharia de Software na Universidade Federal do Sudeste.'
),
(
  2,
  1,
  'Renda familiar per capita de até 1,5 salário mínimo',
  'Comprovação de rendimento familiar compatível com o teto do programa.',
  'elegibilidade',
  TRUE,
  'atendido',
  '2.2 Comprovar renda familiar bruta per capita de até 1,5 (um vírgula cinco) salário mínimo nacional vigente.',
  1,
  'exemplo',
  'Perfil informa renda de até 1,5 salário mínimo com grupo familiar de 3 pessoas.'
),
(
  3,
  1,
  'Inexistência de vínculo empregatício formal',
  'Não possuir registro em carteira de trabalho ou outra bolsa incompatível.',
  'elegibilidade',
  TRUE,
  'atendido',
  '2.3 Não possuir vínculo empregatício formal nem ser beneficiário de outra bolsa institucional de mesma natureza.',
  1,
  'exemplo',
  'Perfil declarado como Estudante em dedicação integral.'
),
(
  4,
  1,
  'Comprovante de residência atualizado',
  'Apresentar conta de água, luz ou gás dos últimos 90 dias.',
  'documento',
  TRUE,
  'confirmar',
  '3.3 Comprovante de endereço recente (máximo 90 dias).',
  1,
  'exemplo',
  'Necessário emitir ou digitalizar comprovante recente no nome do estudante ou responsáveis.'
),
(
  5,
  1,
  'Histórico escolar com aproveitamento de 75%',
  'Comprovação de frequência e aprovação nas disciplinas cursadas.',
  'documento',
  TRUE,
  'confirmar',
  '3.5 Histórico escolar da graduação demonstrando aproveitamento mínimo de 75% dos créditos cursados.',
  1,
  'exemplo',
  'Aguardando emissão do histórico atualizado pelo portal acadêmico.'
),
(
  6,
  1,
  'Prazo de submissão da inscrição',
  'Submissão eletrônica no portal da FUAE impreterivelmente até o prazo.',
  'prazo',
  TRUE,
  'confirmar',
  '4.1 Período de inscrições: de 01/11/2026 até 30/11/2026 às 23h59 via portal do candidato.',
  2,
  'exemplo',
  'Prazo com margem de segurança recomendada para submissão até 27/11/2026.'
);

-- -----------------------------------------------------------------------------
-- 5. SEED: tarefas (Plano de Ação / Checklist)
-- -----------------------------------------------------------------------------
INSERT INTO tarefas (id, analise_id, requisito_id, titulo, descricao, data_limite, prioridade, status) VALUES
(
  1,
  1,
  4,
  'Obter comprovante de residência recente',
  'Separar e digitalizar em formato PDF nítido conta de consumo dos últimos 90 dias em nome da família.',
  '2026-11-15',
  'alta',
  'concluida'
),
(
  2,
  1,
  5,
  'Emitir histórico escolar oficial no SIGA',
  'Acessar o portal acadêmico e emitir o histórico escolar com chave de autenticidade eletrônica.',
  '2026-11-18',
  'alta',
  'em_andamento'
),
(
  3,
  1,
  2,
  'Reunir holerites e comprovantes de renda dos familiares',
  'Coletar contracheques dos últimos 3 meses dos membros economicamente ativos do grupo familiar.',
  '2026-11-20',
  'urgente',
  'pendente'
),
(
  4,
  1,
  6,
  'Submeter inscrição no portal do candidato FUAE',
  'Preencher o formulário online da FUAE e anexar toda a documentação comprobatória.',
  '2026-11-28',
  'urgente',
  'pendente'
),
(
  5,
  1,
  NULL,
  'Revisar checklist completo antes do envio definitivo',
  'Conferir legibilidade dos PDFs e confirmação de envio do protocolo.',
  '2026-11-27',
  'media',
  'pendente'
);
