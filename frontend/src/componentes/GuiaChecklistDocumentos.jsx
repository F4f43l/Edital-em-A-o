import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Send,
  Hash,
} from 'lucide-react';
import { CardDocumentoExigido } from './CardDocumentoExigido.jsx';
import { Botao } from './Botao.jsx';
import { Cartao } from './Cartao.jsx';
import { ModalConfirmacao } from './ModalConfirmacao.jsx';
import { CampoTexto } from './CampoTexto.jsx';
import { CampoSelecao } from './CampoSelecao.jsx';
import { api } from '../servicos/api.js';

export function GuiaChecklistDocumentos({
  documentos = [],
  requisitos = [],
  analiseId,
  aoAtualizarLista,
  bloqueado = false,
}) {
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Modal para Adicionar / Editar Documento
  const [modalAberto, setModalAberto] = useState(false);
  const [documentoEmEdicao, setDocumentoEmEdicao] = useState(null);
  const [salvandoDocumento, setSalvandoDocumento] = useState(false);

  const [formDocumento, setFormDocumento] = useState({
    nome: '',
    finalidade: '',
    requisito_id: '',
    quem_fornece: 'Candidato',
    orgao_emissor: '',
    como_obter: '',
    documentos_alternativos: '',
    formato_aceito: 'PDF legível',
    exigencias_validade: '',
    local_entrega: 'Portal de Inscrições Oficial',
    url_entrega: '',
    secao_entrega: '',
    etapa_processo: 'Inscrição',
    prazo_envio: '',
    prazo_envio_descricao: '',
    como_confirmar_envio: 'Verificar comprovante gerado e protocolo',
    instrucoes_protocolo: 'Baixar e guardar o arquivo de recibo',
    status_etapa: 'pendente_obtencao',
    classificacao_fonte: 'confirmado_edital',
    secao_edital: '',
    pagina_origem: '',
    trecho_evidencia: '',
    link_fonte_oficial: '',
    observacao_pendencia: '',
  });

  // Modal de Exclusão
  const [docParaExcluir, setDocParaExcluir] = useState(null);
  const [excluindoDoc, setExcluindoDoc] = useState(false);

  // Contadores de progresso
  const totalDocumentos = documentos.length;
  const docsObtidos = documentos.filter((d) =>
    ['obtido', 'conferido', 'enviado', 'recebimento_confirmado', 'validado_instituicao'].includes(d.status_etapa)
  ).length;
  const docsEnviados = documentos.filter((d) =>
    ['enviado', 'recebimento_confirmado', 'validado_instituicao'].includes(d.status_etapa)
  ).length;
  const docsComProtocolo = documentos.filter((d) => Boolean(d.protocolo_comprovante && d.protocolo_comprovante.trim())).length;
  const docsValidados = documentos.filter((d) => d.status_etapa === 'validado_instituicao').length;

  const porcentagemEnvio = totalDocumentos > 0 ? Math.round((docsEnviados / totalDocumentos) * 100) : 0;

  // Filtragem dos documentos
  const documentosFiltrados = documentos.filter((doc) => {
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'pendentes') return doc.status_etapa === 'pendente_obtencao';
    if (filtroStatus === 'obtidos') return ['obtido', 'conferido'].includes(doc.status_etapa);
    if (filtroStatus === 'enviados') return ['enviado', 'recebimento_confirmado'].includes(doc.status_etapa);
    if (filtroStatus === 'validados') return doc.status_etapa === 'validado_instituicao';
    return true;
  });

  const abrirNovoDocumento = () => {
    setDocumentoEmEdicao(null);
    setFormDocumento({
      nome: '',
      finalidade: '',
      requisito_id: requisitos[0]?.id ? String(requisitos[0].id) : '',
      quem_fornece: 'Candidato',
      orgao_emissor: '',
      como_obter: '',
      documentos_alternativos: '',
      formato_aceito: 'PDF legível',
      exigencias_validade: '',
      local_entrega: 'Portal Oficial',
      url_entrega: '',
      secao_entrega: '',
      etapa_processo: 'Inscrição',
      prazo_envio: '',
      prazo_envio_descricao: '',
      como_confirmar_envio: 'Verificar comprovante gerado',
      instrucoes_protocolo: 'Baixar e salvar recibo',
      status_etapa: 'pendente_obtencao',
      classificacao_fonte: 'confirmado_edital',
      secao_edital: '',
      pagina_origem: '',
      trecho_evidencia: '',
      link_fonte_oficial: '',
      observacao_pendencia: '',
    });
    setModalAberto(true);
  };

  const abrirEditarDocumento = (doc) => {
    setDocumentoEmEdicao(doc);
    setFormDocumento({
      nome: doc.nome || '',
      finalidade: doc.finalidade || '',
      requisito_id: doc.requisito_id ? String(doc.requisito_id) : '',
      quem_fornece: doc.quem_fornece || '',
      orgao_emissor: doc.orgao_emissor || '',
      como_obter: doc.como_obter || '',
      documentos_alternativos: doc.documentos_alternativos || '',
      formato_aceito: doc.formato_aceito || '',
      exigencias_validade: doc.exigencias_validade || '',
      local_entrega: doc.local_entrega || '',
      url_entrega: doc.url_entrega || '',
      secao_entrega: doc.secao_entrega || '',
      etapa_processo: doc.etapa_processo || '',
      prazo_envio: doc.prazo_envio ? String(doc.prazo_envio).slice(0, 10) : '',
      prazo_envio_descricao: doc.prazo_envio_descricao || '',
      como_confirmar_envio: doc.como_confirmar_envio || '',
      instrucoes_protocolo: doc.instrucoes_protocolo || '',
      status_etapa: doc.status_etapa || 'pendente_obtencao',
      classificacao_fonte: doc.classificacao_fonte || 'confirmado_edital',
      secao_edital: doc.secao_edital || '',
      pagina_origem: doc.pagina_origem ? String(doc.pagina_origem) : '',
      trecho_evidencia: doc.trecho_evidencia || '',
      link_fonte_oficial: doc.link_fonte_oficial || '',
      observacao_pendencia: doc.observacao_pendencia || '',
    });
    setModalAberto(true);
  };

  const salvarDocumento = async (e) => {
    e.preventDefault();
    if (!formDocumento.nome.trim()) {
      alert('O nome do documento é obrigatório.');
      return;
    }

    setSalvandoDocumento(true);
    try {
      const payload = {
        ...formDocumento,
        analise_id: analiseId,
        requisito_id: formDocumento.requisito_id ? parseInt(formDocumento.requisito_id, 10) : null,
        pagina_origem: formDocumento.pagina_origem ? parseInt(formDocumento.pagina_origem, 10) : null,
        prazo_envio: formDocumento.prazo_envio || null,
        url_entrega: formDocumento.url_entrega || null,
        link_fonte_oficial: formDocumento.link_fonte_oficial || null,
      };

      if (documentoEmEdicao) {
        await api.atualizarDocumento(documentoEmEdicao.id, payload);
      } else {
        await api.criarDocumento(analiseId, payload);
      }

      setModalAberto(false);
      if (aoAtualizarLista) await aoAtualizarLista();
    } catch (err) {
      alert(`Falha ao salvar documento: ${err.message}`);
    } finally {
      setSalvandoDocumento(false);
    }
  };

  const confirmarExclusaoDocumento = async () => {
    if (!docParaExcluir) return;
    setExcluindoDoc(true);
    try {
      await api.excluirDocumento(docParaExcluir.id);
      setDocParaExcluir(null);
      if (aoAtualizarLista) await aoAtualizarLista();
    } catch (err) {
      alert(`Falha ao excluir documento: ${err.message}`);
    } finally {
      setExcluindoDoc(false);
    }
  };

  const atualizarItemIndividual = (docAtualizado) => {
    if (aoAtualizarLista) aoAtualizarLista();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Resumo de Progresso Consolidado dos Documentos */}
      <Cartao>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--cor-primaria)' }}>
              Checklist Consolidado de Documentação ({totalDocumentos} documentos)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)' }}>
              Gerencie individualmente a obtenção, validação de formato e envio com registro de protocolos.
            </p>
          </div>
          <Botao variante="primario" tamanho="sm" icone={<PlusCircle size={15} />} onClick={abrirNovoDocumento}>
            Novo Documento Manual
          </Botao>
        </div>

        {/* Métricas de Progresso */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--cor-texto-mutado)', display: 'block' }}>Obtidos/Conferidos</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--cor-primaria)' }}>{docsObtidos} / {totalDocumentos}</strong>
          </div>
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--raio-sm)', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.74rem', color: '#166534', display: 'block' }}>Enviados pelo Canal</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--cor-sucesso)' }}>{docsEnviados} / {totalDocumentos}</strong>
          </div>
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#eff6ff', borderRadius: 'var(--raio-sm)', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '0.74rem', color: '#1e40af', display: 'block' }}>Com Protocolo Salvo</span>
            <strong style={{ fontSize: '1.15rem', color: '#1d4ed8' }}>{docsComProtocolo} / {totalDocumentos}</strong>
          </div>
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#faf5ff', borderRadius: 'var(--raio-sm)', border: '1px solid #e9d5ff' }}>
            <span style={{ fontSize: '0.74rem', color: '#6b21a8', display: 'block' }}>Validados Instituição</span>
            <strong style={{ fontSize: '1.15rem', color: '#7e22ce' }}>{docsValidados} / {totalDocumentos}</strong>
          </div>
        </div>

        {/* Barra de Progresso Geral */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: 'var(--raio-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${porcentagemEnvio}%`,
              height: '100%',
              backgroundColor: 'var(--cor-secundaria)',
              borderRadius: 'var(--raio-full)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </Cartao>

      {/* Filtros Rápidos de Status */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setFiltroStatus('todos')}
          className={`botao-filtro ${filtroStatus === 'todos' ? 'ativo' : ''}`}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--raio-full)',
            border: filtroStatus === 'todos' ? '1px solid var(--cor-secundaria)' : '1px solid var(--cor-borda)',
            backgroundColor: filtroStatus === 'todos' ? 'var(--cor-secundaria-suave)' : '#ffffff',
            color: filtroStatus === 'todos' ? 'var(--cor-secundaria)' : 'var(--cor-texto-secundario)',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Todos ({totalDocumentos})
        </button>
        <button
          type="button"
          onClick={() => setFiltroStatus('pendentes')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--raio-full)',
            border: filtroStatus === 'pendentes' ? '1px solid var(--cor-atencao)' : '1px solid var(--cor-borda)',
            backgroundColor: filtroStatus === 'pendentes' ? 'var(--cor-atencao-fundo)' : '#ffffff',
            color: filtroStatus === 'pendentes' ? 'var(--cor-atencao)' : 'var(--cor-texto-secundario)',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Pendentes ({totalDocumentos - docsObtidos})
        </button>
        <button
          type="button"
          onClick={() => setFiltroStatus('obtidos')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--raio-full)',
            border: filtroStatus === 'obtidos' ? '1px solid var(--cor-info)' : '1px solid var(--cor-borda)',
            backgroundColor: filtroStatus === 'obtidos' ? 'var(--cor-info-fundo)' : '#ffffff',
            color: filtroStatus === 'obtidos' ? 'var(--cor-info)' : 'var(--cor-texto-secundario)',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Obtidos / Conferidos ({docsObtidos - docsEnviados})
        </button>
        <button
          type="button"
          onClick={() => setFiltroStatus('enviados')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--raio-full)',
            border: filtroStatus === 'enviados' ? '1px solid var(--cor-sucesso)' : '1px solid var(--cor-borda)',
            backgroundColor: filtroStatus === 'enviados' ? 'var(--cor-sucesso-fundo)' : '#ffffff',
            color: filtroStatus === 'enviados' ? 'var(--cor-sucesso)' : 'var(--cor-texto-secundario)',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Enviados ({docsEnviados - docsValidados})
        </button>
        <button
          type="button"
          onClick={() => setFiltroStatus('validados')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--raio-full)',
            border: filtroStatus === 'validados' ? '1px solid #9333ea' : '1px solid var(--cor-borda)',
            backgroundColor: filtroStatus === 'validados' ? '#faf5ff' : '#ffffff',
            color: filtroStatus === 'validados' ? '#7e22ce' : 'var(--cor-texto-secundario)',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Validados Instituição ({docsValidados})
        </button>
      </div>

      {/* Lista Individualizada de Documentos */}
      {documentosFiltrados.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--raio-md)', border: '1px solid var(--cor-borda)' }}>
          <FileText size={36} style={{ color: 'var(--cor-texto-mutado)', margin: '0 auto 0.5rem' }} />
          <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem' }}>
            Nenhum documento encontrado para o filtro selecionado.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {documentosFiltrados.map((doc) => {
            const reqVinculado = requisitos.find((r) => r.id === doc.requisito_id);
            return (
              <CardDocumentoExigido
                key={doc.id}
                documento={doc}
                requisitoVinculado={reqVinculado}
                aoAtualizar={atualizarItemIndividual}
                aoEditar={abrirEditarDocumento}
                aoExcluir={() => setDocParaExcluir(doc)}
                bloqueado={bloqueado}
              />
            );
          })}
        </div>
      )}

      {/* Modal Adicionar / Editar Documento */}
      {modalAberto && (
        <div className="sobreposicao-modal" role="dialog" aria-modal="true">
          <div className="conteudo-modal" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', marginBottom: '1rem' }}>
              {documentoEmEdicao ? 'Editar Documento Exigido' : 'Adicionar Documento Manual'}
            </h2>

            <form onSubmit={salvarDocumento}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <CampoTexto
                  id="doc_nome"
                  rotulo="Nome do Documento"
                  obrigatorio
                  valor={formDocumento.nome}
                  aoMudar={(e) => setFormDocumento({ ...formDocumento, nome: e.target.value })}
                  placeholder="Ex: Histórico Escolar com Coeficiente de Rendimento"
                />

                <CampoTexto
                  id="doc_finalidade"
                  rotulo="Finalidade / Requisito que Comprova"
                  valor={formDocumento.finalidade}
                  aoMudar={(e) => setFormDocumento({ ...formDocumento, finalidade: e.target.value })}
                  placeholder="Ex: Comprovar vínculo acadêmico ativo e média global superior a 7,0"
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <CampoTexto
                    id="doc_quem_fornece"
                    rotulo="Quem Fornece"
                    valor={formDocumento.quem_fornece}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, quem_fornece: e.target.value })}
                    placeholder="Ex: Candidato / Secretaria Acadêmica"
                  />
                  <CampoTexto
                    id="doc_orgao_emissor"
                    rotulo="Órgão / Sistema Emissor"
                    valor={formDocumento.orgao_emissor}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, orgao_emissor: e.target.value })}
                    placeholder="Ex: Portal Acadêmico SIGAA"
                  />
                </div>

                <CampoTexto
                  id="doc_como_obter"
                  rotulo="Como Obter o Documento (Procedimento Passo a Passo)"
                  multilinha
                  rows={2}
                  valor={formDocumento.como_obter}
                  aoMudar={(e) => setFormDocumento({ ...formDocumento, como_obter: e.target.value })}
                  placeholder="Explique onde o usuário clica ou qual setor deve procurar..."
                />

                <CampoTexto
                  id="doc_alternativos"
                  rotulo="Documentos Alternativos Aceitos"
                  valor={formDocumento.documentos_alternativos}
                  aoMudar={(e) => setFormDocumento({ ...formDocumento, documentos_alternativos: e.target.value })}
                  placeholder="Ex: Declaração de notas assinada pela coordenação do curso"
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <CampoTexto
                    id="doc_formato"
                    rotulo="Formato Aceito"
                    valor={formDocumento.formato_aceito}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, formato_aceito: e.target.value })}
                    placeholder="Ex: PDF único legível, máx 5MB"
                  />
                  <CampoTexto
                    id="doc_validade"
                    rotulo="Condições de Validade / Assinatura"
                    valor={formDocumento.exigencias_validade}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, exigencias_validade: e.target.value })}
                    placeholder="Ex: Código de autenticação digital verificável"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <CampoTexto
                    id="doc_local_entrega"
                    rotulo="Local / Canal de Entrega"
                    valor={formDocumento.local_entrega}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, local_entrega: e.target.value })}
                    placeholder="Ex: Portal de Inscrições da FUAE"
                  />
                  <CampoTexto
                    id="doc_url_entrega"
                    rotulo="URL Direta do Canal (Se identificada)"
                    valor={formDocumento.url_entrega}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, url_entrega: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  <CampoTexto
                    id="doc_prazo_envio"
                    type="date"
                    rotulo="Prazo Limite de Envio"
                    valor={formDocumento.prazo_envio}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, prazo_envio: e.target.value })}
                  />
                  <CampoTexto
                    id="doc_etapa"
                    rotulo="Etapa do Processo"
                    valor={formDocumento.etapa_processo}
                    aoMudar={(e) => setFormDocumento({ ...formDocumento, etapa_processo: e.target.value })}
                    placeholder="Ex: Inscrição / Recurso"
                  />
                </div>

                <CampoTexto
                  id="doc_pendencia"
                  rotulo="Pendência ou Aviso de Conferência (Se faltar algo no edital)"
                  valor={formDocumento.observacao_pendencia}
                  aoMudar={(e) => setFormDocumento({ ...formDocumento, observacao_pendencia: e.target.value })}
                  placeholder="Ex: Canal não detalhado expressamente no edital, conferir retificação"
                />
              </div>

              <div className="acoes-modal" style={{ marginTop: '1.25rem' }}>
                <Botao variante="secundario" onClick={() => setModalAberto(false)} disabled={salvandoDocumento}>
                  Cancelar
                </Botao>
                <Botao tipo="submit" variante="primario" carregando={salvandoDocumento}>
                  Salvar Documento
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão de Documento */}
      <ModalConfirmacao
        aberto={Boolean(docParaExcluir)}
        titulo="Excluir Documento"
        nomeItem={docParaExcluir?.nome}
        mensagem="Deseja remover este documento do checklist da análise?"
        aoConfirmar={confirmarExclusaoDocumento}
        aoCancelar={() => setDocParaExcluir(null)}
        carregando={excluindoDoc}
      />
    </div>
  );
}
