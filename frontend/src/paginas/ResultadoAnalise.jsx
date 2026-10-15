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
import { ROTULOS_RESULTADO_ORIENTATIVO, formatarDataPtBr } from '../utilitarios/formatadores.js';

export function ResultadoAnalise() {
  const { id } = useParams();

  const [analise, setAnalise] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

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
              Relatório de Análise Orientativa
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

      {/* Custos e Necessidades Logísticas */}
      <Cartao
        titulo="Custos e Logística do Edital"
        subtitulo="Identificação de taxa, valor, forma/prazo de pagamento, regras de isenção, cidade/local da prova e avaliação de deslocamento"
      >
        <PainelCustosLogistica custosLogistica={analise.custos_logistica} />
      </Cartao>

      {/* Lista de Critérios e Requisitos Extraídos */}
      <Cartao
        titulo={`Critérios e Requisitos Identificados (${analise.requisitos?.length || 0})`}
        subtitulo="Evidências literais do texto original confrontadas com o perfil do candidato"
        acoes={
          <Botao variante="secundario" tamanho="sm" icone={<PlusCircle size={15} />} onClick={abrirNovoRequisito}>
            Adicionar Critério Manual
          </Botao>
        }
      >
        {analise.requisitos?.length === 0 ? (
          <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--cor-texto-mutado)' }}>
            Nenhum critério foi cadastrado ou extraído para esta análise.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analise.requisitos.map((req) => (
              <div
                key={req.id}
                style={{
                  border: '1px solid var(--cor-borda)',
                  borderRadius: 'var(--raio-md)',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--cor-primaria)' }}>
                      {req.titulo}
                    </h4>
                    <CrachaStatus tipo="criterio" valor={req.status_perfil} />
                    <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                      {req.tipo}
                    </span>
                    {req.obrigatorio && (
                      <span className="cracha cracha-perigo" style={{ fontSize: '0.72rem' }}>
                        Obrigatório
                      </span>
                    )}
                    <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                      Origem: {req.origem_dado}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => abrirEditarRequisito(req)}
                      title="Editar requisito"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-texto-secundario)' }}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequisitoParaExcluir(req)}
                      title="Excluir requisito"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-erro)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {req.descricao && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)' }}>
                    {req.descricao}
                  </p>
                )}

                {/* Evidência Textual do Edital */}
                {req.evidencia_texto && (
                  <div
                    style={{
                      backgroundColor: '#f1f5f9',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--raio-sm)',
                      borderLeft: '4px solid var(--cor-secundaria)',
                      fontSize: '0.85rem',
                      color: '#1e293b',
                      fontStyle: 'italic',
                    }}
                  >
                    <span>« {req.evidencia_texto} »</span>
                    {req.pagina_origem && (
                      <span style={{ display: 'block', marginTop: '0.25rem', fontWeight: 600, fontStyle: 'normal', color: 'var(--cor-texto-mutado)', fontSize: '0.78rem' }}>
                        Página identificada: {req.pagina_origem}
                      </span>
                    )}
                  </div>
                )}

                {/* Observação / Confronto com o Perfil */}
                {req.observacao && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--cor-secundaria)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Info size={14} />
                    <span>Conferência: {req.observacao}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Cartao>

      {/* Modal Adicionar / Editar Requisito */}
      {modalRequisitoAberto && (
        <div className="sobreposicao-modal" role="dialog" aria-modal="true">
          <div className="conteudo-modal" style={{ maxWidth: '600px' }}>
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
                  placeholder="Ex: Renda per capita máxima de 1,5 salário mínimo"
                />

                <CampoTexto
                  id="req_descricao"
                  rotulo="Explicação / Descrição Simplificada"
                  multilinha
                  rows={2}
                  valor={formRequisito.descricao}
                  aoMudar={(e) => setFormRequisito({ ...formRequisito, descricao: e.target.value })}
                  placeholder="Explique com clareza o que a instituição exige..."
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
                  dica="Transcreva o trecho do documento que fundamenta esta regra."
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
                    id="req_obs"
                    rotulo="Observação / Justificativa"
                    valor={formRequisito.observacao}
                    aoMudar={(e) => setFormRequisito({ ...formRequisito, observacao: e.target.value })}
                    placeholder="Ex: Estudante precisa emitir certidão de matrícula"
                  />
                </div>
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


