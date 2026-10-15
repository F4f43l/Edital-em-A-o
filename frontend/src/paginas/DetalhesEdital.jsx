import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  History,
} from 'lucide-react';
import { api } from '../servicos/api.js';
import { Cartao } from '../componentes/Cartao.jsx';
import { Botao } from '../componentes/Botao.jsx';
import { CrachaStatus } from '../componentes/CrachaStatus.jsx';
import { CrachaPrazo } from '../componentes/CrachaPrazo.jsx';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao.jsx';
import { EstadoCarregamento } from '../componentes/EstadoCarregamento.jsx';
import { MensagemErro } from '../componentes/MensagemErro.jsx';
import { PainelCustosLogistica } from '../componentes/PainelCustosLogistica.jsx';
import { formatarDataPtBr } from '../utilitarios/formatadores.js';

export function DetalhesEdital() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [edital, setEdital] = useState(null);
  const [analises, setAnalises] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Modal para iniciar análise
  const [modalAnaliseAberto, setModalAnaliseAberto] = useState(false);
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState('');
  const [analisando, setAnalisando] = useState(false);

  // Modal de exclusão do edital
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Modal de exclusão de análise específica
  const [analiseParaExcluir, setAnaliseParaExcluir] = useState(null);
  const [excluindoAnalise, setExcluindoAnalise] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosEdital, listaAnalises, listaPerfis] = await Promise.all([
        api.buscarEditalPorId(id),
        api.listarAnalises({ edital_id: id }),
        api.listarPerfis(),
      ]);

      setEdital(dadosEdital);
      setAnalises(listaAnalises);
      setPerfis(listaPerfis);
      if (listaPerfis.length > 0 && !perfilSelecionadoId) {
        setPerfilSelecionadoId(String(listaPerfis[0].id));
      }
    } catch (err) {
      setErro(err.message || 'Falha ao carregar informações do edital.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  const dispararAnalise = async () => {
    setAnalisando(true);
    try {
      const novaAnalise = await api.criarAnalise({
        edital_id: parseInt(id, 10),
        perfil_id: perfilSelecionadoId ? parseInt(perfilSelecionadoId, 10) : null,
      });

      setModalAnaliseAberto(false);
      navegar(`/analises/${novaAnalise.id}`);
    } catch (err) {
      alert(`Falha ao processar análise do edital: ${err.message}`);
      setAnalisando(false);
    }
  };

  const confirmarExclusaoEdital = async () => {
    setExcluindo(true);
    try {
      await api.excluirEdital(id);
      navegar('/editais');
    } catch (err) {
      alert(`Erro ao excluir edital: ${err.message}`);
      setExcluindo(false);
    }
  };

  const confirmarExclusaoAnalise = async () => {
    if (!analiseParaExcluir) return;
    setExcluindoAnalise(true);
    try {
      await api.excluirAnalise(analiseParaExcluir.id);
      setAnaliseParaExcluir(null);
      await carregarDados();
    } catch (err) {
      alert(`Erro ao remover análise: ${err.message}`);
    } finally {
      setExcluindoAnalise(false);
    }
  };

  if (carregando) {
    return <EstadoCarregamento mensagem="Carregando detalhes do edital..." />;
  }

  if (erro || !edital) {
    return <MensagemErro mensagem={erro || 'Edital não encontrado.'} aoTentarNovamente={carregarDados} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Botão Voltar */}
      <div>
        <Link to="/editais" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--cor-texto-secundario)' }}>
          <ArrowLeft size={16} />
          <span>Voltar para o catálogo de editais</span>
        </Link>
      </div>

      {/* Cartão de Cabeçalho do Edital */}
      <Cartao>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <CrachaStatus tipo="edital_status" valor={edital.status} />
              <span className="cracha cracha-neutro">{edital.categoria}</span>
              <CrachaPrazo dataIso={edital.prazo_inscricao} />
            </div>

            <h1 style={{ fontSize: '1.8rem', color: 'var(--cor-primaria)', marginBottom: '0.35rem' }}>
              {edital.titulo}
            </h1>

            {edital.instituicao && (
              <p style={{ fontSize: '1rem', color: 'var(--cor-texto-secundario)', fontWeight: 500 }}>
                {edital.instituicao}
              </p>
            )}
          </div>

          {/* Botões de Ação Principais */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Botao
              variante="primario"
              icone={<Sparkles size={18} />}
              onClick={() => setModalAnaliseAberto(true)}
            >
              Analisar com Perfil
            </Botao>

            <Link to={`/editais/${edital.id}/editar`}>
              <Botao variante="secundario" icone={<Edit size={16} />}>
                Editar
              </Botao>
            </Link>

            <Botao
              variante="secundario"
              icone={<Trash2 size={16} style={{ color: 'var(--cor-erro)' }} />}
              onClick={() => setModalExcluirAberto(true)}
            >
              Excluir
            </Botao>
          </div>
        </div>

        {/* Metadados e Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem 0', borderTop: '1px solid var(--cor-borda)', borderBottom: '1px solid var(--cor-borda)', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: 'var(--cor-texto-mutado)', display: 'block' }}>Inscrições até:</span>
            <strong>{formatarDataPtBr(edital.prazo_inscricao)}</strong>
          </div>

          {edital.prazo_recurso && (
            <div>
              <span style={{ color: 'var(--cor-texto-mutado)', display: 'block' }}>Prazo para Recursos:</span>
              <strong style={{ color: 'var(--cor-atencao)' }}>{formatarDataPtBr(edital.prazo_recurso)}</strong>
            </div>
          )}

          {edital.data_resultado && (
            <div>
              <span style={{ color: 'var(--cor-texto-mutado)', display: 'block' }}>Divulgação do Resultado:</span>
              <strong style={{ color: 'var(--cor-info)' }}>{formatarDataPtBr(edital.data_resultado)}</strong>
            </div>
          )}

          <div>
            <span style={{ color: 'var(--cor-texto-mutado)', display: 'block' }}>Documento Anexo:</span>
            {edital.nome_arquivo ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--cor-secundaria)' }}>
                <FileText size={15} />
                <strong>{edital.nome_arquivo}</strong>
              </span>
            ) : (
              <span style={{ color: 'var(--cor-texto-mutado)' }}>Nenhum PDF enviado</span>
            )}
          </div>

          {edital.url_origem && (
            <div>
              <span style={{ color: 'var(--cor-texto-mutado)', display: 'block' }}>Link Oficial:</span>
              <a
                href={edital.url_origem}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
              >
                <span>Acessar página oficial</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>

        {/* Resumo */}
        {edital.resumo && (
          <div style={{ marginTop: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--cor-primaria)', marginBottom: '0.4rem' }}>
              Resumo do Edital
            </h4>
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {edital.resumo}
            </p>
          </div>
        )}
      </Cartao>

      {/* Custos e Necessidades Logísticas */}
      <Cartao
        titulo="Custos e Logística do Edital"
        subtitulo="Identificação de taxa de inscrição, isenção, cidade/local da prova e avaliação de deslocamento"
      >
        <PainelCustosLogistica custosLogistica={edital.custos_logistica} />
      </Cartao>

      {/* Histórico de Análises Realizadas */}
      <Cartao
        titulo="Análises deste Edital"
        subtitulo="Relatórios de requisitos e compatibilidade gerados"
        acoes={
          <Botao
            variante="primario"
            tamanho="sm"
            icone={<Sparkles size={15} />}
            onClick={() => setModalAnaliseAberto(true)}
          >
            Nova Análise
          </Botao>
        }
      >
        {analises.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--cor-texto-mutado)' }}>
            <History size={32} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
            <p style={{ fontSize: '0.92rem' }}>
              Nenhuma análise foi gerada ainda para este edital. Clique em "Analisar com Perfil" para extrair requisitos e gerar seu plano de ação!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {analises.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--cor-borda)',
                  borderRadius: 'var(--raio-md)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <CrachaStatus tipo="resultado_orientativo" valor={item.resultado_orientativo} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)' }}>
                      {formatarDataPtBr(item.created_at)}
                    </span>
                    <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                      {item.provedor_ia === 'gemini' ? 'IA Gemini' : 'Regras Locais'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--cor-texto-secundario)' }}>
                    Perfil avaliado:{' '}
                    <strong>{item.perfil_nome || 'Nenhum perfil específico (Geral)'}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/analises/${item.id}`}>
                    <Botao variante="primario" tamanho="sm">
                      Ver Relatório Completo
                    </Botao>
                  </Link>
                  <Botao
                    variante="secundario"
                    tamanho="sm"
                    onClick={() => setAnaliseParaExcluir(item)}
                    icone={<Trash2 size={14} style={{ color: 'var(--cor-erro)' }} />}
                  >
                    Excluir
                  </Botao>
                </div>
              </div>
            ))}
          </div>
        )}
      </Cartao>

      {/* Conteúdo Textual Extraído do Documento */}
      {edital.texto_extraido && (
        <Cartao
          titulo="Texto Extraído do Documento"
          subtitulo="Camada de texto utilizada pelo analisador para identificação de critérios e evidências"
        >
          <div
            style={{
              maxHeight: '320px',
              overflowY: 'auto',
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: 'var(--raio-md)',
              border: '1px solid var(--cor-borda)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              color: '#334155',
            }}
          >
            {edital.texto_extraido}
          </div>
        </Cartao>
      )}

      {/* Modal para Iniciar Nova Análise */}
      {modalAnaliseAberto && (
        <div className="sobreposicao-modal" role="dialog" aria-modal="true">
          <div className="conteudo-modal">
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', marginBottom: '0.5rem' }}>
              Iniciar Análise do Edital
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)', marginBottom: '1.25rem' }}>
              Selecione o perfil do candidato para comparar os critérios de elegibilidade e gerar as tarefas do plano de ação:
            </p>

            <div className="grupo-campo">
              <label htmlFor="select_perfil" className="rotulo-campo">
                Perfil para Comparação:
              </label>
              <select
                id="select_perfil"
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

            <div className="alerta alerta-info" style={{ fontSize: '0.85rem', margin: '1rem 0' }}>
              <div>
                <strong>Aviso de Orientação:</strong> A análise realiza a leitura estruturada do texto e sugere a compatibilidade.
                O resultado é orientativo e não substitui a conferência formal do edital nem garante concessão de benefício.
              </div>
            </div>

            <div className="acoes-modal">
              <Botao
                variante="secundario"
                onClick={() => setModalAnaliseAberto(false)}
                disabled={analisando}
              >
                Cancelar
              </Botao>
              <Botao
                variante="primario"
                onClick={dispararAnalise}
                carregando={analisando}
                icone={<Sparkles size={16} />}
              >
                Iniciar Análise
              </Botao>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão do Edital */}
      <ModalConfirmacao
        aberto={modalExcluirAberto}
        titulo="Excluir Edital"
        nomeItem={edital.titulo}
        mensagem="Deseja realmente excluir este edital?"
        avisoDependencias="Todas as análises, critérios identificados e tarefas do checklist vinculadas a este edital serão excluídas permanentemente."
        aoConfirmar={confirmarExclusaoEdital}
        aoCancelar={() => setModalExcluirAberto(false)}
        carregando={excluindo}
      />

      {/* Modal de Exclusão de Análise */}
      <ModalConfirmacao
        aberto={Boolean(analiseParaExcluir)}
        titulo="Excluir Análise"
        nomeItem={`Análise #${analiseParaExcluir?.id} (${analiseParaExcluir?.perfil_nome || 'Geral'})`}
        mensagem="Deseja realmente excluir este relatório de análise?"
        avisoDependencias="Os requisitos e as tarefas geradas por esta análise serão removidos do seu checklist."
        aoConfirmar={confirmarExclusaoAnalise}
        aoCancelar={() => setAnaliseParaExcluir(null)}
        carregando={excluindoAnalise}
      />
    </div>
  );
}


