-- =============================================================================
-- PROJETO EDITAL EM AÇÃO - SEED DE DEMONSTRAÇÃO
-- Dados iniciais realistas e categorizados claramente como demonstração
-- =============================================================================

USE edital_em_acao;

-- Limpar dados anteriores de forma controlada
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE documentos_exigidos;
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
  'ativo',
  NULL
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
  'ativo',
  NULL
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
  'Análise orientativa preliminar para o edital FUAE 2026. A estudante Maria Eduarda possui alto índice de compatibilidade com os critérios socioeconômicos e acadêmicos identificados. Há documentos comprobatórios que necessitam de providência antecipada com procedimento completo de obtenção e envio.',
  'possivel_compatibilidade',
  'concluida',
  'manual',
  'demonstracao-assistida',
  '{"taxa_inscricao":{"valor":"Gratuito","possui_taxa":false,"prazo_pagamento":"Não aplicável (processo isento de taxa)","instrucoes_pagamento":"Inscrição gratuita para estudantes de graduação via portal do candidato.","trecho_evidencia":"1. DO OBJETIVO: Concessão de 200 bolsas mensais no valor de R$ 700,00 para estudantes matriculados em cursos de graduação presencial.","pagina_origem":1},"isencao":{"possui_isencao":false,"prazo_solicitacao":"Não aplicável (sem cobrança de taxa)","regras_isencao":"Não há cobrança de taxa de inscrição para este programa assistencial.","trecho_evidencia":null,"pagina_origem":null},"etapa_presencial":{"modalidade":"Não identificada prova presencial no edital","data_horario":"Não identificado no edital","cidade":"Não identificado no edital","endereco":"Não identificado no edital","exige_deslocamento":"Não determinado com as informações disponíveis no edital.","trecho_evidencia":"2.4 Residir no município sede ou região metropolitana atendida.","pagina_origem":1},"outros_custos":{"descricao":"Não identificado no edital. O programa prevê a concessão de bolsa permanência e auxílio transporte.","trecho_evidencia":"PROGRAMA DE BOLSA PERMANÊNCIA E AUXÍLIO TRANSPORTE","pagina_origem":1},"observacao_origem":"Informações extraídas exclusivamente do edital. Não foram utilizadas estimativas externas."}'
);

