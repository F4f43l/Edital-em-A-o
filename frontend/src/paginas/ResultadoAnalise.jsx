import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  CheckSquare,
  PlusCircle,
  Edit,
  Trash2,
  Info,
  Calendar,
  ExternalLink,
  Layers,
  DollarSign,
  ClipboardList,
} from 'lucide-react';
import { api } from '../servicos/api.js';
import { Cartao } from '../componentes/Cartao.jsx';
import { Botao } from '../componentes/Botao.jsx';
import { CrachaStatus } from '../componentes/CrachaStatus.jsx';
import { CrachaPrazo } from '../componentes/CrachaPrazo.jsx';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao.jsx';
import { CampoTexto } from '../componentes/CampoTexto.jsx';
import { CampoSelecao } from '../componentes/CampoSelecao.jsx';
import { EstadoCarregamento } from '../componentes/EstadoCarregamento.jsx';
import { MensagemErro } from '../componentes/MensagemErro.jsx';
import { PainelCustosLogistica } from '../componentes/PainelCustosLogistica.jsx';
import { CardRequisitoProcedimento } from '../componentes/CardRequisitoProcedimento.jsx';
import { GuiaChecklistDocumentos } from '../componentes/GuiaChecklistDocumentos.jsx';
import { ROTULOS_RESULTADO_ORIENTATIVO, formatarDataPtBr } from '../utilitarios/formatadores.js';

