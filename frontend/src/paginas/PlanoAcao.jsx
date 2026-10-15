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

export function PlanoAcao() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroAnaliseUrl = searchParams.get('analise_id') || '';

  const [tarefas, setTarefas] = useState([]);
  const [analises, setAnalises] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

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

  const carregarTarefas = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [listaTarefas, listaAnalises] = await Promise.all([
        api.listarTarefas({
          status: filtroStatus || undefined,
          prioridade: filtroPrioridade || undefined,
          analise_id: filtroAnaliseId || undefined,
        }),
        api.listarAnalises(),
      ]);

      setTarefas(listaTarefas);
      setAnalises(listaAnalises);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar tarefas do plano de ação.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, [filtroStatus, filtroPrioridade, filtroAnaliseId]);

  const alternarStatusTarefa = async (tarefa) => {
    try {
      // Atualização otimista no estado local
      const novoStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
      setTarefas((anteriores) =>
        anteriores.map((t) => (t.id === tarefa.id ? { ...t, status: novoStatus } : t))
      );

      await api.alternarConclusaoTarefa(tarefa.id);
    } catch (err) {
      alert(`Falha ao atualizar tarefa: ${err.message}`);
      await carregarTarefas();
    }
  };

  const alterarStatusRapido = async (tarefa, novoStatus) => {
    const statusAnterior = tarefa.status;
    if (statusAnterior === novoStatus) return;

    // Atualização otimista imediata no estado local
    setTarefas((anteriores) =>
      anteriores.map((t) => (t.id === tarefa.id ? { ...t, status: novoStatus } : t))
    );

    try {
      await api.alterarStatusTarefa(tarefa.id, novoStatus);
    } catch (err) {
      alert(`Falha ao salvar status no banco de dados: ${err.message}`);
      // Reverte para o status anterior em caso de falha de conexão/API
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
      await carregarTarefas();
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
      await carregarTarefas();
    } catch (err) {
      alert(`Erro ao excluir tarefa: ${err.message}`);
    } finally {
      setExcluindoTarefa(false);
    }
  };

  // Cálculo de progresso
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter((t) => t.status === 'concluida').length;
  const porcentagemConcluida = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--cor-primaria)' }}>Plano de Ação & Checklist</h1>
          <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem' }}>
            Acompanhe prazos, documentos e etapas práticas para não perder nenhuma oportunidade.
          </p>
        </div>
        <Botao variante="primario" icone={<PlusCircle size={18} />} onClick={abrirNovaTarefa}>
          Nova Tarefa
        </Botao>
      </div>

      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={carregarTarefas} />}

      {/* Cartão de Progresso Geral */}
      <Cartao>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--cor-primaria)' }}>
              Progresso do Checklist: {tarefasConcluidas} de {totalTarefas} tarefas concluídas
            </span>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cor-secundaria)' }}>
            {porcentagemConcluida}%
          </span>
        </div>

        {/* Barra de Progresso Visual */}
        <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: 'var(--raio-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${porcentagemConcluida}%`,
              height: '100%',
              backgroundColor: 'var(--cor-secundaria)',
              borderRadius: 'var(--raio-full)',
              transition: 'width 0.4s ease-in-out',
            }}
          />
        </div>
      </Cartao>

      {/* Filtros */}
      <Cartao>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Filtro por Análise/Edital */}
          <select
            value={filtroAnaliseId}
            onChange={(e) => {
              setFiltroAnaliseId(e.target.value);
              setSearchParams(e.target.value ? { analise_id: e.target.value } : {});
            }}
            className="entrada-selecao"
          >
            <option value="">Todas as análises e editais</option>
            {analises.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} - {a.edital_titulo} ({a.perfil_nome || 'Geral'})
              </option>
            ))}
          </select>

          {/* Filtro por Status */}
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

          {/* Filtro por Prioridade */}
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="entrada-selecao"
          >
            <option value="">Todas as prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </Cartao>

      {/* Listagem de Tarefas */}
      {carregando ? (
        <EstadoCarregamento mensagem="Carregando checklist de tarefas..." />
      ) : tarefas.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma tarefa encontrada"
          descricao="Não há tarefas cadastradas com os filtros selecionados. Crie uma tarefa ou analise um edital para gerar tarefas automáticas."
          textoAcao="Criar Nova Tarefa"
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
              aoExcluir={(t) => setTarefaParaExcluir(t)}
            />
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Tarefa */}
      {modalTarefaAberto && (
        <div className="sobreposicao-modal" role="dialog" aria-modal="true">
          <div className="conteudo-modal" style={{ maxWidth: '540px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', marginBottom: '1rem' }}>
              {tarefaEmEdicao ? 'Editar Tarefa' : 'Nova Tarefa do Checklist'}
            </h2>

            <form onSubmit={salvarTarefa}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <CampoSelecao
                  id="tarefa_analise"
                  rotulo="Análise / Edital Vinculado"
                  obrigatorio
                  valor={formTarefa.analise_id}
                  aoMudar={(e) => setFormTarefa({ ...formTarefa, analise_id: e.target.value })}
                  placeholder="Selecione o edital..."
                  opcoes={analises.map((a) => ({
                    valor: String(a.id),
                    rotulo: `${a.edital_titulo} (${a.perfil_nome || 'Geral'})`,
                  }))}
                />

                <CampoTexto
                  id="tarefa_titulo"
                  rotulo="Título da Tarefa"
                  obrigatorio
                  valor={formTarefa.titulo}
                  aoMudar={(e) => setFormTarefa({ ...formTarefa, titulo: e.target.value })}
                  placeholder="Ex: Emitir histórico escolar atualizado com autenticação"
                />

                <CampoTexto
                  id="tarefa_descricao"
                  rotulo="Instruções Detalhadas"
                  multilinha
                  rows={3}
                  valor={formTarefa.descricao}
                  aoMudar={(e) => setFormTarefa({ ...formTarefa, descricao: e.target.value })}
                  placeholder="Instruções e passos para concluir esta tarefa..."
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  <CampoTexto
                    id="tarefa_data"
                    type="date"
                    rotulo="Data Limite (Prazo)"
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
                      { valor: 'urgente', rotulo: 'Urgente' },
                      { valor: 'alta', rotulo: 'Alta' },
                      { valor: 'media', rotulo: 'Média' },
                      { valor: 'baixa', rotulo: 'Baixa' },
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

              <div className="acoes-modal" style={{ marginTop: '1.25rem' }}>
                <Botao
                  variante="secundario"
                  onClick={() => setModalTarefaAberto(false)}
                  disabled={salvandoTarefa}
                >
                  Cancelar
                </Botao>
                <Botao tipo="submit" variante="primario" carregando={salvandoTarefa}>
                  {tarefaEmEdicao ? 'Salvar Alterações' : 'Criar Tarefa'}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <ModalConfirmacao
        aberto={Boolean(tarefaParaExcluir)}
        titulo="Excluir Tarefa"
        nomeItem={tarefaParaExcluir?.titulo}
        mensagem="Deseja realmente remover esta tarefa do plano de ação?"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setTarefaParaExcluir(null)}
        carregando={excluindoTarefa}
      />
    </div>
  );
}


