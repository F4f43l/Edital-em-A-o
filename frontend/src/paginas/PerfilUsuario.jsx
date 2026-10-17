import React, { useState, useEffect } from 'react';
import { User, PlusCircle, Edit, Trash2, CheckCircle, ShieldCheck, Info } from 'lucide-react';
import { api } from '../servicos/api.js';
import { Cartao } from '../componentes/Cartao.jsx';
import { Botao } from '../componentes/Botao.jsx';
import { CampoTexto } from '../componentes/CampoTexto.jsx';
import { CampoSelecao } from '../componentes/CampoSelecao.jsx';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao.jsx';
import { EstadoCarregamento } from '../componentes/EstadoCarregamento.jsx';
import { MensagemErro } from '../componentes/MensagemErro.jsx';

export function PerfilUsuario() {
  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Form State
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [perfilEmEdicao, setPerfilEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [errosCampos, setErrosCampos] = useState({});

  const [form, setForm] = useState({
    nome_exibicao: '',
    nivel_ensino: 'Graduação',
    instituicao: '',
    curso: '',
    municipio: '',
    situacao_trabalho: 'Estudante',
    faixa_renda: 'Até 1,5 salário mínimo',
    tamanho_familia: '',
  });

  // Modal exclusão
  const [perfilParaExcluir, setPerfilParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregarPerfis = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await api.listarPerfis();
      setPerfis(dados);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar perfis de usuário.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  const abrirNovoFormulario = () => {
    setPerfilEmEdicao(null);
    setForm({
      nome_exibicao: '',
      nivel_ensino: 'Graduação',
      instituicao: '',
      curso: '',
      municipio: '',
      situacao_trabalho: 'Estudante',
      faixa_renda: 'Até 1,5 salário mínimo',
      tamanho_familia: '',
    });
    setErrosCampos({});
    setExibirFormulario(true);
  };

  const abrirEdicao = (perfil) => {
    setPerfilEmEdicao(perfil);
    setForm({
      nome_exibicao: perfil.nome_exibicao || '',
      nivel_ensino: perfil.nivel_ensino || 'Graduação',
      instituicao: perfil.instituicao || '',
      curso: perfil.curso || '',
      municipio: perfil.municipio || '',
      situacao_trabalho: perfil.situacao_trabalho || 'Estudante',
      faixa_renda: perfil.faixa_renda || 'Até 1,5 salário mínimo',
      tamanho_familia: perfil.tamanho_familia ? String(perfil.tamanho_familia) : '',
    });
    setErrosCampos({});
    setExibirFormulario(true);
  };

  const salvarPerfil = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErrosCampos({});

    if (!form.nome_exibicao || form.nome_exibicao.trim().length < 2) {
      setErrosCampos({ nome_exibicao: 'O nome de exibição deve ter pelo menos 2 caracteres.' });
      setSalvando(false);
      return;
    }

    try {
      const payload = {
        nome_exibicao: form.nome_exibicao.trim(),
        nivel_ensino: form.nivel_ensino || null,
        instituicao: form.instituicao.trim() || null,
        curso: form.curso.trim() || null,
        municipio: form.municipio.trim() || null,
        situacao_trabalho: form.situacao_trabalho || null,
        faixa_renda: form.faixa_renda || null,
        tamanho_familia: form.tamanho_familia ? parseInt(form.tamanho_familia, 10) : null,
      };

      if (perfilEmEdicao) {
        await api.atualizarPerfil(perfilEmEdicao.id, payload);
      } else {
        await api.criarPerfil(payload);
      }

      setExibirFormulario(false);
      await carregarPerfis();
    } catch (err) {
      if (err.detalhes && Array.isArray(err.detalhes)) {
        const mapa = {};
        err.detalhes.forEach((d) => {
          mapa[d.campo] = d.mensagem;
        });
        setErrosCampos(mapa);
      } else {
        alert(`Erro ao salvar perfil: ${err.message}`);
      }
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!perfilParaExcluir) return;
    setExcluindo(true);
    try {
      await api.excluirPerfil(perfilParaExcluir.id);
      setPerfilParaExcluir(null);
      await carregarPerfis();
    } catch (err) {
      alert(`Erro ao excluir perfil: ${err.message}`);
    } finally {
      setExcluindo(false);
    }
  };

  if (carregando) {
    return <EstadoCarregamento mensagem="Carregando perfis cadastrados..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="kicker-editorial">DADOS DO CANDIDATO</div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700, margin: '0.2rem 0' }}>
            Meu Perfil de Candidato
          </h1>
          <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem' }}>
            Gerencie as informações utilizadas pelo sistema para conferir sua compatibilidade com os editais.
          </p>
        </div>
        {!exibirFormulario && (
          <Botao variante="primario" icone={<PlusCircle size={18} />} onClick={abrirNovoFormulario}>
            Novo Perfil
          </Botao>
        )}
      </div>

      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={carregarPerfis} />}

      {/* Princípio de Privacidade & Minimização de Dados */}
      <div
        className="alerta"
        style={{
          fontSize: '0.88rem',
          backgroundColor: 'var(--cor-fundo)',
          border: '1px solid var(--cor-borda-forte)',
          borderLeft: '4px solid var(--cor-primaria)',
          borderRadius: 'var(--raio-sm)',
          padding: '0.85rem 1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--cor-primaria)' }} />
          <div>
            <strong style={{ color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}>Privacidade em Primeiro Lugar:</strong> Coletamos apenas os dados indispensáveis para conferência
            dos critérios de bolsas e auxílios (nível de escolaridade, renda familiar estimada e município).
            Nunca solicitamos CPF, documentos bancários ou dados pessoais sensíveis.
          </div>
        </div>
      </div>

      {/* Formulário de Criação/Edição */}
      {exibirFormulario && (
        <Cartao titulo={perfilEmEdicao ? 'Editar Perfil' : 'Novo Perfil de Candidato'}>
          <form onSubmit={salvarPerfil}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CampoTexto
                id="nome_exibicao"
                rotulo="Nome de Exibição / Identificador"
                dica="Como você prefere identificar este perfil (ex: Maria Silva - Graduação)."
                obrigatorio
                valor={form.nome_exibicao}
                aoMudar={(e) => setForm({ ...form, nome_exibicao: e.target.value })}
                placeholder="Ex: Maria Eduarda Silva"
                erro={errosCampos.nome_exibicao}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <CampoSelecao
                  id="nivel_ensino"
                  rotulo="Nível de Ensino Atual"
                  dica="Utilizado para verificar editais exclusivos de graduação, ensino médio ou pós."
                  valor={form.nivel_ensino}
                  aoMudar={(e) => setForm({ ...form, nivel_ensino: e.target.value })}
                  placeholder={null}
                  opcoes={['Ensino Médio', 'Graduação', 'Pós-Graduação', 'Técnico', 'Outro']}
                />

                <CampoTexto
                  id="instituicao"
                  rotulo="Instituição de Ensino"
                  dica="Nome da escola, faculdade ou universidade em que está matriculado(a)."
                  valor={form.instituicao}
                  aoMudar={(e) => setForm({ ...form, instituicao: e.target.value })}
                  placeholder="Ex: Universidade Federal"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <CampoTexto
                  id="curso"
                  rotulo="Curso / Área de Estudo"
                  dica="Curso em andamento (útil para editais de áreas específicas)."
                  valor={form.curso}
                  aoMudar={(e) => setForm({ ...form, curso: e.target.value })}
                  placeholder="Ex: Engenharia de Software, Administração"
                />

                <CampoTexto
                  id="municipio"
                  rotulo="Município / Cidade de Residência"
                  dica="Verifica critérios de abrangência regional ou transporte."
                  valor={form.municipio}
                  aoMudar={(e) => setForm({ ...form, municipio: e.target.value })}
                  placeholder="Ex: São Paulo, Belo Horizonte"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <CampoSelecao
                  id="situacao_trabalho"
                  rotulo="Situação Ocupacional"
                  dica="Verifica exigências de dedicação exclusiva ou inexistência de vínculo."
                  valor={form.situacao_trabalho}
                  aoMudar={(e) => setForm({ ...form, situacao_trabalho: e.target.value })}
                  placeholder={null}
                  opcoes={['Estudante', 'Desempregado(a)', 'Empregado(a)', 'Autônomo(a)', 'Estagiário(a)']}
                />

                <CampoSelecao
                  id="faixa_renda"
                  rotulo="Faixa de Renda Familiar per Capita"
                  dica="Critério socioeconômico comum para concessão de auxílios e bolsas."
                  valor={form.faixa_renda}
                  aoMudar={(e) => setForm({ ...form, faixa_renda: e.target.value })}
                  placeholder={null}
                  opcoes={[
                    'Sem renda',
                    'Até 1,5 salário mínimo',
                    '1,5 a 3 salários mínimos',
                    'Acima de 3 salários mínimos',
                  ]}
                />

                <CampoTexto
                  id="tamanho_familia"
                  type="number"
                  rotulo="Quantidade de Pessoas na Família"
                  dica="Número de moradores que dividem a renda familiar."
                  valor={form.tamanho_familia}
                  aoMudar={(e) => setForm({ ...form, tamanho_familia: e.target.value })}
                  placeholder="Ex: 3"
                  min="1"
                  max="30"
                  erro={errosCampos.tamanho_familia}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <Botao variante="secundario" onClick={() => setExibirFormulario(false)} disabled={salvando}>
                  Cancelar
                </Botao>
                <Botao tipo="submit" variante="primario" carregando={salvando}>
                  {perfilEmEdicao ? 'Salvar Perfil' : 'Criar Perfil'}
                </Botao>
              </div>
            </div>
          </form>
        </Cartao>
      )}

      {/* Lista de Perfis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {perfis.map((perfil) => (
          <Cartao key={perfil.id} className="cartao-interativo">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    backgroundColor: 'var(--cor-secundaria)',
                    color: 'var(--cor-texto-principal)',
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--raio-xs)',
                    border: '1px solid var(--cor-borda-forte)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700 }}>
                    {perfil.nome_exibicao}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)', fontFamily: 'var(--fonte-mono)' }}>
                    {perfil.nivel_ensino || 'Escolaridade não inf.'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => abrirEdicao(perfil)}
                  title="Editar perfil"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-texto-secundario)' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPerfilParaExcluir(perfil)}
                  title="Excluir perfil"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-erro)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--cor-texto-secundario)' }}>
              {perfil.curso && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)' }}>Curso: </span>
                  <strong>{perfil.curso}</strong>
                </div>
              )}
              {perfil.instituicao && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)' }}>Instituição: </span>
                  {perfil.instituicao}
                </div>
              )}
              {perfil.municipio && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)' }}>Município: </span>
                  {perfil.municipio}
                </div>
              )}
              {perfil.situacao_trabalho && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)' }}>Ocupação: </span>
                  {perfil.situacao_trabalho}
                </div>
              )}
              {perfil.faixa_renda && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)' }}>Renda declarada: </span>
                  <span className="cracha cracha-info">{perfil.faixa_renda}</span>
                </div>
              )}
            </div>
          </Cartao>
        ))}
      </div>

      {/* Modal de Exclusão */}
      <ModalConfirmacao
        aberto={Boolean(perfilParaExcluir)}
        titulo="Excluir Perfil de Candidato"
        nomeItem={perfilParaExcluir?.nome_exibicao}
        mensagem="Tem certeza de que deseja remover este perfil?"
        avisoDependencias="As análises históricas realizadas anteriormente com este perfil serão preservadas no banco de dados para seu controle."
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setPerfilParaExcluir(null)}
        carregando={excluindo}
      />
    </div>
  );
}


