import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckSquare,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { api } from '../servicos/api.js';
import { Cartao } from '../componentes/Cartao.jsx';
import { Botao } from '../componentes/Botao.jsx';
import { ItemChecklist } from '../componentes/ItemChecklist.jsx';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao.jsx';
import { CampoTexto } from '../componentes/CampoTexto.jsx';
import { CampoSelecao } from '../componentes/CampoSelecao.jsx';
import { EstadoCarregamento } from '../componentes/EstadoCarregamento.jsx';
import { EstadoVazio } from '../componentes/EstadoVazio.jsx';
import { MensagemErro } from '../componentes/MensagemErro.jsx';
import { GuiaChecklistDocumentos } from '../componentes/GuiaChecklistDocumentos.jsx';

export function PlanoAcao() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroAnaliseUrl = searchParams.get('analise_id') || '';

  const [tarefas, setTarefas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [analises, setAnalises] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Aba selecionada: 'tarefas' ou 'documentos'
  const [abaPlano, setAbaPlano] = useState('tarefas');

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroAnaliseId, setFiltroAnaliseId] = useState(filtroAnaliseUrl);

  // Modal para Criar/Editar Tarefa
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);
  const [salvandoTarefa, setSalvandoTarefa] = useState(false);

  const [formTarefa, setFormTarefa] = useState({
    analise_id: '',
    titulo: '',
    descricao: '',
    data_limite: '',
    prioridade: 'media',
    status: 'pendente',
  });

  // Modal de Exclusão
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
  const [excluindoTarefa, setExcluindoTarefa] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [listaTarefas, listaAnalises, listaDocumentos] = await Promise.all([
        api.listarTarefas({
          status: filtroStatus || undefined,
          prioridade: filtroPrioridade || undefined,
          analise_id: filtroAnaliseId || undefined,
        }),
        api.listarAnalises(),
        api.listarDocumentos({
          analise_id: filtroAnaliseId || undefined,
        }),
      ]);

      setTarefas(listaTarefas);
      setAnalises(listaAnalises);
      setDocumentos(listaDocumentos);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar dados do plano de ação.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtroStatus, filtroPrioridade, filtroAnaliseId]);

  const alternarStatusTarefa = async (tarefa) => {
    try {
      const novoStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
      setTarefas((anteriores) =>
        anteriores.map((t) => (t.id === tarefa.id ? { ...t, status: novoStatus } : t))
      );

      await api.alternarConclusaoTarefa(tarefa.id);
    } catch (err) {
      alert(`Falha ao atualizar tarefa: ${err.message}`);
      await carregarDados();
    }
  };

  const alterarStatusRapido = async (tarefa, novoStatus) => {
    const statusAnterior = tarefa.status;
    if (statusAnterior === novoStatus) return;

    setTarefas((anteriores) =>
      anteriores.map((t) => (t.id === tarefa.id ? { ...t, status: novoStatus } : t))
    );

    try {
      await api.alterarStatusTarefa(tarefa.id, novoStatus);
    } catch (err) {
      alert(`Falha ao salvar status no banco de dados: ${err.message}`);
      setTarefas((anteriores) =>
        anteriores.map((t) => (t.id === tarefa.id ? { ...t, status: statusAnterior } : t))
      );
    }
  };

  const abrirNovaTarefa = () => {
    setTarefaEmEdicao(null);
    setFormTarefa({
      analise_id: filtroAnaliseId || (analises[0]?.id ? String(analises[0].id) : ''),
      titulo: '',
      descricao: '',
      data_limite: '',
      prioridade: 'media',
      status: 'pendente',
    });
    setModalTarefaAberto(true);
  };

  const abrirEditarTarefa = (tarefa) => {
    setTarefaEmEdicao(tarefa);
    setFormTarefa({
      analise_id: String(tarefa.analise_id),
      titulo: tarefa.titulo || '',
      descricao: tarefa.descricao || '',
      data_limite: tarefa.data_limite ? String(tarefa.data_limite).slice(0, 10) : '',
      prioridade: tarefa.prioridade || 'media',
      status: tarefa.status || 'pendente',
    });
    setModalTarefaAberto(true);
  };

  const salvarTarefa = async (e) => {
    e.preventDefault();
    setSalvandoTarefa(true);

    if (!formTarefa.titulo.trim()) {
      alert('O título da tarefa é obrigatório.');
      setSalvandoTarefa(false);
      return;
    }

    if (!formTarefa.analise_id) {
      alert('Selecione uma análise associada a esta tarefa.');
      setSalvandoTarefa(false);
      return;
    }

    try {
      const payload = {
        analise_id: parseInt(formTarefa.analise_id, 10),
        titulo: formTarefa.titulo.trim(),
        descricao: formTarefa.descricao.trim() || null,
        data_limite: formTarefa.data_limite || null,
        prioridade: formTarefa.prioridade,
        status: formTarefa.status,
      };

      if (tarefaEmEdicao) {
        await api.atualizarTarefa(tarefaEmEdicao.id, payload);
      } else {
        await api.criarTarefa(payload);
      }

      setModalTarefaAberto(false);
      await carregarDados();
    } catch (err) {
      alert(`Erro ao salvar tarefa: ${err.message}`);
    } finally {
      setSalvandoTarefa(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!tarefaParaExcluir) return;
    setExcluindoTarefa(true);
    try {
      await api.excluirTarefa(tarefaParaExcluir.id);
      setTarefaParaExcluir(null);
      await carregarDados();
    } catch (err) {
      alert(`Erro ao excluir tarefa: ${err.message}`);
    } finally {
      setExcluindoTarefa(false);
    }
  };

  // Cálculo de progresso de tarefas
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter((t) => t.status === 'concluida').length;
  const porcentagemConcluida = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="kicker-editorial">GESTÃO OPERACIONAL DE METAS</div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700, margin: '0.2rem 0' }}>
            Plano de Ação & Checklist Operacional
          </h1>
          <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem' }}>
            Acompanhe prazos, documentos e etapas práticas sem perder nenhuma exigência do edital.
          </p>
        </div>
        {abaPlano === 'tarefas' && (
          <Botao variante="primario" icone={<PlusCircle size={18} />} onClick={abrirNovaTarefa}>
            Nova Tarefa
          </Botao>
        )}
      </div>

      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={carregarDados} />}

      {/* Navegação entre Tarefas e Documentos */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--cor-borda-forte)',
          paddingBottom: '0',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setAbaPlano('tarefas')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            border: '1px solid var(--cor-borda-forte)',
            borderBottom: abaPlano === 'tarefas' ? '2px solid var(--cor-secundaria)' : '1px solid var(--cor-borda-forte)',
            marginBottom: '-2px',
            backgroundColor: abaPlano === 'tarefas' ? 'var(--cor-secundaria)' : 'var(--cor-superficie)',
            color: 'var(--cor-texto-principal)',
            fontWeight: 700,
            fontFamily: 'var(--fonte-titulos)',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            borderRadius: 'var(--raio-sm) var(--raio-sm) 0 0',
            transition: 'all 0.15s ease',
          }}
        >
          <CheckSquare size={18} />
          <span>Tarefas & Cronograma ({totalTarefas})</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaPlano('documentos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            border: '1px solid var(--cor-borda-forte)',
            borderBottom: abaPlano === 'documentos' ? '2px solid var(--cor-secundaria)' : '1px solid var(--cor-borda-forte)',
            marginBottom: '-2px',
            backgroundColor: abaPlano === 'documentos' ? 'var(--cor-secundaria)' : 'var(--cor-superficie)',
            color: 'var(--cor-texto-principal)',
            fontWeight: 700,
            fontFamily: 'var(--fonte-titulos)',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            borderRadius: 'var(--raio-sm) var(--raio-sm) 0 0',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={18} />
          <span>Checklist de Documentos Exigidos ({documentos.length})</span>
        </button>
      </div>

      {/* Filtro por Análise/Edital Global */}
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label htmlFor="filtro_analise_select" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filtrar por Edital / Análise:
          </label>
          <select
            id="filtro_analise_select"
            value={filtroAnaliseId}
            onChange={(e) => {
              setFiltroAnaliseId(e.target.value);
              setSearchParams(e.target.value ? { analise_id: e.target.value } : {});
            }}
            className="entrada-selecao"
            style={{ flex: 1, minWidth: '240px' }}
          >
            <option value="">Todas as análises e editais</option>
            {analises.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} - {a.edital_titulo} ({a.perfil_nome || 'Geral'})
              </option>
            ))}
          </select>
        </div>
      </Cartao>

      {/* ABA 1: TAREFAS */}
      {abaPlano === 'tarefas' && (
        <>
          {/* Cartão de Progresso Geral das Tarefas */}
          <Cartao>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}>
                  Progresso das Atividades: {tarefasConcluidas} de {totalTarefas} concluídas
                </span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-mono)' }}>
                {porcentagemConcluida}%
              </span>
            </div>

            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--cor-borda-suave)', borderRadius: 'var(--raio-xs)', border: '1px solid var(--cor-borda-forte)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${porcentagemConcluida}%`,
                  height: '100%',
                  backgroundColor: 'var(--cor-primaria)',
                  transition: 'width 0.4s ease-in-out',
                }}
              />
            </div>
          </Cartao>

          {/* Filtros de Tarefas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="entrada-selecao"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="bloqueada">Bloqueada</option>
              <option value="nao_se_aplica">Não se aplica</option>
            </select>

            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="entrada-selecao"
            >
              <option value="">Todas as prioridades</option>
              <option value="alta">Alta prioridade</option>
              <option value="media">Média prioridade</option>
              <option value="baixa">Baixa prioridade</option>
            </select>
          </div>

          {/* Lista de Tarefas */}
          {carregando ? (
            <EstadoCarregamento mensagem="Carregando tarefas do plano de ação..." />
          ) : tarefas.length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma tarefa encontrada"
              mensagem="Não há atividades registradas para os filtros aplicados."
              textoAcao="Criar Tarefa Manual"
              aoClicarAcao={abrirNovaTarefa}
            />
          ) : (
            <div>
              {tarefas.map((tarefa) => (
                <ItemChecklist
                  key={tarefa.id}
                  tarefa={tarefa}
                  aoAlternar={alternarStatusTarefa}
                  aoMudarStatus={alterarStatusRapido}
                  aoEditar={abrirEditarTarefa}
                  aoExcluir={() => setTarefaParaExcluir(tarefa)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ABA 2: CHECKLIST DE DOCUMENTOS EXIGIDOS */}
      {abaPlano === 'documentos' && (
        <GuiaChecklistDocumentos
          documentos={documentos}
          requisitos={[]}
          analiseId={filtroAnaliseId ? parseInt(filtroAnaliseId, 10) : (analises[0]?.id || 1)}
          aoAtualizarLista={carregarDados}
        />
      )}

      {/* Modal Criar/Editar Tarefa */}
      {modalTarefaAberto && (
        <div className="sobreposicao-modal" role="dialog" aria-modal="true">
          <div className="conteudo-modal">
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', marginBottom: '1rem' }}>
              {tarefaEmEdicao ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>

            <form onSubmit={salvarTarefa}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <CampoSelecao
                  id="tarefa_analise_id"
                  rotulo="Edital / Análise de Origem"
                  obrigatorio
                  valor={formTarefa.analise_id}
                  aoMudar={(e) => setFormTarefa({ ...formTarefa, analise_id: e.target.value })}
                  placeholder="Selecione um edital/análise..."
                  opcoes={analises.map((a) => ({
                    valor: a.id,
                    rotulo: `#${a.id} - ${a.edital_titulo} (${a.perfil_nome || 'Geral'})`,
                  }))}
                />

                <CampoTexto
                  id="tarefa_titulo"
                  rotulo="Título da Atividade"
                  obrigatorio
                  valor={formTarefa.titulo}
                  aoMudar={(e) => setFormTarefa({ ...formTarefa, titulo: e.target.value })}
                  placeholder="Ex: Emitir certidão de matrícula com QR Code"
                />

                <CampoTexto
                  id="tarefa_descricao"
                  rotulo="Descrição / Instruções Práticas"
                  multilinha
                  rows={3}
                  valor={formTarefa.descricao}
                  aoMudar={(e) => setFormTarefa({ ...formTarefa, descricao: e.target.value })}
                  placeholder="Descreva o passo a passo necessário para concluir esta tarefa..."
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <CampoTexto
                    id="tarefa_data_limite"
                    type="date"
                    rotulo="Data Limite"
                    valor={formTarefa.data_limite}
                    aoMudar={(e) => setFormTarefa({ ...formTarefa, data_limite: e.target.value })}
                  />

                  <CampoSelecao
                    id="tarefa_prioridade"
                    rotulo="Prioridade"
                    valor={formTarefa.prioridade}
                    aoMudar={(e) => setFormTarefa({ ...formTarefa, prioridade: e.target.value })}
                    placeholder={null}
                    opcoes={[
                      { valor: 'baixa', rotulo: 'Baixa prioridade' },
                      { valor: 'media', rotulo: 'Média prioridade' },
                      { valor: 'alta', rotulo: 'Alta prioridade' },
                    ]}
                  />

                  <CampoSelecao
                    id="tarefa_status"
                    rotulo="Status Inicial"
                    valor={formTarefa.status}
                    aoMudar={(e) => setFormTarefa({ ...formTarefa, status: e.target.value })}
                    placeholder={null}
                    opcoes={[
                      { valor: 'pendente', rotulo: 'Pendente' },
                      { valor: 'em_andamento', rotulo: 'Em andamento' },
                      { valor: 'concluida', rotulo: 'Concluída' },
                      { valor: 'bloqueada', rotulo: 'Bloqueada' },
                      { valor: 'nao_se_aplica', rotulo: 'Não se aplica' },
                    ]}
                  />
                </div>
              </div>

              <div className="acoes-modal" style={{ marginTop: '1.5rem' }}>
                <Botao variante="secundario" onClick={() => setModalTarefaAberto(false)} disabled={salvandoTarefa}>
                  Cancelar
                </Botao>
                <Botao tipo="submit" variante="primario" carregando={salvandoTarefa}>
                  Salvar Tarefa
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      <ModalConfirmacao
        aberto={Boolean(tarefaParaExcluir)}
        titulo="Excluir Tarefa"
        nomeItem={tarefaParaExcluir?.titulo}
        mensagem="Tem certeza que deseja remover esta atividade do plano de ação?"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setTarefaParaExcluir(null)}
        carregando={excluindoTarefa}
      />
    </div>
  );
}
