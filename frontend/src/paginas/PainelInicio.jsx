import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../servicos/api.js';
import { Cartao } from '../componentes/Cartao.jsx';
import { Botao } from '../componentes/Botao.jsx';
import { CrachaPrazo } from '../componentes/CrachaPrazo.jsx';
import { CrachaStatus } from '../componentes/CrachaStatus.jsx';
import { EstadoCarregamento } from '../componentes/EstadoCarregamento.jsx';
import { MensagemErro } from '../componentes/MensagemErro.jsx';

export function PainelInicio() {
  const [contadores, setContadores] = useState(null);
  const [editaisRecentes, setEditaisRecentes] = useState([]);
  const [tarefasUrgentes, setTarefasUrgentes] = useState([]);
  const [saude, setSaude] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarDados = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosContadores, listaEditais, listaTarefas, statusSaude] = await Promise.all([
        api.obterContadoresPainel(),
        api.listarEditais(),
        api.listarTarefas({ status: 'pendente' }),
        api.verificarSaude().catch(() => null),
      ]);

      setContadores(dadosContadores);
      setEditaisRecentes(listaEditais.slice(0, 4));
      setTarefasUrgentes(listaTarefas.slice(0, 4));
      setSaude(statusSaude);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar indicadores do painel.');
    } finally {
      setCarregando(false);
    }
  };

  const alterarStatusRapido = async (tarefa, novoStatus) => {
    try {
      await api.alterarStatusTarefa(tarefa.id, novoStatus);
      const [dadosContadores, listaTarefas] = await Promise.all([
        api.obterContadoresPainel(),
        api.listarTarefas({ status: 'pendente' }),
      ]);
      setContadores(dadosContadores);
      setTarefasUrgentes(listaTarefas.slice(0, 4));
    } catch (err) {
      alert(`Falha ao alterar status da tarefa: ${err.message}`);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (carregando) {
    return <EstadoCarregamento mensagem="Carregando visão geral da plataforma..." />;
  }

  if (erro) {
    return <MensagemErro mensagem={erro} aoTentarNovamente={carregarDados} />;
  }

  const modoIa = saude?.inteligenciaArtificial?.modoAtivo === 'gemini_api';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner Principal de Boas-Vindas & ODS 10 — Construtivismo Editorial */}
      <div
        className="cartao"
        style={{
          backgroundColor: 'var(--cor-primaria)',
          color: 'var(--cor-fundo)',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid var(--cor-borda-forte)',
          boxShadow: 'var(--sombra-lg)',
          borderRadius: 'var(--raio-sm)',
        }}
      >
        {/* Detalhe geométrico de fundo editorial */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-40px',
            width: '260px',
            height: '260px',
            border: '2px solid rgba(214, 184, 90, 0.2)',
            transform: 'rotate(15deg)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '80px',
            top: '-20px',
            width: '90px',
            height: '90px',
            backgroundColor: 'rgba(214, 184, 90, 0.12)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--cor-secundaria)',
              border: '1.5px solid var(--cor-borda-forte)',
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--raio-sm)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--cor-texto-principal)',
              marginBottom: '1.25rem',
              boxShadow: '2px 2px 0px #171717',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={14} />
            <span>ODS 10 — Redução das Desigualdades</span>
          </div>

          <h1 style={{ color: 'var(--cor-fundo)', fontSize: '2.3rem', lineHeight: 1.15, marginBottom: '0.95rem', letterSpacing: '-0.02em' }}>
            Do edital à oportunidade, sem se perder no caminho.
          </h1>

          <p style={{ color: '#e4dcce', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.85rem' }}>
            Simplifique a leitura de editais de bolsas, auxílios e cursos. Identifique critérios de elegibilidade,
            compare com seu perfil e transforme regras burocráticas em um plano de ação prático.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <Link to="/editais/novo">
              <Botao variante="destaque" tamanho="lg" icone={<PlusCircle size={18} />}>
                Cadastrar ou Enviar Edital
              </Botao>
            </Link>
            <Link to="/plano-de-acao">
              <Botao variante="secundario" tamanho="lg" icone={<CheckSquare size={18} />}>
                Ver Meu Plano de Ação
              </Botao>
            </Link>
          </div>
        </div>
      </div>

      {/* Aviso de Modo do Sistema (Demonstração / IA) */}
      <div className={`alerta ${modoIa ? 'alerta-sucesso' : 'alerta-info'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {modoIa ? <ShieldCheck size={20} /> : <HelpCircle size={20} />}
          <div>
            <strong>
              {modoIa
                ? 'Conexão com Inteligência Artificial Ativa (Google Gemini)'
                : 'Modo Demonstração com Extração de Regras Locais'}
            </strong>
            <p style={{ fontSize: '0.86rem', marginTop: '0.2rem' }}>
              {modoIa
                ? 'As análises de editais estão utilizando o modelo configurado no arquivo backend/.env.'
                : 'A aplicação está funcionando com extração direta de texto e exemplos pré-carregados. Para habilitar IA avançada, adicione sua GEMINI_API_KEY no arquivo backend/.env.'}
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores / Cards Métricos — Construtivismo Editorial */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span className="kicker-editorial" style={{ marginBottom: 0 }}>
              Editais Cadastrados
            </span>
            <div style={{ color: 'var(--cor-primaria)' }}>
              <FileText size={22} />
            </div>
          </div>
          <div className="numero-destaque">
            {contadores?.totalEditais || 0}
          </div>
          <Link to="/editais" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', fontWeight: 600 }}>
            <span>Gerenciar catálogo</span>
            <ArrowRight size={14} />
          </Link>
        </Cartao>

        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span className="kicker-editorial" style={{ marginBottom: 0 }}>
              Análises Realizadas
            </span>
            <div style={{ color: 'var(--cor-secundaria-texto)' }}>
              <Sparkles size={22} />
            </div>
          </div>
          <div className="numero-destaque" style={{ color: 'var(--cor-texto-principal)' }}>
            {contadores?.totalAnalises || 0}
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)', display: 'block', marginTop: '0.65rem' }}>
            Com critérios e evidências
          </span>
        </Cartao>

        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span className="kicker-editorial" style={{ marginBottom: 0 }}>
              Tarefas Pendentes
            </span>
            <div style={{ color: 'var(--cor-atencao)' }}>
              <CheckSquare size={22} />
            </div>
          </div>
          <div className="numero-destaque" style={{ color: 'var(--cor-primaria)' }}>
            {contadores?.tarefasPendentes || 0}
          </div>
          <Link to="/plano-de-acao" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', fontWeight: 600 }}>
            <span>Acompanhar checklist</span>
            <ArrowRight size={14} />
          </Link>
        </Cartao>

        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span className="kicker-editorial" style={{ marginBottom: 0 }}>
              Prazos Próximos
            </span>
            <div style={{ color: 'var(--cor-erro)' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="numero-destaque" style={{ color: 'var(--cor-erro)' }}>
            {contadores?.prazosProximos || 0}
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)', display: 'block', marginTop: '0.65rem' }}>
            Inscrições e etapas em 30 dias
          </span>
        </Cartao>
      </div>

      {/* Seção Dividida: Editais Recentes & Próximas Tarefas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Editais Recentes */}
        <Cartao
          titulo="Editais Recentes"
          subtitulo="Últimos documentos cadastrados na plataforma"
          acoes={
            <Link to="/editais">
              <Botao variante="secundario" tamanho="sm">
                Ver todos
              </Botao>
            </Link>
          }
        >
          {editaisRecentes.length === 0 ? (
            <p style={{ color: 'var(--cor-texto-mutado)', fontSize: '0.9rem' }}>Nenhum edital cadastrado ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {editaisRecentes.map((edital) => (
                <div
                  key={edital.id}
                  style={{
                    padding: '0.95rem 1.1rem',
                    border: '1px solid var(--cor-borda-forte)',
                    borderRadius: 'var(--raio-sm)',
                    backgroundColor: 'var(--cor-superficie)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    boxShadow: '1.5px 1.5px 0px rgba(23, 23, 23, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Link
                      to={`/editais/${edital.id}`}
                      style={{ fontWeight: 700, color: 'var(--cor-primaria)', fontSize: '1rem', letterSpacing: '-0.01em' }}
                    >
                      {edital.titulo}
                    </Link>
                    <CrachaStatus tipo="edital_status" valor={edital.status} />
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)', fontWeight: 500 }}>
                    {edital.instituicao || edital.categoria}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', borderTop: '1px solid var(--cor-borda)', paddingTop: '0.5rem' }}>
                    <CrachaPrazo dataIso={edital.prazo_inscricao} />
                    <Link to={`/editais/${edital.id}`} style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Ver detalhes →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Cartao>

        {/* Tarefas Prioritárias */}
        <Cartao
          titulo="Próximas Tarefas"
          subtitulo="Itens pendentes no seu checklist de ação"
          acoes={
            <Link to="/plano-de-acao">
              <Botao variante="secundario" tamanho="sm">
                Abrir checklist
              </Botao>
            </Link>
          }
        >
          {tarefasUrgentes.length === 0 ? (
            <p style={{ color: 'var(--cor-texto-mutado)', fontSize: '0.9rem' }}>Todas as tarefas estão em dia!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {tarefasUrgentes.map((tarefa) => (
                <div
                  key={tarefa.id}
                  style={{
                    padding: '0.95rem 1.1rem',
                    border: '1px solid var(--cor-borda-forte)',
                    borderRadius: 'var(--raio-sm)',
                    backgroundColor: 'var(--cor-superficie)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    boxShadow: '1.5px 1.5px 0px rgba(23, 23, 23, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--cor-texto-principal)' }}>
                      {tarefa.titulo}
                    </span>
                    <CrachaStatus tipo="prioridade" valor={tarefa.prioridade} />
                  </div>

                  {tarefa.edital_titulo && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)', fontWeight: 500 }}>
                      {tarefa.edital_titulo}
                    </span>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.4rem', borderTop: '1px solid var(--cor-borda)', paddingTop: '0.5rem' }}>
                    <CrachaPrazo dataIso={tarefa.data_limite} />
                    <select
                      value={tarefa.status}
                      onChange={(e) => alterarStatusRapido(tarefa, e.target.value)}
                      aria-label="Status rápido da tarefa"
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--raio-sm)',
                        border: '1.5px solid var(--cor-borda-forte)',
                        backgroundColor: 'var(--cor-fundo)',
                        color: 'var(--cor-texto-principal)',
                        cursor: 'pointer',
                        boxShadow: '1px 1px 0px rgba(23, 23, 23, 0.4)',
                      }}
                    >
                      <option value="pendente">⏳ Pendente</option>
                      <option value="em_andamento">🔄 Em andamento</option>
                      <option value="concluida">✅ Concluída</option>
                      <option value="bloqueada">🚫 Bloqueada</option>
                      <option value="nao_se_aplica">⚪ Não se aplica</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Cartao>
      </div>
    </div>
  );
}