-- -----------------------------------------------------------------------------
-- 4. SEED: requisitos (Com Procedimentos Completos)
-- -----------------------------------------------------------------------------
INSERT INTO requisitos (id, analise_id, titulo, descricao, tipo, obrigatorio, status_perfil, evidencia_texto, pagina_origem, origem_dado, observacao, procedimento_detalhado, classificacao_fonte, secao_edital, link_fonte_oficial, data_verificacao_externa, observacao_pendencia) VALUES
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
  'Perfil informa graduação em Engenharia de Software na Universidade Federal do Sudeste.',
  '{"o_que_exige":"Vínculo ativo e regular em curso superior presencial de instituição de ensino conveniada.","condicao_valor":"Matrícula regular no semestre letivo 2026/1 em curso presencial.","quem_cumpre":"O estudante candidato.","como_verificar":"Consultar o comprovante ou atestado de matrícula emitido pelo sistema acadêmico da instituição conveniada.","documentos_comprobatorios":"Atestado de matrícula atualizado com código de autenticidade digital.","como_obter":"Acessar o portal acadêmico da universidade (SIGA) e emitir declaração/atestado de matrícula em PDF.","quem_emite":"Secretaria Acadêmica da instituição conveniada.","formatos_aceitos":"Arquivo PDF com código verificador ou QR Code.","exigencias_validade":"Emitido no semestre vigente (2026/1).","onde_entregar":"Portal do Candidato FUAE (aba Comprovação Acadêmica).","como_acessar_canal":"Acessar https://exemplo.org.br/editais/fuae-bolsa-2026 via navegador.","etapa_apresentacao":"Inscrição Inicial","prazo_entrega":"2026-11-30","prazo_entrega_descricao":"Até 30/11/2026 às 23h59","como_verificar_envio":"Conferir se o anexo exibe o status Arquivo Recebido na área do candidato.","como_guardar_protocolo":"Baixar o comprovante de inscrição em PDF e guardar o número do protocolo.","fonte_oficial":{"classificacao":"confirmado_edital","secao_edital":"Item 2.1 e Item 3.2 do Edital","pagina_origem":1,"trecho_evidencia":"2.1 Estar regularmente matriculado em curso de graduação presencial da instituição parceira.","link_oficial":"https://exemplo.org.br/editais/fuae-bolsa-2026"},"observacao_pendencia":null}',
  'confirmado_edital',
  'Item 2.1 e 3.2',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  2,
  1,
  'Renda familiar per capita de até 1,5 salário mínimo',
  'Comprovação de rendimento familiar compatível com o teto socioeconômico do programa.',
  'elegibilidade',
  TRUE,
  'atendido',
  '2.2 Comprovar renda familiar bruta per capita de até 1,5 (um vírgula cinco) salário mínimo nacional vigente.',
  1,
  'exemplo',
  'Perfil informa renda de até 1,5 salário mínimo com grupo familiar de 3 pessoas.',
  '{"o_que_exige":"Renda bruta mensal por pessoa da família igual ou inferior a 1,5 salário mínimo nacional vigente.","condicao_valor":"Soma de todos os rendimentos brutos dividida pelo número de moradores da residência <= 1,5 SM.","quem_cumpre":"Todos os integrantes do grupo familiar que residem no mesmo domicílio.","como_verificar":"Somar o rendimento de todos que trabalham ou recebem benefício e dividir pelo total de pessoas da casa.","documentos_comprobatorios":"Contracheques dos últimos 3 meses, extratos de benefício INSS, Carteira de Trabalho Digital ou declaração de autônomo.","como_obter":"Solicitar holerites ao empregador, extratos no Meu INSS ou preencher modelo de declaração de autônomo.","quem_emite":"Empregador, INSS, Receita Federal ou declaração assinada pelo declarante.","formatos_aceitos":"PDF legível, sem cortes nas assinaturas e valores.","exigencias_validade":"Últimos 3 meses de rendimentos; assinaturas físicas ou eletrônicas válidas.","onde_entregar":"Portal do Candidato FUAE (aba Comprovação Socioeconômica).","como_acessar_canal":"Portal do candidato na seção de anexos socioeconômicos.","etapa_apresentacao":"Inscrição Inicial","prazo_entrega":"2026-11-30","prazo_entrega_descricao":"Até 30/11/2026 às 23h59","como_verificar_envio":"Conferir se constam anexos para cada pessoa do grupo familiar declarada.","como_guardar_protocolo":"Salvar cópia de todas as declarações assinadas e o recibo de submissão.","fonte_oficial":{"classificacao":"confirmado_edital","secao_edital":"Item 2.2 e Item 3.4 do Edital","pagina_origem":1,"trecho_evidencia":"2.2 Comprovar renda familiar bruta per capita de até 1,5 (um vírgula cinco) salário mínimo nacional vigente.","link_oficial":"https://exemplo.org.br/editais/fuae-bolsa-2026"},"observacao_pendencia":null}',
  'confirmado_edital',
  'Item 2.2 e 3.4',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  3,
  1,
  'Inexistência de vínculo empregatício formal',
  'Não possuir registro em carteira de trabalho ou outra bolsa institucional de mesma natureza.',
  'elegibilidade',
  TRUE,
  'atendido',
  '2.3 Não possuir vínculo empregatício formal nem ser beneficiário de outra bolsa institucional de mesma natureza.',
  1,
  'exemplo',
  'Perfil declarado como Estudante em dedicação integral.',
  '{"o_que_exige":"Dedicação prioritária aos estudos sem contrato de trabalho CLT ou acúmulo de bolsas.","condicao_valor":"Sem registro ativo na CTPS e sem termo de concessão de bolsa governamental/institucional simultânea.","quem_cumpre":"O estudante candidato.","como_verificar":"Consultar aplicativo Carteira de Trabalho Digital (Gov.br) e histórico de vínculos no CNIS.","documentos_comprobatorios":"Cópia da CTPS digital sem contrato ativo ou declaração de não acúmulo de benefícios.","como_obter":"Emitir relatório em PDF no aplicativo Carteira de Trabalho Digital ou portal Meu INSS.","quem_emite":"Ministério do Trabalho e Emprego / Dataprev.","formatos_aceitos":"PDF gerado pelo aplicativo oficial do Governo Federal.","exigencias_validade":"Relatório emitido no mês corrente.","onde_entregar":"Portal do Candidato FUAE (aba Elegibilidade).","como_acessar_canal":"Portal oficial de inscrição.","etapa_apresentacao":"Inscrição Inicial","prazo_entrega":"2026-11-30","prazo_entrega_descricao":"Até 30/11/2026 às 23h59","como_verificar_envio":"Conferir arquivo anexado no sistema.","como_guardar_protocolo":"Guardar arquivo gerado com código de autenticação gov.br.","fonte_oficial":{"classificacao":"confirmado_edital","secao_edital":"Item 2.3 do Edital","pagina_origem":1,"trecho_evidencia":"2.3 Não possuir vínculo empregatício formal nem ser beneficiário de outra bolsa institucional de mesma natureza.","link_oficial":"https://exemplo.org.br/editais/fuae-bolsa-2026"},"observacao_pendencia":null}',
  'confirmado_edital',
  'Item 2.3',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
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
  'Necessário emitir ou digitalizar comprovante recente no nome do estudante ou responsáveis.',
  '{"o_que_exige":"Comprovação do endereço residencial na localidade atendida pelo programa.","condicao_valor":"Conta de consumo de serviço público emitida há no máximo 90 dias.","quem_cumpre":"O estudante ou responsável familiar titular da moradia.","como_verificar":"Checar se a data de emissão/vencimento da fatura está compreendida nos últimos 90 dias.","documentos_comprobatorios":"Conta de energia elétrica, água, gás encanado, telefone fixo ou contrato de aluguel.","como_obter":"Baixar segunda via digital no site da concessionária de energia ou digitalizar conta impressa.","quem_emite":"Concessionária de serviços públicos (Enel, Sabesp, Comgás, etc.).","formatos_aceitos":"PDF ou JPEG colorido e legível, até 5 MB.","exigencias_validade":"Máximo 90 dias de emissão; endereço legível e completo com CEP.","onde_entregar":"Portal do Candidato FUAE (aba Comprovação de Residência).","como_acessar_canal":"https://exemplo.org.br/editais/fuae-bolsa-2026/portal","etapa_apresentacao":"Inscrição Inicial","prazo_entrega":"2026-11-30","prazo_entrega_descricao":"Até 30/11/2026 às 23h59","como_verificar_envio":"Verificar pré-visualização do anexo após upload.","como_guardar_protocolo":"Salvar em pasta local e anotar número do protocolo.","fonte_oficial":{"classificacao":"confirmado_edital","secao_edital":"Item 3.3 do Edital","pagina_origem":1,"trecho_evidencia":"3.3 Comprovante de endereço recente (máximo 90 dias).","link_oficial":"https://exemplo.org.br/editais/fuae-bolsa-2026"},"observacao_pendencia":null}',
  'confirmado_edital',
  'Item 3.3',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  5,
  1,
  'Histórico escolar com aproveitamento de 75%',
  'Comprovação de frequência e aprovação mínima nos créditos cursados na graduação.',
  'documento',
  TRUE,
  'confirmar',
  '3.5 Histórico escolar da graduação demonstrando aproveitamento mínimo de 75% dos créditos cursados.',
  1,
  'exemplo',
  'Aguardando emissão do histórico atualizado pelo portal acadêmico.',
  '{"o_que_exige":"Desempenho acadêmico satisfatório nas disciplinas cursadas até o semestre anterior.","condicao_valor":"Percentual de aproveitamento global igual ou superior a 75% dos créditos matriculados.","quem_cumpre":"O estudante candidato.","como_verificar":"Calcular créditos aprovados divididos pelo total de créditos cursados no histórico escolar.","documentos_comprobatorios":"Histórico escolar oficial analítico com chave de validação pública.","como_obter":"Emitir pelo sistema acadêmico SIGA na opção Documentos Oficiais.","quem_emite":"Coordenação de Curso / Secretaria de Registro Acadêmico da Universidade.","formatos_aceitos":"PDF original emitido pelo sistema de gestão acadêmica.","exigencias_validade":"Chave de validação eletrônica ativa e legível.","onde_entregar":"Portal do Candidato FUAE (aba Documentação Acadêmica).","como_acessar_canal":"https://exemplo.org.br/editais/fuae-bolsa-2026/portal","etapa_apresentacao":"Inscrição Inicial","prazo_entrega":"2026-11-30","prazo_entrega_descricao":"Até 30/11/2026 às 23h59","como_verificar_envio":"Conferir se o arquivo PDF foi processado e salvo sem cortes.","como_guardar_protocolo":"Salvar o PDF original assinado eletronicamente.","fonte_oficial":{"classificacao":"confirmado_edital","secao_edital":"Item 3.5 do Edital","pagina_origem":1,"trecho_evidencia":"3.5 Histórico escolar da graduação demonstrando aproveitamento mínimo de 75% dos créditos cursados.","link_oficial":"https://exemplo.org.br/editais/fuae-bolsa-2026"},"observacao_pendencia":null}',
  'confirmado_edital',
  'Item 3.5',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  6,
  1,
  'Prazo de submissão da inscrição',
  'Submissão eletrônica no portal da FUAE impreterivelmente até o prazo limite.',
  'prazo',
  TRUE,
  'confirmar',
  '4.1 Período de inscrições: de 01/11/2026 até 30/11/2026 às 23h59 via portal do candidato.',
  2,
  'exemplo',
  'Prazo com margem de segurança recomendada para submissão até 27/11/2026.',
  '{"o_que_exige":"Transmissão de todos os dados e anexos antes do encerramento oficial do cronograma.","condicao_valor":"Submissão final confirmada até 30/11/2026 às 23h59 (horário de Brasília).","quem_cumpre":"O candidato.","como_verificar":"Consultar o relógio oficial do portal de inscrições da FUAE.","documentos_comprobatorios":"Recibo final de inscrição emitido pelo sistema com número de protocolo.","como_obter":"Completar todas as abas e clicar no botão Concluir e Transmitir Inscrição.","quem_emite":"Sistema Oficial de Inscrições FUAE.","formatos_aceitos":"Comprovante digital emitido na tela e enviado para o e-mail cadastrado.","exigencias_validade":"Transmitido antes do prazo limite impreterível.","onde_entregar":"Portal do Candidato FUAE.","como_acessar_canal":"https://exemplo.org.br/editais/fuae-bolsa-2026/portal","etapa_apresentacao":"Inscrição Inicial","prazo_entrega":"2026-11-30","prazo_entrega_descricao":"30/11/2026 às 23h59","como_verificar_envio":"Tela de confirmação com código alfanumérico e recebimento de e-mail institucional.","como_guardar_protocolo":"Salvar em PDF e tirar captura de tela da página de sucesso.","fonte_oficial":{"classificacao":"confirmado_edital","secao_edital":"Item 4.1 do Edital","pagina_origem":2,"trecho_evidencia":"4.1 Período de inscrições: de 01/11/2026 até 30/11/2026 às 23h59 via portal do candidato.","link_oficial":"https://exemplo.org.br/editais/fuae-bolsa-2026"},"observacao_pendencia":null}',
  'confirmado_edital',
  'Item 4.1',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
);

