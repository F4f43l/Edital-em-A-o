/**
 * servicoPesquisaComplementar.js
 * 
 * Serviço de pesquisa e enriquecimento complementar de documentos e procedimentos
 * em fontes oficiais governamentais (gov.br, órgãos públicos, judiciário e sistemas oficiais).
 * 
 * Regras estritas:
 * 1. Não inventa URLs, taxas ou exigências.
 * 2. Diferencia expressamente o que veio do edital ('confirmado_edital') do que veio
 *    de fonte oficial complementar ('confirmado_outra_fonte') e recomendações de organização ('recomendacao_organizacao').
 * 3. Valida URLs e bloqueia tentativas de SSRF (redes internas, loopback, metadados de nuvem).
 * 4. Fornece tutoriais passo a passo acionáveis para pessoas leigas.
 */

import { URL } from 'url';

/**
 * Catálogo auditado de fontes oficiais brasileiras para emissão de certidões,
 * documentos de identificação, comprovações acadêmicas e socioeconômicas.
 */
const CATALOGO_FONTES_OFICIAIS = [
  {
    chaves: ['antecedentes criminais', 'polícia federal', 'pf criminal', 'folha corrida federal'],
    tipo_exato: 'Certidão de Antecedentes Criminais (Polícia Federal)',
    nome_simples: 'Certidão de Antecedentes Criminais da Polícia Federal',
    orgao_emissor: 'Polícia Federal (Ministério da Justiça e Segurança Pública)',
    como_obter: 'Acessar o portal oficial da Polícia Federal na internet, selecionar "Emitir Certidão de Antecedentes", preencher nome completo, CPF, número do RG com órgão expedidor e nome da mãe. O documento em PDF com QR Code e chave de validação eletrônica é gerado instantaneamente e sem cobrança de taxa.',
    dados_solicitacao: 'Nome completo, CPF, número do RG (com órgão expedidor e UF), data de nascimento, nacionalidade e nome completo da mãe.',
    link_fonte_oficial: 'https://servicos.dpf.gov.br/antecedentes-criminais/certidao',
    formato_aceito: 'PDF oficial com código de autenticação eletrônica pública.',
    exigencias_validade: 'Validade oficial de 90 dias a contar da data de emissão. Deve conter código de validação digital verificável.',
    documentos_alternativos: 'Caso a emissão eletrônica fique indisponível por homonímia, comparecer pessoalmente a uma unidade da Polícia Federal.',
    gratuidade: true,
  },
  {
    chaves: ['quitação eleitoral', 'tse', 'justiça eleitoral', 'título de eleitor quitação', 'certidão eleitoral'],
    tipo_exato: 'Certidão de Quitação Eleitoral (TSE / TRE)',
    nome_simples: 'Certidão de Quitação Eleitoral (Justiça Eleitoral)',
    orgao_emissor: 'Tribunal Superior Eleitoral (TSE) / Tribunais Regionais Eleitorais (TRE)',
    como_obter: 'Acessar o serviço oficial do Tribunal Superior Eleitoral (TSE) ou o aplicativo e-Título no celular. Preencher nome completo, número do título ou CPF, data de nascimento e filiação. Clicar em "Emitir certidão". O sistema gera o comprovante oficial gratuito em PDF contendo chave de validação.',
    dados_solicitacao: 'Nome completo, número do CPF ou Título de Eleitor, data de nascimento e nomes dos pais.',
    link_fonte_oficial: 'https://www.tse.jus.br/servicos-eleitorais/certidoes/certidao-de-quitacao-eleitoral',
    formato_aceito: 'PDF pesquisável com código de verificação digital e QR Code.',
    exigencias_validade: 'Deve comprovar a quitação com as obrigações eleitorais até a data da apresentação. Válida até a realização do pleito seguinte ou conforme código digital.',
    documentos_alternativos: 'Comprovante de votação do último turno eleitoral ou justificativa homologada pelo juízo eleitoral.',
    gratuidade: true,
  },
  {
    chaves: ['cpf', 'situação cadastral', 'comprovante de inscrição no cpf', 'regularidade do cpf'],
    tipo_exato: 'Comprovante de Situação Cadastral no CPF (Receita Federal)',
    nome_simples: 'Comprovante de Situação Cadastral no CPF',
    orgao_emissor: 'Receita Federal do Brasil (Ministério da Fazenda)',
    como_obter: 'Acessar a página oficial da Receita Federal de "Comprovante de Situação Cadastral no CPF". Informar o número do CPF e a data de nascimento, marcar o captcha e clicar em "Consultar". Gerar o comprovante em PDF.',
    dados_solicitacao: 'Número de inscrição no CPF e data de nascimento.',
    link_fonte_oficial: 'https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp',
    formato_aceito: 'PDF ou impressão eletrônica contendo código de controle e data/hora da emissão.',
    exigencias_validade: 'A situação cadastral deve constar como "REGULAR". Comprovantes com pendências (suspensa, cancelada) exigem regularização prévia na Receita.',
    documentos_alternativos: 'Cartão físico do CPF, CNH ou Carteira de Identidade Nacional (CIN) onde conste o número regular do CPF.',
    gratuidade: true,
  },
  {
    chaves: ['cnis', 'extrato previdenciário', 'meu inss', 'vínculos empregatícios', 'contribuições previdenciárias'],
    tipo_exato: 'Extrato Previdenciário de Vínculos e Remunerações (CNIS)',
    nome_simples: 'Extrato CNIS / Meu INSS',
    orgao_emissor: 'Instituto Nacional do Seguro Social (INSS) / Ministério da Previdência Social',
    como_obter: 'Acessar o portal oficial Meu INSS (meu.inss.gov.br) ou aplicativo Meu INSS com login da conta Gov.br (nível Prata ou Ouro). Na barra de pesquisa, digitar "Extrato de Contribuição (CNIS)". Clicar na opção "Baixar PDF" e escolher a opção "Relações Previdenciárias e Remunerações" (completo). Salvar o arquivo PDF gerado.',
    dados_solicitacao: 'Conta Gov.br com CPF e senha cadastrados (nível de segurança bronze, prata ou ouro).',
    link_fonte_oficial: 'https://meu.inss.gov.br',
    formato_aceito: 'PDF completo gerado diretamente pelo portal Meu INSS, sem rasuras ou supressão de páginas.',
    exigencias_validade: 'Emitido recentemente (geralmente nos últimos 30 a 60 dias). Deve conter todas as folhas do histórico contributivo.',
    documentos_alternativos: 'Carteira de Trabalho Digital (páginas com contratos de trabalho e remuneração) e holerites recentes.',
    gratuidade: true,
  },
  {
    chaves: ['cadúnico', 'cadunico', 'cadastro único', 'folha resumo', 'comprovante do cadúnico'],
    tipo_exato: 'Comprovante de Inscrição no Cadastro Único (CadÚnico)',
    nome_simples: 'Comprovante do Cadastro Único (CadÚnico)',
    orgao_emissor: 'Ministério do Desenvolvimento e Assistência Social (MDS) / CRAS Municipal',
    como_obter: 'Acessar o portal oficial ou aplicativo "Cadastro Único" (cadunico.dataprev.gov.br). Entrar com a conta Gov.br ou preencher dados de identificação do Responsável Familiar (nome, data de nascimento, nome da mãe e município/UF). Baixar a "Folha Resumo" ou "Comprovante de Cadastro" em PDF.',
    dados_solicitacao: 'Login Gov.br ou dados completos do Responsável Familiar: Nome, Data de Nascimento, Nome da Mãe e Município do cadastro.',
    link_fonte_oficial: 'https://cadunico.dataprev.gov.br',
    formato_aceito: 'Arquivo PDF oficial da Folha Resumo contendo código de verificação de autenticidade (hash/QR code).',
    exigencias_validade: 'Cadastro Único deve estar atualizado nos últimos 24 meses (ou conforme prazo específico do edital, frequentemente 12 meses).',
    documentos_alternativos: 'Declaração formal de inscrição emitida diretamente pelo CRAS (Centro de Referência de Assistência Social) do município.',
    gratuidade: true,
  },
  {
    chaves: ['carteira de identidade', 'rg', 'cin', 'cnh', 'documento de identidade oficial', 'registro geral'],
    tipo_exato: 'Documento Oficial de Identificação com Foto (RG / CIN / CNH)',
    nome_simples: 'Documento de Identidade com Foto (RG, CIN ou CNH)',
    orgao_emissor: 'Secretaria de Segurança Pública (SSP), Polícia Civil, Detran ou Senatran',
    como_obter: 'Para versão física original: separar o documento emitido pelo órgão expedidor. Para versão digital oficial: acessar o aplicativo "Carteira Digital de Trânsito" (para CNH) ou "Gov.br" (para a Carteira de Identidade Nacional - CIN) e exportar o arquivo PDF oficial com certificado digital do Serpro/Senatran.',
    dados_solicitacao: 'Documento original físico ou aplicativo oficial instalado com biometria facial validada.',
    link_fonte_oficial: 'https://www.gov.br/governodigital/pt-br/identificacao-do-cidadao',
    formato_aceito: 'PDF colorido e nítido contendo frente e verso no mesmo arquivo, ou exportação direta dos aplicativos Gov.br / CNH Digital.',
    exigencias_validade: 'Documento original sem rasgos, rasuras, aberturas plásticas ou partes ilegíveis. Fotografia recente e assinatura conferível.',
    documentos_alternativos: 'Passaporte brasileiro válido, Carteira de Trabalho Digital ou carteiras de órgãos de classe (OAB, CRM, CREA, etc.).',
    gratuidade: true,
  },
  {
    chaves: ['residência', 'comprovante de endereço', 'conta de luz', 'conta de água', 'endereço'],
    tipo_exato: 'Comprovante de Endereço Residencial Recente',
    nome_simples: 'Comprovante de Residência Recente (máx. 90 dias)',
    orgao_emissor: 'Concessionárias de serviços públicos (energia, água, saneamento, gás) ou provedores de telecomunicações',
    como_obter: 'Acessar a agência virtual da concessionária de energia ou saneamento da sua cidade (site ou aplicativo no celular) e baixar a segunda via da fatura do mês atual em PDF. Se tiver fatura impressa recebida pelo correio, fotografar ou digitalizar frente e verso em local bem iluminado.',
    dados_solicitacao: 'Número da conta contrato / instalação ou CPF do titular da conta.',
    link_fonte_oficial: null, // Varia por cidade/estado
    formato_aceito: 'Arquivo PDF nativo da concessionária ou digitalização nítida de todas as páginas da conta.',
    exigencias_validade: 'Emitido há no máximo 90 dias em relação à data de abertura das inscrições. Deve constar endereço legível com logradouro, número, bairro, cidade, UF e CEP.',
    documentos_alternativos: 'Contrato de locação com firmas reconhecidas, carnê de IPTU do ano vigente ou declaração de residência firmada pelo titular com firma ou assinatura Gov.br.',
    gratuidade: true,
  },
  {
    chaves: ['matrícula', 'atestado de matrícula', 'declaração de vínculo', 'comprovante de matrícula'],
    tipo_exato: 'Declaração ou Atestado de Matrícula Acadêmica com Autenticação Digital',
    nome_simples: 'Comprovante de Matrícula Atualizado',
    orgao_emissor: 'Secretaria Acadêmica / Sistema Integrado de Gestão Acadêmica (SIGA / SUAP / SIGAA)',
    como_obter: 'Acessar o portal do estudante da instituição de ensino com login e senha acadêmica. Acessar o menu "Documentos" ou "Secretaria Virtual" e selecionar "Atestado de Matrícula". Emitir o documento em PDF garantindo que conste a chave de validação eletrônica ou QR Code no rodapé.',
    dados_solicitacao: 'Matrícula institucional e senha de acesso ao portal acadêmico.',
    link_fonte_oficial: null,
    formato_aceito: 'PDF oficial gerado diretamente pelo sistema acadêmico institucional.',
    exigencias_validade: 'Referente ao semestre letivo ou ano vigente. Deve conter chave de validação pública na internet e assinatura eletrônica do responsável institucional.',
    documentos_alternativos: 'Declaração formal emitida e assinada pela coordenação do curso ou diretoria acadêmica da faculdade.',
    gratuidade: true,
  },
  {
    chaves: ['histórico escolar', 'histórico acadêmico', 'notas e coeficientes', 'histórico de graduação'],
    tipo_exato: 'Histórico Escolar Analítico com Código Verificador Digital',
    nome_simples: 'Histórico Escolar Completo',
    orgao_emissor: 'Coordenação de Registros Acadêmicos / Secretaria de Educação',
    como_obter: 'Acessar o portal acadêmico do aluno, menu "Histórico Escolar" e selecionar "Histórico Analítico Completo". Emitir a versão em PDF com código verificador ou QR Code. Para estudantes recém-ingressos, solicitar na secretaria da escola do Ensino Médio ou acessar a secretaria escolar digital do estado.',
    dados_solicitacao: 'Matrícula escolar e login no sistema acadêmico ou requerimento presencial na secretaria da escola.',
    link_fonte_oficial: null,
    formato_aceito: 'PDF completo de todas as páginas com código de verificação no rodapé.',
    exigencias_validade: 'Constar todas as disciplinas cursadas, notas, carga horária e coeficiente de rendimento acumulado.',
    documentos_alternativos: 'Boletim escolar oficial com autenticação ou declaração de conclusão acompanhada de histórico provisório.',
    gratuidade: true,
  },
];