export function ResultadoAnalise() {
  const { id } = useParams();

  const [analise, setAnalise] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Navegação por Abas Principais
  const [abaAtiva, setAbaAtiva] = useState('requisitos'); // 'requisitos' | 'documentos' | 'custos'

  // Modal para Adicionar / Editar Requisito
  const [modalRequisitoAberto, setModalRequisitoAberto] = useState(false);
  const [requisitoEmEdicao, setRequisitoEmEdicao] = useState(null);
  const [salvandoRequisito, setSalvandoRequisito] = useState(false);

  const [formRequisito, setFormRequisito] = useState({
    titulo: '',
    descricao: '',
    tipo: 'elegibilidade',
    obrigatorio: true,
    status_perfil: 'confirmar',
    evidencia_texto: '',
    pagina_origem: '',
    observacao: '',
    classificacao_fonte: 'confirmado_edital',
    secao_edital: '',
    link_fonte_oficial: '',
    observacao_pendencia: '',
  });

  // Modal para Excluir Requisito
  const [requisitoParaExcluir, setRequisitoParaExcluir] = useState(null);
  const [excluindoRequisito, setExcluindoRequisito] = useState(false);

  const carregarAnalise = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await api.buscarAnalisePorId(id);
      setAnalise(dados);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar análise.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAnalise();
  }, [id]);

  const abrirNovoRequisito = () => {
    setRequisitoEmEdicao(null);
    setFormRequisito({
      titulo: '',
      descricao: '',
      tipo: 'documento',
      obrigatorio: true,
      status_perfil: 'confirmar',
      evidencia_texto: '',
      pagina_origem: '',
      observacao: '',
      classificacao_fonte: 'confirmado_edital',
      secao_edital: '',
      link_fonte_oficial: '',
      observacao_pendencia: '',
    });
    setModalRequisitoAberto(true);
  };

  const abrirEditarRequisito = (req) => {
    setRequisitoEmEdicao(req);
    setFormRequisito({
      titulo: req.titulo || '',
      descricao: req.descricao || '',
      tipo: req.tipo || 'elegibilidade',
      obrigatorio: req.obrigatorio !== false,
      status_perfil: req.status_perfil || 'confirmar',
      evidencia_texto: req.evidencia_texto || '',
      pagina_origem: req.pagina_origem ? String(req.pagina_origem) : '',
      observacao: req.observacao || '',
      classificacao_fonte: req.classificacao_fonte || 'confirmado_edital',
      secao_edital: req.secao_edital || '',
      link_fonte_oficial: req.link_fonte_oficial || '',
      observacao_pendencia: req.observacao_pendencia || '',
    });
    setModalRequisitoAberto(true);
  };

  const salvarRequisito = async (e) => {
    e.preventDefault();
    setSalvandoRequisito(true);

    if (!formRequisito.titulo.trim()) {
      alert('O título do requisito é obrigatório.');
      setSalvandoRequisito(false);
      return;
    }

    try {
      const payload = {
        ...formRequisito,
        pagina_origem: formRequisito.pagina_origem ? parseInt(formRequisito.pagina_origem, 10) : null,
      };

      if (requisitoEmEdicao) {
        await api.atualizarRequisito(requisitoEmEdicao.id, payload);
      } else {
        await api.criarRequisito(analise.id, payload);
      }

      setModalRequisitoAberto(false);
      await carregarAnalise();
    } catch (err) {
      alert(`Erro ao salvar requisito: ${err.message}`);
    } finally {
      setSalvandoRequisito(false);
    }
  };

  const confirmarExclusaoRequisito = async () => {
    if (!requisitoParaExcluir) return;
    setExcluindoRequisito(true);
    try {
      await api.excluirRequisito(requisitoParaExcluir.id);
      setRequisitoParaExcluir(null);
      await carregarAnalise();
    } catch (err) {
      alert(`Erro ao excluir requisito: ${err.message}`);
    } finally {
      setExcluindoRequisito(false);
    }
  };

  if (carregando) {
    return <EstadoCarregamento mensagem="Processando dados da análise orientativa..." />;
  }

  if (erro || !analise) {
    return <MensagemErro mensagem={erro || 'Análise não encontrada.'} aoTentarNovamente={carregarAnalise} />;
  }

  const orientacaoInfo = ROTULOS_RESULTADO_ORIENTATIVO[analise.resultado_orientativo] || {
    texto: 'Em Análise',
    variante: 'neutro',
    explicacao: '',
  };

  const contagemRequisitos = analise.requisitos?.length || 0;
  const contagemDocumentos = analise.documentos?.length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Botão Voltar */}
      <div>
        <Link
          to={`/editais/${analise.edital_id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--cor-texto-secundario)' }}
        >
          <ArrowLeft size={16} />
          <span>Voltar para o edital: {analise.edital_titulo}</span>
        </Link>
      </div>

      {/* Cartão de Resumo da Análise */}
      <Cartao>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <CrachaStatus tipo="resultado_orientativo" valor={analise.resultado_orientativo} />
              <span className="cracha cracha-neutro" style={{ fontSize: '0.78rem' }}>
                Origem: {analise.provedor_ia === 'gemini' ? `IA Google Gemini (${analise.modelo_ia})` : 'Extração Heurística / Regras'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)' }}>
                Realizada em: {formatarDataPtBr(analise.created_at)}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', color: 'var(--cor-primaria)', marginBottom: '0.25rem' }}>
              Relatório de Orientação Passo a Passo
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--cor-texto-secundario)' }}>
              Edital: <strong>{analise.edital_titulo}</strong> | Perfil avaliado: <strong>{analise.perfil_nome || 'Avaliação Geral'}</strong>
            </p>
          </div>

          {/* CTA para o Plano de Ação */}
          <Link to={`/plano-de-acao?analise_id=${analise.id}`}>
            <Botao variante="primario" tamanho="lg" icone={<CheckSquare size={18} />}>
              Acessar Plano de Ação ({analise.tarefas?.length || 0} tarefas)
            </Botao>
          </Link>
        </div>

        {/* Banner Orientativo do Resultado */}
        <div
          className={`alerta ${
            orientacaoInfo.variante === 'sucesso'
              ? 'alerta-sucesso'
              : orientacaoInfo.variante === 'perigo'
              ? 'alerta-erro'
              : 'alerta-atencao'
          }`}
          style={{ marginBottom: '1.25rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {orientacaoInfo.variante === 'sucesso' ? (
              <CheckCircle2 size={22} />
            ) : orientacaoInfo.variante === 'perigo' ? (
              <AlertTriangle size={22} />
            ) : (
              <HelpCircle size={22} />
            )}
            <div>
              <strong>Diagnóstico Orientativo: {orientacaoInfo.texto}</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{orientacaoInfo.explicacao}</p>
            </div>
          </div>
        </div>

        {/* Resumo Simples */}
        {analise.resumo && (
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--raio-md)', border: '1px solid var(--cor-borda)' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--cor-primaria)', marginBottom: '0.35rem' }}>
              Síntese em Linguagem Simples:
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--cor-texto-secundario)', lineHeight: 1.6 }}>
              {analise.resumo}
            </p>
          </div>
        )}
      </Cartao>

      {/* Navegação por Abas para Organização Transparente */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--cor-borda)',
          paddingBottom: '0.25rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setAbaAtiva('requisitos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: abaAtiva === 'requisitos' ? '3px solid var(--cor-secundaria)' : '3px solid transparent',
            backgroundColor: abaAtiva === 'requisitos' ? 'var(--cor-secundaria-suave)' : 'transparent',
            color: abaAtiva === 'requisitos' ? 'var(--cor-secundaria)' : 'var(--cor-texto-secundario)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderRadius: 'var(--raio-sm) var(--raio-sm) 0 0',
            transition: 'all 0.15s ease',
          }}
        >
          <ClipboardList size={18} />
          <span>Requisitos & Procedimentos ({contagemRequisitos})</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('documentos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: abaAtiva === 'documentos' ? '3px solid var(--cor-secundaria)' : '3px solid transparent',
            backgroundColor: abaAtiva === 'documentos' ? 'var(--cor-secundaria-suave)' : 'transparent',
            color: abaAtiva === 'documentos' ? 'var(--cor-secundaria)' : 'var(--cor-texto-secundario)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderRadius: 'var(--raio-sm) var(--raio-sm) 0 0',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={18} />
          <span>Checklist de Documentos ({contagemDocumentos})</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('custos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: abaAtiva === 'custos' ? '3px solid var(--cor-secundaria)' : '3px solid transparent',
            backgroundColor: abaAtiva === 'custos' ? 'var(--cor-secundaria-suave)' : 'transparent',
            color: abaAtiva === 'custos' ? 'var(--cor-secundaria)' : 'var(--cor-texto-secundario)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderRadius: 'var(--raio-sm) var(--raio-sm) 0 0',
            transition: 'all 0.15s ease',
          }}
        >
          <DollarSign size={18} />
          <span>Custos & Logística</span>
        </button>
      </div>

      {/* =========================================================================
          ABA 1: REQUISITOS & PROCEDIMENTO PASSO A PASSO COMPLETO (16 PONTOS)
         ========================================================================= */}
      {abaAtiva === 'requisitos' && (
        <Cartao
          titulo={`Procedimento Completo dos Requisitos (${contagemRequisitos})`}
          subtitulo="Orientações detalhadas sobre o que comprovar, como emitir, formatos, canais e verificação de entrega"
          acoes={
            <Botao variante="secundario" tamanho="sm" icone={<PlusCircle size={15} />} onClick={abrirNovoRequisito}>
              Adicionar Critério Manual
            </Botao>
          }
        >
          {contagemRequisitos === 0 ? (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--cor-texto-mutado)' }}>
              Nenhum requisito cadastrado para esta análise.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analise.requisitos.map((req) => {
                const docsVinculados = (analise.documentos || []).filter(
                  (d) =>
                    d.requisito_id === req.id ||
                    (d.nome && req.titulo.toLowerCase().includes(d.nome.toLowerCase()))
                );

                return (
                  <CardRequisitoProcedimento
                    key={req.id}
                    requisito={req}
                    documentosVinculados={docsVinculados}
                    aoEditar={abrirEditarRequisito}
                    aoExcluir={() => setRequisitoParaExcluir(req)}
                    aoSelecionarDocumento={() => setAbaAtiva('documentos')}
                  />
                );
              })}
            </div>
          )}
        </Cartao>
      )}

      {/* =========================================================================
          ABA 2: CHECKLIST DE DOCUMENTOS & REGISTRO DE PROTOCOLOS
         ========================================================================= */}
      {abaAtiva === 'documentos' && (
        <GuiaChecklistDocumentos
          documentos={analise.documentos || []}
          requisitos={analise.requisitos || []}
          analiseId={analise.id}
          aoAtualizarLista={carregarAnalise}
        />
      )}

      {/* =========================================================================
          ABA 3: CUSTOS & LOGÍSTICA
         ========================================================================= */}
      {abaAtiva === 'custos' && (
        <Cartao
          titulo="Custos e Logística do Edital"
          subtitulo="Identificação de taxa, valor, forma/prazo de pagamento, regras de isenção, cidade/local da prova e avaliação de deslocamento"
        >
          <PainelCustosLogistica custosLogistica={analise.custos_logistica} />
        </Cartao>
      )}

      {/* Modal Adicionar / Editar Requisito */}
      {modalRequisitoAberto && (
        <div className="sobreposicao-modal" role="dialog" aria-modal="true">
          <div className="conteudo-modal" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', marginBottom: '1rem' }}>
              {requisitoEmEdicao ? 'Editar Critério / Requisito' : 'Adicionar Critério Manual'}
            </h2>

            <form onSubmit={salvarRequisito}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <CampoTexto
                  id="req_titulo"
                  rotulo="Título do Critério"
                  obrigatorio
                  valor={formRequisito.titulo}
                  aoMudar={(e) => setFormRequisito({ ...formRequisito, titulo: e.target.value })}
                  placeholder="Ex: Renda familiar per capita máxima de 1,5 salário mínimo"
                />

                <CampoTexto
                  id="req_descricao"
                  rotulo="Explicação / Procedimento Geral"
                  multilinha
                  rows={2}
                  valor={formRequisito.descricao}
                  aoMudar={(e) => setFormRequisito({ ...formRequisito, descricao: e.target.value })}
                  placeholder="Explique com clareza o que a instituição exige e como cumprir..."
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  <CampoSelecao
                    id="req_tipo"
                    rotulo="Tipo de Requisito"
                    valor={formRequisito.tipo}
                    aoMudar={(e) => setFormRequisito({ ...formRequisito, tipo: e.target.value })}
                    placeholder={null}
                    opcoes={[
                      { valor: 'elegibilidade', rotulo: 'Elegibilidade (Condição básica)' },
                      { valor: 'documento', rotulo: 'Documento Comprobatório' },
                      { valor: 'etapa', rotulo: 'Etapa / Processo Seletivo' },
                      { valor: 'prazo', rotulo: 'Prazo' },
                      { valor: 'outro', rotulo: 'Outro' },
                    ]}
                  />

                  <CampoSelecao
                    id="req_status_perfil"
                    rotulo="Status em Relação ao Perfil"
                    valor={formRequisito.status_perfil}
                    aoMudar={(e) => setFormRequisito({ ...formRequisito, status_perfil: e.target.value })}
                    placeholder={null}
                    opcoes={[
                      { valor: 'atendido', rotulo: 'Parece atendido' },
                      { valor: 'nao_atendido', rotulo: 'Não parece atendido' },
                      { valor: 'confirmar', rotulo: 'Precisa confirmar' },
                      { valor: 'nao_aplicavel', rotulo: 'Não se aplica' },
                    ]}
                  />
                </div>

                <CampoTexto
                  id="req_evidencia"
                  rotulo="Trecho Literal de Evidência (Extraído do Edital)"
                  multilinha
                  rows={2}
                  dica="Transcreva o trecho literal do edital que sustenta este procedimento."
                  valor={formRequisito.evidencia_texto}
                  aoMudar={(e) => setFormRequisito({ ...formRequisito, evidencia_texto: e.target.value })}
                  placeholder="Trecho literal das páginas do edital..."
                />

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.85rem' }}>
                  <CampoTexto
                    id="req_pagina"
                    type="number"
                    rotulo="Nº Página"
                    valor={formRequisito.pagina_origem}
                    aoMudar={(e) => setFormRequisito({ ...formRequisito, pagina_origem: e.target.value })}
                    placeholder="Ex: 2"
                  />

                  <CampoTexto
                    id="req_secao"
                    rotulo="Seção do Edital"
                    valor={formRequisito.secao_edital}
                    aoMudar={(e) => setFormRequisito({ ...formRequisito, secao_edital: e.target.value })}
                    placeholder="Ex: Seção 4.1"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <CampoSelecao
                    id="req_classificacao"
                    rotulo="Classificação da Fonte"
                    valor={formRequisito.classificacao_fonte}
                    aoMudar={(e) => setFormRequisito({ ...formRequisito, classificacao_fonte: e.target.value })}
                    placeholder={null}
                    opcoes={[
                      { valor: 'confirmado_edital', rotulo: 'Confirmado no edital' },
                      { valor: 'confirmado_outra_fonte', rotulo: 'Confirmado em outra fonte oficial' },
                      { valor: 'recomendacao_organizacao', rotulo: 'Recomendação de organização' },
                      { valor: 'nao_localizado', rotulo: 'Não localizado no edital' },
                      { valor: 'ambiguo_pendente', rotulo: 'Ambíguo ou pendente de confirmação' },
                    ]}
                  />

                  <CampoTexto
                    id="req_link_fonte"
                    rotulo="Link da Fonte Oficial Externa"
                    valor={formRequisito.link_fonte_oficial}
                    aoMudar={(e) => setFormRequisito({ ...formRequisito, link_fonte_oficial: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <CampoTexto
                  id="req_pendencia"
                  rotulo="Pendência ou Aviso de Ausência de Informação"
                  valor={formRequisito.observacao_pendencia}
                  aoMudar={(e) => setFormRequisito({ ...formRequisito, observacao_pendencia: e.target.value })}
                  placeholder="Ex: Canal de entrega pendente de confirmação pela banca"
                />
              </div>

              <div className="acoes-modal" style={{ marginTop: '1.25rem' }}>
                <Botao
                  variante="secundario"
                  onClick={() => setModalRequisitoAberto(false)}
                  disabled={salvandoRequisito}
                >
                  Cancelar
                </Botao>
                <Botao tipo="submit" variante="primario" carregando={salvandoRequisito}>
                  Salvar Critério
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão de Requisito */}
      <ModalConfirmacao
        aberto={Boolean(requisitoParaExcluir)}
        titulo="Excluir Critério"
        nomeItem={requisitoParaExcluir?.titulo}
        mensagem="Deseja remover este requisito da análise?"
        aoConfirmar={confirmarExclusaoRequisito}
        aoCancelar={() => setRequisitoParaExcluir(null)}
        carregando={excluindoRequisito}
      />
    </div>
  );
}