-- -----------------------------------------------------------------------------
-- 5. SEED: documentos_exigidos (Tratamento Individual de Cada Documento)
-- -----------------------------------------------------------------------------
INSERT INTO documentos_exigidos (
  id,
  analise_id,
  requisito_id,
  nome,
  finalidade,
  quem_fornece,
  orgao_emissor,
  como_obter,
  documentos_alternativos,
  formato_aceito,
  exigencias_validade,
  local_entrega,
  url_entrega,
  secao_entrega,
  etapa_processo,
  prazo_envio,
  prazo_envio_descricao,
  como_confirmar_envio,
  instrucoes_protocolo,
  status_etapa,
  checklist_etapas,
  protocolo_comprovante,
  classificacao_fonte,
  secao_edital,
  pagina_origem,
  trecho_evidencia,
  link_fonte_oficial,
  data_verificacao_externa,
  observacao_pendencia
) VALUES
(
  1,
  1,
  NULL,
  'Documento Oficial de Identificação com Foto (RG ou CNH)',
  'Comprovar a identificação civil e a titularidade do candidato perante a instituição concedente.',
  'O próprio estudante candidato.',
  'Secretaria de Segurança Pública (RG) ou DETRAN / Senatran (CNH).',
  'Portar documento físico original ou emitir certidão/cópia digital via aplicativo oficial Gov.br ou Carteira Digital de Trânsito com código QR de autenticidade.',
  'Aceita-se CNH válida, RG com foto recente, Carteira de Trabalho Digital ou Passaporte brasileiro. Não são aceitas certidões de nascimento ou carteirinhas estudantis.',
  'Arquivo PDF legível frente e verso ou JPEG colorido nítido, tamanho máximo de 5 MB.',
  'Documento em bom estado de conservação, sem rasuras, com fotografia nítida e identificável. CNH deve estar dentro da validade.',
  'Portal do Candidato FUAE',
  'https://exemplo.org.br/editais/fuae-bolsa-2026/portal',
  'Aba "Identificação do Candidato" > Campo "Upload de Documento de Identidade"',
  'Inscrição Inicial',
  '2026-11-30',
  'Até 30/11/2026 às 23h59',
  'O sistema exibirá a miniatura do arquivo carregado com o status "Anexo Carregado com Sucesso".',
  'Anotar o número do protocolo exibido na tela ao finalizar o preenchimento e salvar o PDF gerado.',
  'obtido',
  '{"entender_necessidade":true,"obter_documento":true,"conferir_validade_formato":true,"enviar_canal_correto":false,"registrar_protocolo":false,"observacoes_usuario":"Documento CNH digital exportado pelo aplicativo oficial com QR Code."}',
  NULL,
  'confirmado_edital',
  'Item 3.1 do Edital',
  1,
  '3.1 Cópia do documento de identidade oficial com foto (RG ou CNH).',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  2,
  1,
  1,
  'Comprovante de Matrícula Atualizado (Semestre 2026/1)',
  'Comprovar o vínculo acadêmico regular em curso presencial de graduação de instituição conveniada.',
  'Estudante candidato.',
  'Secretaria Acadêmica / Sistema de Gestão Acadêmica da Universidade (ex: SIGA).',
  'Acessar o portal acadêmico da instituição conveniada (login do aluno), selecionar o menu "Documentos e Atestados", emitir "Atestado de Matrícula" do semestre 2026/1 e baixar o arquivo em PDF com código de verificação.',
  'Declaração oficial recente assinada digitalmente pela coordenação do curso ou secretaria acadêmica caso o portal esteja temporariamente indisponível.',
  'Arquivo PDF gerado diretamente pelo portal acadêmico com chave de autenticidade eletrônica.',
  'Deve conter expressamente o período letivo 2026/1, indicação de curso presencial e chave pública de verificação digital.',
  'Portal do Candidato FUAE',
  'https://exemplo.org.br/editais/fuae-bolsa-2026/portal',
  'Aba "Vínculo Universitário" > Campo "Comprovante de Matrícula"',
  'Inscrição Inicial',
  '2026-11-30',
  'Até 30/11/2026 às 23h59',
  'Conferir se o arquivo aparece listado com status "Transmitido" e tamanho de arquivo correspondente.',
  'Guardar a via eletrônica com o código de validação institucional.',
  'conferido',
  '{"entender_necessidade":true,"obter_documento":true,"conferir_validade_formato":true,"enviar_canal_correto":false,"registrar_protocolo":false,"observacoes_usuario":"Emitido pelo SIGA com autenticação eletrônica ativa."}',
  NULL,
  'confirmado_edital',
  'Item 3.2 do Edital',
  1,
  '3.2 Comprovante de matrícula atualizado no semestre 2026/1.',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  3,
  1,
  4,
  'Comprovante de Endereço Residencial Recente (máx. 90 dias)',
  'Comprovar domicílio no município sede ou região metropolitana atendida pelo programa.',
  'Estudante candidato ou responsáveis com quem coabita.',
  'Concessionárias de serviços públicos essenciais (energia elétrica, saneamento/água ou gás encanado).',
  'Baixar a segunda via da fatura diretamente no aplicativo ou agência virtual da concessionária (ex: Enel, Sabesp, Comgás) ou digitalizar conta impressa recebida via correio.',
  'Conta de luz, água, gás canalizado, telefone fixo, boleto de taxa condominial ou contrato de locação com recibo recente. Em caso de imóvel cedido, declaração de residência assinada pelo proprietário acompanhada de cópia do documento dele.',
  'Arquivo PDF legível ou fotografia digital nítida sem cortes nas informações de endereço e data.',
  'Data de emissão ou vencimento nos últimos 90 dias anteriores ao encerramento do prazo de inscrições.',
  'Portal do Candidato FUAE',
  'https://exemplo.org.br/editais/fuae-bolsa-2026/portal',
  'Aba "Dados de Residência" > Campo "Anexar Comprovante de Endereço"',
  'Inscrição Inicial',
  '2026-11-30',
  'Até 30/11/2026 às 23h59',
  'Visualizar o documento na ferramenta de pré-visualização do portal para garantir que o CEP e o número são legíveis.',
  'Guardar cópia digitalizada e nomeada em pasta organizada.',
  'obtido',
  '{"entender_necessidade":true,"obter_documento":true,"conferir_validade_formato":true,"enviar_canal_correto":false,"registrar_protocolo":false,"observacoes_usuario":"Conta de energia recente obtida via portal da concessionária."}',
  NULL,
  'confirmado_edital',
  'Item 3.3 do Edital',
  1,
  '3.3 Comprovante de endereço recente (máximo 90 dias).',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  4,
  1,
  2,
  'Comprovantes de Rendimentos de Todos os Membros do Grupo Familiar',
  'Comprovar o cumprimento do teto de renda familiar bruta per capita de até 1,5 salário mínimo.',
  'Todos os integrantes economicamente ativos que compõem o grupo familiar do estudante.',
  'Empregadores (holerite), INSS (extrato previdenciário), Receita Federal (declaração de IRPF) ou declaração de trabalho autônomo.',
  'Coletar os 3 últimos contracheques/holerites dos trabalhadores CLT; emitir extrato de benefício no app Meu INSS para aposentados/pensionistas; preencher declaração com rendimento médio para trabalhadores autônomos.',
  'Folha Resumo atualizada do CadÚnico (Cadastro Único do Governo Federal) com renda familiar validada nos últimos 12 meses, quando expressamente admitida em instrução normativa.',
  'Arquivos em formato PDF, legíveis e completos, frente e verso.',
  'Holerites relativos aos 3 meses imediatamente anteriores à abertura da inscrição; extratos de benefícios referentes ao mês corrente; declarações assinadas física ou eletronicamente via Gov.br.',
  'Portal do Candidato FUAE',
  'https://exemplo.org.br/editais/fuae-bolsa-2026/portal',
  'Aba "Composição Familiar e Renda" > Campo "Documentos Comprobatórios de Renda"',
  'Inscrição Inicial',
  '2026-11-30',
  'Até 30/11/2026 às 23h59',
  'Verificar se foi inserido ao menos um comprovante ou declaração para cada membro familiar listado no formulário.',
  'Manter todos os contracheques e declarações originais arquivados até a homologação final do resultado.',
  'pendente_obtencao',
  '{"entender_necessidade":true,"obter_documento":false,"conferir_validade_formato":false,"enviar_canal_correto":false,"registrar_protocolo":false,"observacoes_usuario":"Aguardando o holerite de outubro dos membros familiares."}',
  NULL,
  'confirmado_edital',
  'Item 3.4 do Edital',
  1,
  '3.4 Comprovantes de renda de todos os membros do grupo familiar ou declaração de trabalho autônomo.',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
),
(
  5,
  1,
  5,
  'Histórico Escolar da Graduação com Coeficiente de Aproveitamento',
  'Atestar o aproveitamento acadêmico igual ou superior a 75% dos créditos cursados.',
  'Estudante candidato.',
  'Universidade conveniada / Pró-Reitoria de Graduação / SIGA.',
  'Acessar o SIGA com as credenciais universitárias, acessar o menu "Histórico Acadêmico Analítico", clicar em emitir histórico completo e fazer o download do PDF assinado digitalmente.',
  'Para ingressantes (estudantes no 1º semestre da graduação), verificar se o edital prevê substituição pelo histórico do Ensino Médio com declaração de calouro.',
  'Documento oficial em PDF emitido pelo sistema de registros acadêmicos com link ou QR Code público de autenticação.',
  'O documento deve exibir todas as disciplinas cursadas, status de aprovação/reprovação e o percentual de aproveitamento global acumulado.',
  'Portal do Candidato FUAE',
  'https://exemplo.org.br/editais/fuae-bolsa-2026/portal',
  'Aba "Desempenho Acadêmico" > Campo "Histórico Escolar Oficial"',
  'Inscrição Inicial',
  '2026-11-30',
  'Até 30/11/2026 às 23h59',
  'Checar se o documento foi anexado e se o sistema identificou o número de folhas do documento.',
  'Salvar cópia do histórico emitido juntamente com a chave alfanumérica de validação.',
  'obtido',
  '{"entender_necessidade":true,"obter_documento":true,"conferir_validade_formato":true,"enviar_canal_correto":false,"registrar_protocolo":false,"observacoes_usuario":"Histórico analítico obtido demonstrando aproveitamento de 82% dos créditos."}',
  NULL,
  'confirmado_edital',
  'Item 3.5 do Edital',
  1,
  '3.5 Histórico escolar da graduação demonstrando aproveitamento mínimo de 75% dos créditos cursados.',
  'https://exemplo.org.br/editais/fuae-bolsa-2026',
  NULL,
  NULL
);

-- -----------------------------------------------------------------------------
-- 6. SEED: tarefas (Plano de Ação / Checklist)
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