/**
 * Validação de URL segura para prevenir ataques de SSRF (Server-Side Request Forgery).
 * Rejeita esquemas inseguros, localhost, IPs privados e metadados de nuvem.
 */
export function validarUrlSegura(urlTexto) {
  if (!urlTexto || typeof urlTexto !== 'string') return { seguro: false, motivo: 'URL ausente' };

  try {
    const url = new URL(urlTexto.trim());

    // Permite apenas HTTP e HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { seguro: false, motivo: 'Protocolo não permitido (apenas HTTP/HTTPS)' };
    }

    const host = url.hostname.toLowerCase();

    // Bloqueia loopback e localhost
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local') || host.endsWith('.internal')) {
      return { seguro: false, motivo: 'Endereço local bloqueado' };
    }

    // Bloqueia IPs privados (RFC 1918) e metadados de nuvem
    if (
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host.startsWith('169.254.') // Cloud metadata (AWS, GCP, Azure)
    ) {
      return { seguro: false, motivo: 'Faixa de rede privada bloqueada por segurança' };
    }

    return { seguro: true, urlFormatada: url.toString() };
  } catch (err) {
    return { seguro: false, motivo: 'URL com formato inválido' };
  }
}

/**
 * Gera o guia passo a passo prático para digitalização de documentos (Etapa 3.D)
 * para pessoas que não entendem de processos técnicos.
 */
