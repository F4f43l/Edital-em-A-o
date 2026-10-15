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
      {/* Banner Principal de Boas-Vindas & ODS 10 */}
      <div
        className="cartao"
        style={{
          background: 'linear-gradient(135deg, var(--cor-primaria) 0%, #224364 100%)',
          color: '#ffffff',
          padding: '2.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(40, 122, 114, 0.4)',
              border: '1px solid rgba(40, 122, 114, 0.6)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--raio-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#a7f3d0',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} />
            <span>ODS 10 — Redução das Desigualdades</span>
          </div>

          <h1 style={{ color: '#ffffff', fontSize: '2.1rem', lineHeight: 1.2, marginBottom: '0.85rem' }}>
            Do edital à oportunidade, sem se perder no caminho.
          </h1>

          <p style={{ color: '#d1dfed', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Simplifique a leitura de editais de bolsas, auxílios e cursos. Identifique critérios de elegibilidade,
            compare com seu perfil e transforme regras burocráticas em um plano de ação prático.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <Link to="/editais/novo">
              <Botao variante="primario" tamanho="lg" icone={<PlusCircle size={18} />}>
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

      {/* Indicadores / Cards Métricos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--cor-texto-secundario)', fontWeight: 500 }}>
              Editais Cadastrados
            </span>
            <div style={{ color: 'var(--cor-secundaria)' }}>
              <FileText size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cor-primaria)' }}>
            {contadores?.totalEditais || 0}
          </div>
          <Link to="/editais" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
            <span>Gerenciar editais</span>
            <ArrowRight size={13} />
          </Link>
        </Cartao>

        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--cor-texto-secundario)', fontWeight: 500 }}>
              Análises Realizadas
            </span>
            <div style={{ color: 'var(--cor-info)' }}>
              <Sparkles size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cor-primaria)' }}>
            {contadores?.totalAnalises || 0}
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)', display: 'block', marginTop: '0.5rem' }}>
            Com critérios e evidências
          </span>
        </Cartao>

        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--cor-texto-secundario)', fontWeight: 500 }}>
              Tarefas Pendentes
            </span>
            <div style={{ color: 'var(--cor-atencao)' }}>
              <CheckSquare size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cor-primaria)' }}>
            {contadores?.tarefasPendentes || 0}
          </div>
          <Link to="/plano-de-acao" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
            <span>Acompanhar checklist</span>
            <ArrowRight size={13} />
          </Link>
        </Cartao>

        <Cartao>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--cor-texto-secundario)', fontWeight: 500 }}>
              Prazos nos Próximos 30 Dias
            </span>
            <div style={{ color: 'var(--cor-erro)' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cor-primaria)' }}>
            {contadores?.prazosProximos || 0}
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)', display: 'block', marginTop: '0.5rem' }}>
            Inscrições e etapas ativas
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
                    padding: '0.85rem',
                    border: '1px solid var(--cor-borda)',
                    borderRadius: 'var(--raio-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Link
                      to={`/editais/${edital.id}`}
                      style={{ fontWeight: 600, color: 'var(--cor-primaria)', fontSize: '0.95rem' }}
                    >
                      {edital.titulo}
                    </Link>
                    <CrachaStatus tipo="edital_status" valor={edital.status} />
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--cor-texto-secundario)' }}>
                    {edital.instituicao || edital.categoria}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <CrachaPrazo dataIso={edital.prazo_inscricao} />
                    <Link to={`/editais/${edital.id}`} style={{ fontSize: '0.82rem', fontWeight: 600 }}>
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
                    padding: '0.85rem',
                    border: '1px solid var(--cor-borda)',
                    borderRadius: 'var(--raio-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--cor-primaria)' }}>
                      {tarefa.titulo}
                    </span>
                    <CrachaStatus tipo="prioridade" valor={tarefa.prioridade} />
                  </div>

                  {tarefa.edital_titulo && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--cor-texto-mutado)' }}>
                      {tarefa.edital_titulo}
                    </span>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <CrachaPrazo dataIso={tarefa.data_limite} />
                    <select
                      value={tarefa.status}
                      onChange={(e) => alterarStatusRapido(tarefa, e.target.value)}
                      aria-label="Status rápido da tarefa"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--raio-full)',
                        border: '1px solid var(--cor-borda)',
                        backgroundColor: '#f3f4f6',
                        color: 'var(--cor-texto-secundario)',
                        cursor: 'pointer',
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


