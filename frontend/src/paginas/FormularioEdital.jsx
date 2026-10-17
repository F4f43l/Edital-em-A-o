import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  ArrowLeft,
  Save,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Calendar,
  Layers,
  Edit,
  Trash2,
  PlusCircle,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { api } from '../servicos/api.js';
import { Cartao } from '../componentes/Cartao.jsx';
import { Botao } from '../componentes/Botao.jsx';
import { CampoTexto } from '../componentes/CampoTexto.jsx';
import { CampoSelecao } from '../componentes/CampoSelecao.jsx';
import { CrachaStatus } from '../componentes/CrachaStatus.jsx';
import { EstadoCarregamento } from '../componentes/EstadoCarregamento.jsx';
import { MensagemErro } from '../componentes/MensagemErro.jsx';
import { PainelCustosLogistica } from '../componentes/PainelCustosLogistica.jsx';

export function FormularioEdital() {
  const { id } = useParams();
  const navegar = useNavigate();
  const modoEdicao = Boolean(id);

  // Perfis disponíveis para vinculação
  const [perfis, setPerfis] = useState([]);
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState('');
  const [saude, setSaude] = useState(null);

  // Estados do Fluxo de Upload & IA
  const [etapaFluxo, setEtapaFluxo] = useState('upload'); // 'upload' | 'revisao'
  const [arquivoPdf, setArquivoPdf] = useState(null);
  const [processandoPdf, setProcessandoPdf] = useState(false);
  const [mensagemProcessamento, setMensagemProcessamento] = useState('');

  // Dados Extraídos / Em Revisão
  const [dadosRevisao, setDadosRevisao] = useState(null);

  // Estado do formulário manual / edição
  const [formularioManualAtivo, setFormularioManualAtivo] = useState(modoEdicao);
  const [formulario, setFormulario] = useState({
    titulo: '',
    instituicao: '',
    categoria: 'Bolsa de Estudos',
    resumo: '',
    url_origem: '',
    prazo_inscricao: '',
    prazo_recurso: '',
    data_resultado: '',
    status: 'ativo',
    texto_extraido: '',
  });

  const [nomeArquivoExistente, setNomeArquivoExistente] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [errosCampos, setErrosCampos] = useState({});

  useEffect(() => {
    // Carrega perfis e saúde da API
    Promise.all([api.listarPerfis(), api.verificarSaude().catch(() => null)]).then(([listaPerfis, dadosSaude]) => {
      setPerfis(listaPerfis);
      setSaude(dadosSaude);
      if (listaPerfis.length > 0 && !perfilSelecionadoId) {
        setPerfilSelecionadoId(String(listaPerfis[0].id));
      }
    });

    if (modoEdicao) {
      setCarregandoDados(true);
      api
        .buscarEditalPorId(id)
        .then((dados) => {
          setFormulario({
            titulo: dados.titulo || '',
            instituicao: dados.instituicao || '',
            categoria: dados.categoria || 'Outro',
            resumo: dados.resumo || '',
            url_origem: dados.url_origem || '',
            prazo_inscricao: dados.prazo_inscricao ? String(dados.prazo_inscricao).slice(0, 10) : '',
            prazo_recurso: dados.prazo_recurso ? String(dados.prazo_recurso).slice(0, 10) : '',
            data_resultado: dados.data_resultado ? String(dados.data_resultado).slice(0, 10) : '',
            status: dados.status || 'ativo',
            texto_extraido: dados.texto_extraido || '',
          });
          setNomeArquivoExistente(dados.nome_arquivo);
        })
        .catch((err) => {
          setErro(err.message || 'Falha ao carregar informações do edital.');
        })
        .finally(() => {
          setCarregandoDados(false);
        });
    }
  }, [id, modoEdicao]);

  // ---------------------------------------------------------------------------
  // FLUXO PRINCIPAL: Envio de PDF e Extração com IA
  // ---------------------------------------------------------------------------
  const lidarComSelecaoArquivoPdf = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (arquivo.type !== 'application/pdf' && !arquivo.name.toLowerCase().endsWith('.pdf')) {
      alert('Por favor, selecione um arquivo válido no formato PDF.');
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      alert('O arquivo selecionado excede o limite máximo de 10 MB.');
      return;
    }
    setArquivoPdf(arquivo);
    setErro(null);
  };

  const processarPdfComIa = async () => {
    if (!arquivoPdf) {
      alert('Selecione um arquivo PDF antes de iniciar a extração.');
      return;
    }

    setProcessandoPdf(true);
    setErro(null);
    setMensagemProcessamento('Enviando documento e extraindo camada de texto...');

    try {
      setTimeout(() => {
        setMensagemProcessamento('Processando texto com Inteligência Artificial...');
      }, 1200);

      const resposta = await api.processarPdfInicial(arquivoPdf, perfilSelecionadoId || null);

      const extraidos = resposta.dados_extraidos || {};
      const cronograma = extraidos.cronograma || {};

      // Monta os dados para revisão
      setDadosRevisao({
        arquivo: resposta.arquivo,
        texto_extraido: resposta.texto_extraido,
        perfil_utilizado: resposta.perfil_utilizado,
        provedor_ia: extraidos.provedor_ia,
        modelo_ia: extraidos.modelo_ia,
        resultado_orientativo: extraidos.resultado_orientativo || 'possivel_compatibilidade',
        resumo_simples: extraidos.resumo_simples || '',
        avisos: extraidos.avisos || [],

        // Campos editáveis do edital
        titulo: extraidos.titulo_detectado || arquivoPdf.name.replace(/\.[^/.]+$/, ''),
        instituicao: extraidos.instituicao || '',
        categoria: extraidos.categoria || 'Bolsa de Estudos',
        url_origem: extraidos.url_origem || '',

        // Prazos distintos identificados
        prazo_inscricao: cronograma.prazo_inscricao?.data || extraidos.prazo_inscricao || '',
        prazo_inscricao_evidencia: cronograma.prazo_inscricao?.trecho_evidencia || '',

        prazo_recurso: cronograma.prazo_recurso?.data || extraidos.prazo_recurso || '',
        prazo_recurso_evidencia: cronograma.prazo_recurso?.trecho_evidencia || '',

        data_resultado: cronograma.data_resultado?.data || extraidos.data_resultado || '',
        data_resultado_evidencia: cronograma.data_resultado?.trecho_evidencia || '',

        // Custos e logística identificados
        custos_logistica: extraidos.custos_logistica || null,

        // Requisitos e critérios
        requisitos: extraidos.requisitos || [],

        // Documentos individuais identificados com procedimentos e fontes
        documentos: extraidos.documentos || [],
      });

      setEtapaFluxo('revisao');
    } catch (err) {
      setErro(err.message || 'Falha ao processar o arquivo PDF com IA.');
    } finally {
      setProcessandoPdf(false);
      setMensagemProcessamento('');
    }
  };

  // ---------------------------------------------------------------------------
  // MANIPULAÇÃO DOS REQUISITOS E CUSTOS NA TELA DE REVISÃO
  // ---------------------------------------------------------------------------
  const atualizarCampoRevisao = (campo, valor) => {
    setDadosRevisao((ant) => ({ ...ant, [campo]: valor }));
  };

  const atualizarCustoLogisticaRevisao = (secao, campo, valor) => {
    setDadosRevisao((ant) => ({
      ...ant,
      custos_logistica: {
        ...(ant.custos_logistica || {}),
        [secao]: {
          ...((ant.custos_logistica && ant.custos_logistica[secao]) || {}),
          [campo]: valor,
        },
      },
    }));
  };

  const atualizarRequisitoRevisao = (index, campo, valor) => {
    setDadosRevisao((ant) => {
      const novos = [...ant.requisitos];
      novos[index] = { ...novos[index], [campo]: valor };
      return { ...ant, requisitos: novos };
    });
  };

  const removerRequisitoRevisao = (index) => {
    setDadosRevisao((ant) => ({
      ...ant,
      requisitos: ant.requisitos.filter((_, i) => i !== index),
    }));
  };

  const adicionarRequisitoRevisao = () => {
    setDadosRevisao((ant) => ({
      ...ant,
      requisitos: [
        ...ant.requisitos,
        {
          titulo: 'Novo critério adicionado manualmente',
          descricao: '',
          tipo: 'documento',
          obrigatorio: true,
          status_perfil: 'confirmar',
          evidencia_texto: null,
          pagina_origem: null,
          origem_dado: 'manual',
          observacao: '',
        },
      ],
    }));
  };

  const atualizarDocumentoRevisao = (index, campo, valor) => {
    setDadosRevisao((ant) => {
      const novos = [...(ant.documentos || [])];
      novos[index] = { ...novos[index], [campo]: valor };
      return { ...ant, documentos: novos };
    });
  };

  const removerDocumentoRevisao = (index) => {
    setDadosRevisao((ant) => ({
      ...ant,
      documentos: (ant.documentos || []).filter((_, i) => i !== index),
    }));
  };

  const adicionarDocumentoRevisao = () => {
    setDadosRevisao((ant) => ({
      ...ant,
      documentos: [
        ...(ant.documentos || []),
        {
          nome: 'Novo Documento Exigido',
          finalidade: '',
          quem_fornece: 'Candidato',
          orgao_emissor: '',
          como_obter: '',
          documentos_alternativos: '',
          formato_aceito: 'PDF legível',
          exigencias_validade: '',
          local_entrega: 'Portal de Inscrições Oficial',
          url_entrega: null,
          secao_entrega: '',
          etapa_processo: 'Inscrição',
          prazo_envio: null,
          prazo_envio_descricao: '',
          como_confirmar_envio: 'Verificar comprovante gerado',
          instrucoes_protocolo: 'Baixar e salvar recibo',
          status_etapa: 'pendente_obtencao',
          classificacao_fonte: 'confirmado_edital',
          secao_edital: null,
          pagina_origem: null,
          trecho_evidencia: null,
          link_fonte_oficial: null,
          observacao_pendencia: null,
        },
      ],
    }));
  };

  // ---------------------------------------------------------------------------
  // CONFIRMAÇÃO E SALVAMENTO DEFINITIVO NO MYSQL
  // ---------------------------------------------------------------------------
  const confirmarESalvarEdital = async () => {
    if (!dadosRevisao.titulo || dadosRevisao.titulo.trim().length < 3) {
      alert('O título do edital é obrigatório e deve ter pelo menos 3 caracteres.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const payload = {
        edital: {
          titulo: dadosRevisao.titulo.trim(),
          instituicao: dadosRevisao.instituicao.trim() || null,
          categoria: dadosRevisao.categoria || 'Outro',
          resumo: dadosRevisao.resumo_simples.trim() || null,
          url_origem: dadosRevisao.url_origem.trim() || null,
          prazo_inscricao: dadosRevisao.prazo_inscricao || null,
          prazo_recurso: dadosRevisao.prazo_recurso || null,
          data_resultado: dadosRevisao.data_resultado || null,
          nome_arquivo: dadosRevisao.arquivo?.nome_original || null,
          caminho_arquivo: dadosRevisao.arquivo?.caminho_arquivo || null,
          texto_extraido: dadosRevisao.texto_extraido || null,
          status: 'ativo',
          custos_logistica: dadosRevisao.custos_logistica || null,
        },
        analise: {
          perfil_id: perfilSelecionadoId ? parseInt(perfilSelecionadoId, 10) : null,
          resumo: dadosRevisao.resumo_simples,
          resultado_orientativo: dadosRevisao.resultado_orientativo || 'possivel_compatibilidade',
          provedor_ia: dadosRevisao.provedor_ia || 'manual',
          modelo_ia: dadosRevisao.modelo_ia || null,
          custos_logistica: dadosRevisao.custos_logistica || null,
        },
        requisitos: dadosRevisao.requisitos.map((r) => ({
          titulo: r.titulo,
          descricao: r.descricao || null,
          tipo: r.tipo || 'outro',
          obrigatorio: r.obrigatorio !== false,
          status_perfil: r.status_perfil || 'confirmar',
          evidencia_texto: r.evidencia_texto || null,
          pagina_origem: r.pagina_origem || null,
          origem_dado: r.origem_dado || 'ia',
          observacao: r.observacao || null,
          procedimento_detalhado: r.procedimento_detalhado || null,
          classificacao_fonte: r.classificacao_fonte || 'confirmado_edital',
          secao_edital: r.secao_edital || null,
          link_fonte_oficial: r.link_fonte_oficial || null,
          data_verificacao_externa: r.data_verificacao_externa || null,
          observacao_pendencia: r.observacao_pendencia || null,
        })),
        documentos: (dadosRevisao.documentos || []).map((d) => ({
          nome: d.nome,
          nome_simples: d.nome_simples || d.nome,
          finalidade: d.finalidade || null,
          quem_fornece: d.quem_fornece || null,
          orgao_emissor: d.orgao_emissor || null,
          como_obter: d.como_obter || null,
          dados_solicitacao: d.dados_solicitacao || null,
          documentos_alternativos: d.documentos_alternativos || null,
          formato_aceito: d.formato_aceito || 'PDF legível',
          exigencias_validade: d.exigencias_validade || null,
          instrucoes_preparacao: d.instrucoes_preparacao || null,
          como_digitalizar: d.como_digitalizar || null,
          local_entrega: d.local_entrega || null,
          url_entrega: d.url_entrega || null,
          secao_entrega: d.secao_entrega || null,
          etapa_processo: d.etapa_processo || null,
          prazo_envio: d.prazo_envio || null,
          prazo_envio_descricao: d.prazo_envio_descricao || null,
          como_confirmar_envio: d.como_confirmar_envio || null,
          instrucoes_protocolo: d.instrucoes_protocolo || null,
          status_etapa: d.status_etapa || 'pendente_obtencao',
          checklist_etapas: d.checklist_etapas || null,
          protocolo_comprovante: d.protocolo_comprovante || null,
          classificacao_fonte: d.classificacao_fonte || 'confirmado_edital',
          secao_edital: d.secao_edital || null,
          pagina_origem: d.pagina_origem || null,
          trecho_evidencia: d.trecho_evidencia || null,
          link_fonte_oficial: d.link_fonte_oficial || null,
          data_verificacao_externa: d.data_verificacao_externa || null,
          observacao_pendencia: d.observacao_pendencia || null,
        })),
      };

      const resultado = await api.confirmarCadastroEdital(payload);

      // Redireciona para o relatório da análise gerada
      navegar(`/analises/${resultado.analise.id}`);
    } catch (err) {
      setErro(err.message || 'Falha ao confirmar e salvar o edital no banco de dados.');
      setSalvando(false);
    }
  };

  // ---------------------------------------------------------------------------
  // FLUXO MANUAL ALTERNATIVO (OU EDIÇÃO DE EDITAL EXISTENTE)
  // ---------------------------------------------------------------------------
  const salvarEditalManual = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setErrosCampos({});

    if (!formulario.titulo || formulario.titulo.trim().length < 3) {
      setErrosCampos({ titulo: 'O título deve conter pelo menos 3 caracteres.' });
      setSalvando(false);
      return;
    }

    try {
      let editalSalvo;
      const payload = {
        ...formulario,
        instituicao: formulario.instituicao.trim() || null,
        resumo: formulario.resumo.trim() || null,
        url_origem: formulario.url_origem.trim() || null,
        prazo_inscricao: formulario.prazo_inscricao || null,
        prazo_recurso: formulario.prazo_recurso || null,
        data_resultado: formulario.data_resultado || null,
        texto_extraido: formulario.texto_extraido.trim() || null,
      };

      if (modoEdicao) {
        editalSalvo = await api.atualizarEdital(id, payload);
      } else {
        editalSalvo = await api.criarEdital(payload);
      }

      navegar(`/editais/${editalSalvo.id}`);
    } catch (err) {
      if (err.detalhes && Array.isArray(err.detalhes)) {
        const mapa = {};
        err.detalhes.forEach((d) => {
          mapa[d.campo] = d.mensagem;
        });
        setErrosCampos(mapa);
      }
      setErro(err.message || 'Erro ao salvar edital.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregandoDados) {
    return <EstadoCarregamento mensagem="Carregando dados do edital..." />;
  }

  const modoIaAtivo = saude?.inteligenciaArtificial?.modoAtivo === 'gemini_api';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Botão Voltar */}
      <div>
        <Link
          to="/editais"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--cor-texto-secundario)' }}
        >
          <ArrowLeft size={16} />
          <span>Voltar para o catálogo de editais</span>
        </Link>
      </div>

      {/* =========================================================================
          FLUXO DE EDIÇÃO MANUAL (EXISTENTE) OU FORMULÁRIO MANUAL ALTERNATIVO
         ========================================================================= */}
      {formularioManualAtivo ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--cor-primaria)' }}>
              {modoEdicao ? 'Editar Edital' : 'Preenchimento Manual de Edital'}
            </h1>
            {!modoEdicao && (
              <Botao
                variante="secundario"
                tamanho="sm"
                icone={<Sparkles size={16} />}
                onClick={() => setFormularioManualAtivo(false)}
              >
                Voltar para Análise Automática com IA (PDF)
              </Botao>
            )}
          </div>

          {erro && <MensagemErro mensagem={erro} />}

          <form onSubmit={salvarEditalManual}>
            <Cartao>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <CampoTexto
                  id="titulo"
                  rotulo="Título do Edital"
                  obrigatorio
                  valor={formulario.titulo}
                  aoMudar={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                  placeholder="Ex: Programa de Iniciação Científica 2026"
                  erro={errosCampos.titulo}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <CampoTexto
                    id="instituicao"
                    rotulo="Instituição / Órgão Responsável"
                    valor={formulario.instituicao}
                    aoMudar={(e) => setFormulario({ ...formulario, instituicao: e.target.value })}
                    placeholder="Ex: Fundação Universitária de Apoio"
                    erro={errosCampos.instituicao}
                  />

                  <CampoSelecao
                    id="categoria"
                    rotulo="Categoria da Oportunidade"
                    obrigatorio
                    valor={formulario.categoria}
                    aoMudar={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
                    placeholder={null}
                    opcoes={[
                      'Bolsa de Estudos',
                      'Iniciação Científica',
                      'Capacitação/Curso',
                      'Auxílio Permanência',
                      'Estágio/Trabalho',
                      'Outro',
                    ]}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <CampoTexto
                    id="prazo_inscricao"
                    type="date"
                    rotulo="Prazo Final de Inscrição"
                    valor={formulario.prazo_inscricao}
                    aoMudar={(e) => setFormulario({ ...formulario, prazo_inscricao: e.target.value })}
                  />

                  <CampoTexto
                    id="prazo_recurso"
                    type="date"
                    rotulo="Prazo para Recursos"
                    valor={formulario.prazo_recurso}
                    aoMudar={(e) => setFormulario({ ...formulario, prazo_recurso: e.target.value })}
                  />

                  <CampoTexto
                    id="data_resultado"
                    type="date"
                    rotulo="Data de Resultado"
                    valor={formulario.data_resultado}
                    aoMudar={(e) => setFormulario({ ...formulario, data_resultado: e.target.value })}
                  />
                </div>

                <CampoTexto
                  id="url_origem"
                  rotulo="Link Oficial do Edital"
                  valor={formulario.url_origem}
                  aoMudar={(e) => setFormulario({ ...formulario, url_origem: e.target.value })}
                  placeholder="https://exemplo.org.br/edital-2026"
                />

                <CampoTexto
                  id="resumo"
                  rotulo="Resumo do Edital"
                  multilinha
                  rows={4}
                  valor={formulario.resumo}
                  aoMudar={(e) => setFormulario({ ...formulario, resumo: e.target.value })}
                  placeholder="Descreva sobre o que se trata o edital..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--cor-borda)', paddingTop: '1rem' }}>
                <Link to="/editais">
                  <Botao variante="secundario" disabled={salvando}>
                    Cancelar
                  </Botao>
                </Link>
                <Botao tipo="submit" variante="primario" carregando={salvando} icone={<Save size={18} />}>
                  {modoEdicao ? 'Salvar Alterações' : 'Cadastrar Manualmente'}
                </Botao>
              </div>
            </Cartao>
          </form>
        </div>
      ) : etapaFluxo === 'upload' ? (
        /* =========================================================================
            FLUXO PRINCIPAL - ETAPA 1: ENVIO DE PDF PARA ANÁLISE AUTOMÁTICA
           ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', color: 'var(--cor-primaria)', marginBottom: '0.35rem' }}>
              Análise e Extração Inteligente de Edital
            </h1>
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '1rem' }}>
              Envie o documento PDF do edital. A Inteligência Artificial lerá o documento e extrairá automaticamente
              título, instituição, categoria, cronograma de prazos, critérios de elegibilidade e documentos exigidos.
            </p>
          </div>

          {/* Banner de Status da IA */}
          <div className={`alerta ${modoIaAtivo ? 'alerta-sucesso' : 'alerta-info'}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {modoIaAtivo ? <Sparkles size={20} /> : <HelpCircle size={20} />}
              <div>
                <strong>
                  {modoIaAtivo
                    ? 'Motor de Inteligência Artificial Ativo (Google Gemini)'
                    : 'Modo Demonstração com Extração de Regras Locais'}
                </strong>
                <p style={{ fontSize: '0.86rem', marginTop: '0.15rem' }}>
                  {modoIaAtivo
                    ? 'O texto extraído do PDF será processado com o modelo Gemini configurado no backend.'
                    : 'O sistema fará a extração direta do PDF por regras locais estruturadas. Para IA avançada, adicione GEMINI_API_KEY no arquivo backend/.env.'}
                </p>
              </div>
            </div>
          </div>

          {erro && <MensagemErro mensagem={erro} />}

          <Cartao>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Dropzone de PDF */}
              <div
                style={{
                  border: '2px dashed var(--cor-secundaria)',
                  backgroundColor: arquivoPdf ? 'var(--cor-secundaria-suave)' : '#fafbfc',
                  borderRadius: 'var(--raio-lg)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={lidarComSelecaoArquivoPdf}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: arquivoPdf ? 'var(--cor-secundaria)' : '#e2e8f0',
                      color: arquivoPdf ? '#ffffff' : 'var(--cor-texto-secundario)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Upload size={28} />
                  </div>

                  {arquivoPdf ? (
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--cor-primaria)', marginBottom: '0.2rem' }}>
                        {arquivoPdf.name}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--cor-secundaria)', fontWeight: 600 }}>
                        PDF pronto para análise ({(arquivoPdf.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--cor-texto-mutado)' }}>
                        Clique ou arraste outro arquivo para substituir
                      </span>
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--cor-primaria)', marginBottom: '0.3rem' }}>
                        Clique para selecionar ou arraste o arquivo PDF aqui
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)' }}>
                        Documentos com texto pesquisável em formato PDF (tamanho máximo: 10 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Seleção do Perfil para Comparação Orientativa */}
              <div style={{ borderTop: '1px solid var(--cor-borda)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--cor-secundaria)', marginTop: '2px' }} />
                  <div>
                    <label htmlFor="perfil_analise" style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--cor-primaria)' }}>
                      Perfil do Candidato para Avaliação Orientativa de Elegibilidade:
                    </label>
                    <p style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)' }}>
                      A IA confrontará os critérios identificados no edital com as informações do perfil selecionado.
                    </p>
                  </div>
                </div>

                <select
                  id="perfil_analise"
                  value={perfilSelecionadoId}
                  onChange={(e) => setPerfilSelecionadoId(e.target.value)}
                  className="entrada-selecao"
                >
                  <option value="">Análise Geral (sem perfil específico)</option>
                  {perfis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome_exibicao} ({p.nivel_ensino || 'Escolaridade não inf.'} - {p.municipio || 'Local não inf.'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão de Ação Principal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFormularioManualAtivo(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--cor-secundaria)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Prefiro preencher manualmente sem PDF
                </button>

                <Botao
                  variante="primario"
                  tamanho="lg"
                  carregando={processandoPdf}
                  disabled={!arquivoPdf}
                  icone={<Sparkles size={20} />}
                  onClick={processarPdfComIa}
                >
                  {processandoPdf ? mensagemProcessamento || 'Processando...' : 'Analisar Edital e Extrair Dados com IA'}
                </Botao>
              </div>
            </div>
          </Cartao>
        </div>
      ) : (
        /* =========================================================================
            FLUXO PRINCIPAL - ETAPA 2: TELA DE REVISÃO E CONFERÊNCIA DOS DADOS EXTRAÍDOS
           ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Cabeçalho de Revisão */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="cracha cracha-sucesso" style={{ fontSize: '0.85rem' }}>
                  <Check size={14} />
                  <span>Extração Concluída</span>
                </span>
                <span className="cracha cracha-neutro" style={{ fontSize: '0.8rem' }}>
                  {dadosRevisao.provedor_ia === 'gemini' ? `Modelo: ${dadosRevisao.modelo_ia}` : 'Modo: Regras Locais'}
                </span>
              </div>
              <h1 style={{ fontSize: '1.9rem', color: 'var(--cor-primaria)' }}>
                Revisão dos Dados Extraídos
              </h1>
              <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem' }}>
                Conferência prévia obrigatória: revise as informações extraídas, corrija ou complemente apenas o necessário antes de salvar.
              </p>
            </div>

            <Botao
              variante="secundario"
              tamanho="sm"
              icone={<RotateCcw size={15} />}
              onClick={() => setEtapaFluxo('upload')}
              disabled={salvando}
            >
              Enviar Outro PDF
            </Botao>
          </div>

          {/* Banner de Transparência */}
          <div className="alerta alerta-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={20} />
              <div>
                <strong>Princípio de Confiabilidade:</strong> Informações que não foram encontradas de forma explícita
                no PDF permanecem como «Não identificada». Não inventamos prazos ou critérios ausentes.
              </div>
            </div>
          </div>

          {erro && <MensagemErro mensagem={erro} />}

          {/* SEÇÃO 1: Dados Gerais do Edital */}
          <Cartao titulo="1. Dados Gerais do Edital">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CampoTexto
                id="rev_titulo"
                rotulo="Título Identificado"
                obrigatorio
                dica="Título oficial do edital ou processo seletivo extraído do documento."
                valor={dadosRevisao.titulo}
                aoMudar={(e) => atualizarCampoRevisao('titulo', e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <CampoTexto
                  id="rev_instituicao"
                  rotulo="Instituição Responsável"
                  dica="Órgão, fundação ou universidade responsável pelo edital."
                  valor={dadosRevisao.instituicao}
                  aoMudar={(e) => atualizarCampoRevisao('instituicao', e.target.value)}
                  placeholder="Não identificada no texto — preencha se souber"
                />

                <CampoSelecao
                  id="rev_categoria"
                  rotulo="Categoria"
                  valor={dadosRevisao.categoria}
                  aoMudar={(e) => atualizarCampoRevisao('categoria', e.target.value)}
                  placeholder={null}
                  opcoes={[
                    'Bolsa de Estudos',
                    'Iniciação Científica',
                    'Capacitação/Curso',
                    'Auxílio Permanência',
                    'Estágio/Trabalho',
                    'Outro',
                  ]}
                />
              </div>

              <CampoTexto
                id="rev_url"
                rotulo="Link Oficial Identificado (URL)"
                valor={dadosRevisao.url_origem}
                aoMudar={(e) => atualizarCampoRevisao('url_origem', e.target.value)}
                placeholder="Nenhum link encontrado no documento — preencha se desejar"
              />

              <CampoTexto
                id="rev_resumo"
                rotulo="Resumo em Linguagem Simples"
                multilinha
                rows={3}
                valor={dadosRevisao.resumo_simples}
                aoMudar={(e) => atualizarCampoRevisao('resumo_simples', e.target.value)}
              />
            </div>
          </Cartao>

          {/* SEÇÃO 2: Cronograma com Distinção de Prazos (Inscrição, Recurso e Resultado) */}
          <Cartao
            titulo="2. Cronograma de Prazos Distintos"
            subtitulo="O sistema diferencia prazos de inscrição, prazos recursais e data de divulgação com suas respectivas evidências"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Prazo de Inscrição */}
              <div style={{ border: '1px solid var(--cor-borda)', padding: '1rem', borderRadius: 'var(--raio-md)', backgroundColor: '#fafbfc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label htmlFor="rev_prazo_inscricao" style={{ fontWeight: 600, color: 'var(--cor-primaria)' }}>
                    Prazo Final de Inscrição:
                  </label>
                  <CrachaStatus tipo="prioridade" valor="urgente" />
                </div>
                <input
                  id="rev_prazo_inscricao"
                  type="date"
                  value={dadosRevisao.prazo_inscricao}
                  onChange={(e) => atualizarCampoRevisao('prazo_inscricao', e.target.value)}
                  className="entrada-texto"
                  style={{ maxWidth: '220px', marginBottom: '0.5rem' }}
                />
                <div style={{ fontSize: '0.84rem', color: 'var(--cor-texto-secundario)', fontStyle: 'italic' }}>
                  <strong>Evidência no edital:</strong> {dadosRevisao.prazo_inscricao_evidencia || 'Data não detectada de forma conclusiva no texto.'}
                </div>
              </div>

              {/* Prazo de Recurso */}
              <div style={{ border: '1px solid var(--cor-borda)', padding: '1rem', borderRadius: 'var(--raio-md)', backgroundColor: '#fafbfc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label htmlFor="rev_prazo_recurso" style={{ fontWeight: 600, color: 'var(--cor-primaria)' }}>
                    Prazo para Interposição de Recursos:
                  </label>
                  <CrachaStatus tipo="prioridade" valor="alta" />
                </div>
                <input
                  id="rev_prazo_recurso"
                  type="date"
                  value={dadosRevisao.prazo_recurso}
                  onChange={(e) => atualizarCampoRevisao('prazo_recurso', e.target.value)}
                  className="entrada-texto"
                  style={{ maxWidth: '220px', marginBottom: '0.5rem' }}
                />
                <div style={{ fontSize: '0.84rem', color: 'var(--cor-texto-secundario)', fontStyle: 'italic' }}>
                  <strong>Evidência no edital:</strong> {dadosRevisao.prazo_recurso_evidencia || 'Não foram identificadas datas específicas de recurso.'}
                </div>
              </div>

              {/* Data de Resultado */}
              <div style={{ border: '1px solid var(--cor-borda)', padding: '1rem', borderRadius: 'var(--raio-md)', backgroundColor: '#fafbfc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label htmlFor="rev_data_resultado" style={{ fontWeight: 600, color: 'var(--cor-primaria)' }}>
                    Data Prevista de Divulgação do Resultado:
                  </label>
                  <CrachaStatus tipo="prioridade" valor="media" />
                </div>
                <input
                  id="rev_data_resultado"
                  type="date"
                  value={dadosRevisao.data_resultado}
                  onChange={(e) => atualizarCampoRevisao('data_resultado', e.target.value)}
                  className="entrada-texto"
                  style={{ maxWidth: '220px', marginBottom: '0.5rem' }}
                />
                <div style={{ fontSize: '0.84rem', color: 'var(--cor-texto-secundario)', fontStyle: 'italic' }}>
                  <strong>Evidência no edital:</strong> {dadosRevisao.data_resultado_evidencia || 'Data de homologação/resultado não especificada.'}
                </div>
              </div>
            </div>
          </Cartao>

          {/* SEÇÃO 3: Custos e Necessidades Logísticas */}
          <Cartao
            titulo="3. Custos e Necessidades Logísticas (Pontos de Atenção)"
            subtitulo="Taxa de inscrição, valor, prazo de pagamento, regras de isenção, cidade/local da prova e avaliação de deslocamento"
          >
            <PainelCustosLogistica
              custosLogistica={dadosRevisao.custos_logistica}
              editavel={true}
              aoMudarCampo={atualizarCustoLogisticaRevisao}
            />
          </Cartao>

          {/* SEÇÃO 4: Requisitos, Documentos e Elegibilidade Extraídos */}
          <Cartao
            titulo={`4. Requisitos e Documentos Identificados (${dadosRevisao.requisitos.length})`}
            subtitulo="Critérios extraídos com referências aos trechos do documento original"
            acoes={
              <Botao variante="secundario" tamanho="sm" icone={<PlusCircle size={15} />} onClick={adicionarRequisitoRevisao}>
                Adicionar Critério
              </Botao>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dadosRevisao.requisitos.map((req, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--cor-borda)',
                    borderRadius: 'var(--raio-md)',
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <CrachaStatus tipo="criterio" valor={req.status_perfil} />
                      <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                        {req.tipo}
                      </span>
                      {req.obrigatorio && (
                        <span className="cracha cracha-perigo" style={{ fontSize: '0.72rem' }}>
                          Obrigatório
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removerRequisitoRevisao(index)}
                      title="Remover critério"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-erro)', padding: '0.2rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Edição do Título e Tipo */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={req.titulo}
                      onChange={(e) => atualizarRequisitoRevisao(index, 'titulo', e.target.value)}
                      className="entrada-texto"
                      placeholder="Título do critério"
                      style={{ fontWeight: 600 }}
                    />

                    <select
                      value={req.status_perfil}
                      onChange={(e) => atualizarRequisitoRevisao(index, 'status_perfil', e.target.value)}
                      className="entrada-selecao"
                    >
                      <option value="atendido">Parece atendido</option>
                      <option value="nao_atendido">Não parece atendido</option>
                      <option value="confirmar">Precisa confirmar</option>
                      <option value="nao_aplicavel">Não se aplica</option>
                    </select>
                  </div>

                  {/* Descrição */}
                  <input
                    type="text"
                    value={req.descricao || ''}
                    onChange={(e) => atualizarRequisitoRevisao(index, 'descricao', e.target.value)}
                    className="entrada-texto"
                    placeholder="Descrição simplificada do requisito"
                    style={{ fontSize: '0.88rem' }}
                  />

                  {/* Evidência textual literal */}
                  {req.evidencia_texto && (
                    <div
                      style={{
                        backgroundColor: '#f1f5f9',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--raio-sm)',
                        borderLeft: '3px solid var(--cor-secundaria)',
                        fontSize: '0.82rem',
                        color: '#334155',
                        fontStyle: 'italic',
                      }}
                    >
                      « {req.evidencia_texto} »
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Cartao>

          {/* SEÇÃO 4: Documentos Exigidos Identificados Individualmente */}
          <Cartao
            titulo={`4. Documentos Exigidos Identificados (${dadosRevisao.documentos?.length || 0})`}
            subtitulo="Orientações individuais sobre emissão, canal de envio, formatos e exigências de validade"
            acoes={
              <Botao
                variante="secundario"
                tamanho="sm"
                icone={<PlusCircle size={15} />}
                onClick={adicionarDocumentoRevisao}
              >
                Adicionar Documento
              </Botao>
            }
          >
            {(!dadosRevisao.documentos || dadosRevisao.documentos.length === 0) ? (
              <p style={{ textAlign: 'center', color: 'var(--cor-texto-mutado)', padding: '1rem' }}>
                Nenhum documento específico identificado no edital.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {dadosRevisao.documentos.map((doc, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid var(--cor-borda)',
                      borderRadius: 'var(--raio-md)',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <FileText size={16} style={{ color: 'var(--cor-secundaria)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cor-primaria)' }}>
                          Documento #{index + 1}
                        </span>
                        {doc.formato_aceito && (
                          <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                            {doc.formato_aceito}
                          </span>
                        )}
                        {doc.local_entrega && (
                          <span className="cracha cracha-sucesso" style={{ fontSize: '0.72rem' }}>
                            {doc.local_entrega}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removerDocumentoRevisao(index)}
                        title="Remover documento"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-erro)', padding: '0.2rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cor-texto-secundario)', display: 'block', marginBottom: '0.2rem' }}>
                          Nome Oficial do Documento:
                        </label>
                        <input
                          type="text"
                          value={doc.nome}
                          onChange={(e) => atualizarDocumentoRevisao(index, 'nome', e.target.value)}
                          className="entrada-texto"
                          placeholder="Nome do documento no edital"
                          style={{ fontWeight: 600 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cor-texto-secundario)', display: 'block', marginBottom: '0.2rem' }}>
                          Nome em Linguagem Simples:
                        </label>
                        <input
                          type="text"
                          value={doc.nome_simples || doc.nome}
                          onChange={(e) => atualizarDocumentoRevisao(index, 'nome_simples', e.target.value)}
                          className="entrada-texto"
                          placeholder="Ex: Documento de Identidade com Foto"
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cor-texto-secundario)', display: 'block', marginBottom: '0.2rem' }}>
                          Órgão Emissor / Quem Emite:
                        </label>
                        <input
                          type="text"
                          value={doc.orgao_emissor || ''}
                          onChange={(e) => atualizarDocumentoRevisao(index, 'orgao_emissor', e.target.value)}
                          className="entrada-texto"
                          placeholder="Ex: Polícia Federal, Cartório, Concessionária"
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cor-texto-secundario)', display: 'block', marginBottom: '0.2rem' }}>
                          Local / Portal de Envio:
                        </label>
                        <input
                          type="text"
                          value={doc.local_entrega || ''}
                          onChange={(e) => atualizarDocumentoRevisao(index, 'local_entrega', e.target.value)}
                          className="entrada-texto"
                          placeholder="Ex: Portal do Candidato"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cor-texto-secundario)', display: 'block', marginBottom: '0.2rem' }}>
                        Como Obter (Procedimento detalhado para leigos):
                      </label>
                      <textarea
                        value={doc.como_obter || ''}
                        onChange={(e) => atualizarDocumentoRevisao(index, 'como_obter', e.target.value)}
                        className="entrada-texto"
                        rows={2}
                        placeholder="Explique o passo a passo de como solicitar e obter este documento..."
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Cartao>

          {/* Botões Finais de Confirmação e Salvamento */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: '#ffffff',
              padding: '1.25rem',
              borderRadius: 'var(--raio-lg)',
              border: '1px solid var(--cor-borda)',
              boxShadow: 'var(--sombra-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)', display: 'block' }}>
                Pronto para salvar os dados verificados?
              </span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--cor-primaria)' }}>
                Isso criará o edital no MySQL, salvará o relatório de análise e gerará seu Plano de Ação.
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Botao
                variante="secundario"
                onClick={() => setEtapaFluxo('upload')}
                disabled={salvando}
              >
                Voltar e Reenviar
              </Botao>

              <Botao
                variante="primario"
                tamanho="lg"
                carregando={salvando}
                icone={<CheckCircle2 size={20} />}
                onClick={confirmarESalvarEdital}
              >
                Confirmar e Salvar Edital no MySQL
              </Botao>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