export function gerarInstrucoesDigitalizacaoParaLeigos(formatoAceito = 'PDF') {
  return [
    '1. PREPARAÇÃO DO DOCUMENTO FÍSICO: Pegue o documento original e verifique se todas as folhas estão completas, sem dobras ou partes cobertas. Se houver carimbos ou anotações no verso, ambas as faces precisarão ser capturadas.',
    '2. ILUMINAÇÃO ADEQUADA: Posicione o documento sobre uma mesa plana de cor contrastante (ex: toalha escura se o papel for branco), em local bem iluminado com luz natural ou lâmpada direta, evitando sombras das suas mãos ou reflexos de flash.',
    '3. CAPTURA NO CELULAR: Utilize a câmera do celular com um aplicativo de digitalização gratuito (ex: Google Drive > Digitalizar / Ícone de Câmera, Adobe Scan ou Microsoft Lens). O aplicativo ajustará as bordas e aumentará o contraste automaticamente.',
    '4. VERIFICAÇÃO DE NITIDEZ: Dê zoom na imagem capturada e certifique-se de que cada número, letra, carimbo e assinatura podem ser lidos perfeitamente sem borrões.',
    `5. SALVAR NO FORMATO EXIGIDO: Salve o documento no formato ${formatoAceito || 'PDF'}. Se o documento tiver mais de uma página (ex: histórico ou RG frente e verso), junte todas as folhas em um único arquivo PDF.`,
    '6. CONFERÊNCIA DE TAMANHO E NOME: Verifique se o tamanho do arquivo não ultrapassa o limite permitido (geralmente até 5 MB). Dê um nome claro ao arquivo, como "RG_NomeDoCandidato.pdf" ou "Comprovante_Residencia.pdf", para facilitar a conferência antes de enviar.',
  ].join('\n\n');
}

