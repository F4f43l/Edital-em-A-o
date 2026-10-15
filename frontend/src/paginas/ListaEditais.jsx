import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { api } from '../servicos/api.js';
import { Cartao } from '../componentes/Cartao.jsx';
import { Botao } from '../componentes/Botao.jsx';
import { CrachaStatus } from '../componentes/CrachaStatus.jsx';
import { CrachaPrazo } from '../componentes/CrachaPrazo.jsx';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao.jsx';
import { EstadoCarregamento } from '../componentes/EstadoCarregamento.jsx';
import { EstadoVazio } from '../componentes/EstadoVazio.jsx';
import { MensagemErro } from '../componentes/MensagemErro.jsx';

export function ListaEditais() {
  const [editais, setEditais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Estado para exclusão com modal
  const [editalParaExcluir, setEditalParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregarEditais = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await api.listarEditais({
        busca: busca.trim() || undefined,
        status: filtroStatus || undefined,
        categoria: filtroCategoria || undefined,
      });
      setEditais(dados);
    } catch (err) {
      setErro(err.message || 'Falha ao buscar editais.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      carregarEditais();
    }, 300);
    return () => clearTimeout(timeout);
  }, [busca, filtroStatus, filtroCategoria]);

  const confirmarExclusao = async () => {
    if (!editalParaExcluir) return;
    setExcluindo(true);
    try {
      await api.excluirEdital(editalParaExcluir.id);
      setEditalParaExcluir(null);
      await carregarEditais();
    } catch (err) {
      alert(`Falha ao excluir edital: ${err.message}`);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Cabeçalho da Página */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--cor-primaria)' }}>Catálogo de Editais</h1>
          <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem' }}>
            Consulte, cadastre e gerencie oportunidades de bolsas, auxílios e capacitações.
          </p>
        </div>
        <Link to="/editais/novo">
          <Botao variante="primario" icone={<PlusCircle size={18} />}>
            Cadastrar Edital
          </Botao>
        </Link>
      </div>

      {/* Barra de Filtros e Busca */}
      <Cartao>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Busca por texto */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cor-texto-mutado)' }} />
            <input
              type="text"
              placeholder="Buscar por título, instituição ou resumo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="entrada-texto"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Filtro por Categoria */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="entrada-selecao"
          >
            <option value="">Todas as categorias</option>
            <option value="Bolsa de Estudos">Bolsa de Estudos</option>
            <option value="Iniciação Científica">Iniciação Científica</option>
            <option value="Capacitação/Curso">Capacitação/Curso</option>
            <option value="Auxílio Permanência">Auxílio Permanência</option>
            <option value="Outro">Outro</option>
          </select>

          {/* Filtro por Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="entrada-selecao"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="rascunho">Rascunho</option>
            <option value="encerrado">Encerrado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>
      </Cartao>

      {/* Conteúdo Principal / Listagem */}
      {carregando ? (
        <EstadoCarregamento mensagem="Buscando editais cadastrados..." />
      ) : erro ? (
        <MensagemErro mensagem={erro} aoTentarNovamente={carregarEditais} />
      ) : editais.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum edital encontrado"
          descricao="Não encontramos nenhum edital para os filtros informados. Você pode cadastrar um novo edital ou limpar a pesquisa."
          textoAcao="Cadastrar Novo Edital"
          aoClicarAcao={() => (window.location.href = '/editais/novo')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {editais.map((edital) => (
            <div
              key={edital.id}
              className="cartao cartao-interativo"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--cor-primaria)' }}>
                      <Link to={`/editais/${edital.id}`}>{edital.titulo}</Link>
                    </h3>
                    <CrachaStatus tipo="edital_status" valor={edital.status} />
                    <span className="cracha cracha-neutro">{edital.categoria}</span>
                  </div>

                  {edital.instituicao && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)', fontWeight: 500 }}>
                      Instituição: {edital.instituicao}
                    </p>
                  )}
                </div>

                {/* Prazo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CrachaPrazo dataIso={edital.prazo_inscricao} />
                </div>
              </div>

              {edital.resumo && (
                <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)', lineHeight: 1.5 }}>
                  {edital.resumo.length > 240 ? `${edital.resumo.slice(0, 240)}...` : edital.resumo}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--cor-borda)' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)' }}>
                  {edital.nome_arquivo ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--cor-secundaria)' }}>
                      <FileText size={14} />
                      <span>{edital.nome_arquivo}</span>
                    </span>
                  ) : (
                    <span>Sem arquivo PDF anexado</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/editais/${edital.id}`}>
                    <Botao variante="primario" tamanho="sm" icone={<Eye size={15} />}>
                      Ver e Analisar
                    </Botao>
                  </Link>
                  <Link to={`/editais/${edital.id}/editar`}>
                    <Botao variante="secundario" tamanho="sm" icone={<Edit size={15} />}>
                      Editar
                    </Botao>
                  </Link>
                  <Botao
                    variante="secundario"
                    tamanho="sm"
                    onClick={() => setEditalParaExcluir(edital)}
                    icone={<Trash2 size={15} style={{ color: 'var(--cor-erro)' }} />}
                  >
                    Excluir
                  </Botao>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ModalConfirmacao
        aberto={Boolean(editalParaExcluir)}
        titulo="Excluir Edital"
        nomeItem={editalParaExcluir?.titulo}
        mensagem="Deseja realmente remover este edital da plataforma?"
        avisoDependencias="Ao remover este edital, todas as análises realizadas, requisitos identificados e tarefas dependentes geradas para ele serão excluídos permanentemente."
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setEditalParaExcluir(null)}
        carregando={excluindo}
      />
    </div>
  );
}