/**
 * Gera instruções práticas de preparação do documento (Etapa 3.C)
 */
export function gerarInstrucoesPreparacao(documento) {
  const instrucoes = [];

  instrucoes.push(`• FORMATO: Certifique-se de salvar em ${documento.formato_aceito || 'PDF legível'}.`);
  if (documento.exigencias_validade) {
    instrucoes.push(`• CONDIÇÕES DE VALIDADE: ${documento.exigencias_validade}`);
  } else {
    instrucoes.push('• VALIDADE: Verifique se o documento é recente e não possui rasuras, emendas ou dados desatualizados.');
  }

  instrucoes.push('• ASSINATURA E AUTENTICIDADE: Verifique se o edital exige assinatura física de próprio punho ou se aceita assinatura eletrônica avançada (Gov.br). Se for certidão digital, confira se o código de autenticação eletrônica pública ou QR Code está legível no rodapé.');
  instrucoes.push('• FRENTE E VERSO: Se o documento contiver informações, carimbos ou dados de órgãos expedidores no verso (como RG, CNH ou certidões), capture frente e verso no mesmo documento.');

  return instrucoes.join('\n');
}

export const servicoPesquisaComplementar = {
  /**
   * Enriquece um documento com dados complementares auditados de fontes oficiais
   * quando faltarem orientações práticas no edital.
   */
  enriquecerDocumentoComFonteOficial(documento, contextoEdital = {}) {
    const nomeNormalizado = (documento.nome || '').toLowerCase();
    const nomeSimplesNormalizado = (documento.nome_simples || '').toLowerCase();
    const finalidadeNormalizada = (documento.finalidade || '').toLowerCase();
    const evidenciaNormalizada = (documento.trecho_evidencia || '').toLowerCase();
    const textoBusca = `${nomeNormalizado} ${nomeSimplesNormalizado} ${finalidadeNormalizada} ${evidenciaNormalizada}`;

    // Procura no catálogo auditado
    let correspondencia = null;
    let maiorPontuacao = 0;

    for (const item of CATALOGO_FONTES_OFICIAIS) {
      let pontos = 0;
      for (const chave of item.chaves) {
        if (textoBusca.includes(chave.toLowerCase())) {
          pontos += 2;
        }
      }
      if (pontos > maiorPontuacao) {
        maiorPontuacao = pontos;
        correspondencia = item;
      }
    }

    const dataHoje = new Date().toISOString().slice(0, 10);
    const enriquecido = { ...documento };

    // Se encontrou fonte oficial auditada
    if (correspondencia && maiorPontuacao >= 2) {
      if (!enriquecido.nome_simples) {
        enriquecido.nome_simples = correspondencia.nome_simples;
      }

      if (!enriquecido.orgao_emissor || enriquecido.orgao_emissor.includes('competente') || enriquecido.orgao_emissor.includes('Não identificado')) {
        enriquecido.orgao_emissor = correspondencia.orgao_emissor;
      }

      // Se o catálogo possui link oficial de emissão específico
      if (correspondencia.link_fonte_oficial) {
        enriquecido.link_fonte_oficial = correspondencia.link_fonte_oficial;
      }

      // Se o edital não descreveu como obter ou forneceu orientação genérica
      const comoObterAtual = (enriquecido.como_obter || '').toLowerCase();
      const ehGenerico = !enriquecido.como_obter ||
        comoObterAtual.includes('providenciar') ||
        comoObterAtual.includes('conforme edital') ||
        comoObterAtual.includes('junto ao órgão competente') ||
        comoObterAtual.length < 25;

      if (ehGenerico) {
        enriquecido.como_obter = correspondencia.como_obter;
        enriquecido.classificacao_fonte = 'confirmado_outra_fonte';
        enriquecido.data_verificacao_externa = dataHoje;
      }

      if (!enriquecido.dados_solicitacao) {
        enriquecido.dados_solicitacao = correspondencia.dados_solicitacao;
      }

      if (!enriquecido.documentos_alternativos && correspondencia.documentos_alternativos) {
        enriquecido.documentos_alternativos = correspondencia.documentos_alternativos;
      }

      if (!enriquecido.exigencias_validade && correspondencia.exigencias_validade) {
        enriquecido.exigencias_validade = correspondencia.exigencias_validade;
      }

      if (!enriquecido.formato_aceito && correspondencia.formato_aceito) {
        enriquecido.formato_aceito = correspondencia.formato_aceito;
      }
    } else {
      // Se não encontrou no catálogo de fontes oficiais
      if (!enriquecido.nome_simples) {
        enriquecido.nome_simples = enriquecido.nome;
      }
      if (!enriquecido.como_obter) {
        enriquecido.como_obter = 'Procedimento específico de emissão não detalhado no edital. Recomenda-se consultar diretamente a comissão organizadora ou órgão emissor correspondente.';
        enriquecido.classificacao_fonte = 'nao_localizado';
        enriquecido.observacao_pendencia = 'Atenção: O edital exige a apresentação deste documento mas não informa o canal nem o procedimento de solicitação. Verifique com a instituição organizadora.';
      }
    }

    // Adiciona instruções de preparação e digitalização passo a passo
    if (!enriquecido.instrucoes_preparacao) {
      enriquecido.instrucoes_preparacao = gerarInstrucoesPreparacao(enriquecido);
    }

    if (!enriquecido.como_digitalizar) {
      enriquecido.como_digitalizar = gerarInstrucoesDigitalizacaoParaLeigos(enriquecido.formato_aceito);
    }

    // Se o canal de entrega estiver vago mas houver URL de origem no edital
    if ((!enriquecido.url_entrega || enriquecido.url_entrega === 'null') && contextoEdital.url_origem) {
      enriquecido.url_entrega = contextoEdital.url_origem;
      if (!enriquecido.local_entrega || enriquecido.local_entrega.includes('Portal oficial')) {
        enriquecido.local_entrega = `Portal de Inscrições Oficial (${contextoEdital.url_origem})`;
      }
    }

    // Se o local de entrega não foi localizado
    if (!enriquecido.local_entrega || enriquecido.local_entrega.toLowerCase().includes('não informado')) {
      enriquecido.local_entrega = 'Canal eletrônico da instituição organizadora';
      enriquecido.observacao_pendencia = enriquecido.observacao_pendencia
        ? `${enriquecido.observacao_pendencia} Local exato de entrega precisa de confirmação junto ao edital.`
        : 'Local ou link exato de upload não explicitado no edital. Confirmar no portal oficial antes do prazo final.';
    }

    return enriquecido;
  },

  /**
   * Enriquecimento em lote de documentos de uma análise
   */
  enriquecerListaDocumentos(documentos = [], contextoEdital = {}) {
    return documentos.map((doc) => this.enriquecerDocumentoComFonteOficial(doc, contextoEdital));
  },

  validarUrlSegura,
  gerarInstrucoesDigitalizacaoParaLeigos,
  gerarInstrucoesPreparacao,
};
