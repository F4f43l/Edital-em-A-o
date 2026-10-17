import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Save,
  Send,
  FileCheck,
  Building,
  Calendar,
  Hash,
  ShieldCheck,
  Clock,
  Check,
  Link2,
  Trash2,
  Edit3,
  Info,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CrachaFonte } from './CrachaFonte.jsx';
import {
  ROTULOS_STATUS_ETAPA_DOCUMENTO,
  formatarDataPtBr,
} from '../utilitarios/formatadores.js';
import { api } from '../servicos/api.js';

export function CardDocumentoExigido({
  documento,
  aoAtualizar,
  aoEditar,
  aoExcluir,
  requisitoVinculado = null,
  bloqueado = false,
}) {
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [salvandoChecklist, setSalvandoChecklist] = useState(false);
  const [protocoloTexto, setProtocoloTexto] = useState(documento.protocolo_comprovante || '');
  const [salvandoProtocolo, setSalvandoProtocolo] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [mostrarGuiaDigitalizacao, setMostrarGuiaDigitalizacao] = useState(false);
  const [mostrarGuiaPreparacao, setMostrarGuiaPreparacao] = useState(false);

  // Parse do checklist_etapas
  let checklist = {
    entender_necessidade: false,
    obter_documento: false,
    conferir_validade_formato: false,
    enviar_canal_correto: false,
    registrar_protocolo: false,
  };

  if (documento.checklist_etapas) {
    if (typeof documento.checklist_etapas === 'string') {
      try {
        checklist = { ...checklist, ...JSON.parse(documento.checklist_etapas) };
      } catch (e) {
        // mantém fallback
      }
    } else if (typeof documento.checklist_etapas === 'object') {
      checklist = { ...checklist, ...documento.checklist_etapas };
    }
  }

  const etapasChecklist = [
    { chave: 'entender_necessidade', rotulo: '1. Entender o que é exigido e finalidade' },
    { chave: 'obter_documento', rotulo: '2. Obter o documento junto ao órgão/sistema emissor' },
    { chave: 'conferir_validade_formato', rotulo: '3. Conferir validade, formato aceito e assinatura' },
    { chave: 'enviar_canal_correto', rotulo: '4. Enviar pelo canal oficial correto' },
    { chave: 'registrar_protocolo', rotulo: '5. Registrar e guardar o protocolo/comprovante de envio' },
  ];

  const totalEtapas = etapasChecklist.length;
  const etapasConcluidas = etapasChecklist.filter((e) => checklist[e.chave]).length;
  const porcentagemChecklist = Math.round((etapasConcluidas / totalEtapas) * 100);

  // Manipular alternância do checklist
  const alternarEtapa = async (chave) => {
    if (bloqueado || salvandoChecklist) return;
    const novoChecklist = {
      ...checklist,
      [chave]: !checklist[chave],
    };

    setSalvandoChecklist(true);
    try {
      const docAtualizado = await api.atualizarChecklistDocumento(documento.id, novoChecklist);
      if (aoAtualizar) aoAtualizar(docAtualizado);
    } catch (err) {
      alert(`Falha ao atualizar checklist do documento: ${err.message}`);
    } finally {
      setSalvandoChecklist(false);
    }
  };

  // Manipular mudança de status de etapa
  const mudarStatusEtapa = async (novoStatus) => {
    if (bloqueado || salvandoStatus || novoStatus === documento.status_etapa) return;
    setSalvandoStatus(true);
    try {
      const docAtualizado = await api.alterarStatusEtapaDocumento(documento.id, novoStatus);
      if (aoAtualizar) aoAtualizar(docAtualizado);
    } catch (err) {
      alert(`Falha ao atualizar status do documento: ${err.message}`);
    } finally {
      setSalvandoStatus(false);
    }
  };

  // Salvar protocolo de envio
  const salvarProtocolo = async (e) => {
    e?.preventDefault();
    if (bloqueado || salvandoProtocolo) return;
    setSalvandoProtocolo(true);
    try {
      const docAtualizado = await api.atualizarProtocoloDocumento(documento.id, protocoloTexto);
      if (aoAtualizar) aoAtualizar(docAtualizado);
      setMensagemSucesso('Protocolo salvo com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (err) {
      alert(`Falha ao salvar protocolo: ${err.message}`);
    } finally {
      setSalvandoProtocolo(false);
    }
  };

  const statusConfig = ROTULOS_STATUS_ETAPA_DOCUMENTO[documento.status_etapa] || ROTULOS_STATUS_ETAPA_DOCUMENTO.pendente_obtencao;

  return (
    <div
      className="cartao"
      style={{
        border: `1.5px solid ${statusConfig.borda || 'var(--cor-borda-forte)'}`,
        backgroundColor: 'var(--cor-superficie)',
        borderRadius: 'var(--raio-sm)',
        padding: '1.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--sombra-sm)',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Cabeçalho do Documento */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--raio-sm)',
              backgroundColor: statusConfig.fundo,
              color: statusConfig.cor,
              border: `1px solid ${statusConfig.borda || 'var(--cor-borda-forte)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '1px 1px 0px rgba(23, 23, 23, 0.3)',
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--cor-texto-principal)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {documento.nome_simples || documento.nome}
              </h3>
              {documento.nome_simples && documento.nome_simples !== documento.nome && (
                <span style={{ fontSize: '0.8rem', color: 'var(--cor-texto-mutado)', fontStyle: 'italic' }}>
                  (Exigência oficial: <strong>{documento.nome}</strong>)
                </span>
              )}
              <CrachaFonte
                classificacao={documento.classificacao_fonte}
                secao={documento.secao_edital}
                pagina={documento.pagina_origem}
                linkOficial={documento.link_fonte_oficial}
                dataVerificacao={documento.data_verificacao_externa}
              />
            </div>
            {requisitoVinculado && (
              <p style={{ fontSize: '0.82rem', color: 'var(--cor-texto-mutado)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Link2 size={13} />
                <span>Comprova o requisito: <strong>{requisitoVinculado.titulo}</strong></span>
              </p>
            )}
          </div>
        </div>

        {/* Ações de Edição / Exclusão Manual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {aoEditar && (
            <button
              type="button"
              onClick={() => aoEditar(documento)}
              title="Editar orientações deste documento"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-texto-secundario)' }}
            >
              <Edit3 size={15} />
            </button>
          )}
          {aoExcluir && (
            <button
              type="button"
              onClick={() => aoExcluir(documento)}
              title="Excluir documento exigido"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-erro)' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Seletor Rápido de Status da Etapa e Distinção de Validação Institucional */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: statusConfig.fundo,
          borderRadius: 'var(--raio-sm)',
          border: `1.5px solid ${statusConfig.borda}`,
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: statusConfig.cor }}>
            Status da Etapa do Documento:
          </span>
          <select
            value={documento.status_etapa}
            onChange={(e) => mudarStatusEtapa(e.target.value)}
            disabled={bloqueado || salvandoStatus}
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--raio-sm)',
              border: `1.5px solid ${statusConfig.borda}`,
              backgroundColor: 'var(--cor-superficie)',
              color: statusConfig.cor,
              cursor: 'pointer',
              boxShadow: '1px 1px 0px rgba(23, 23, 23, 0.3)',
            }}
          >
            {Object.entries(ROTULOS_STATUS_ETAPA_DOCUMENTO).map(([chave, info]) => (
              <option key={chave} value={chave}>
                {info.texto}
              </option>
            ))}
          </select>
        </div>

        {/* Aviso de que Validação Institucional exige publicação oficial */}
        {documento.status_etapa === 'validado_instituicao' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--cor-sucesso)', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            <span>Documento formalmente validado e deferido pela comissão do edital.</span>
          </div>
        ) : (
          <div style={{ fontSize: '0.74rem', color: 'var(--cor-texto-mutado)' }}>
            Etapas 1 a 5 registram ações do candidato; validação oficial depende de parecer da instituição.
          </div>
        )}
      </div>

      {/* Grade de Orientações Práticas do Documento */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.85rem',
          backgroundColor: 'var(--cor-fundo)',
          padding: '1.1rem',
          borderRadius: 'var(--raio-sm)',
          border: '1px solid var(--cor-borda-forte)',
          fontSize: '0.86rem',
        }}
      >
        {/* 1. Por que é necessário */}
        {documento.finalidade && (
          <div>
            <span style={{ fontWeight: 700, color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.2rem' }}>
              Finalidade / Por que é necessário:
            </span>
            <span style={{ color: 'var(--cor-texto-secundario)' }}>{documento.finalidade}</span>
          </div>
        )}

        {/* 2. Quem deve fornecer e órgão emissor */}
        {(documento.quem_fornece || documento.orgao_emissor) && (
          <div>
            <span style={{ fontWeight: 700, color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.2rem' }}>
              Quem fornece / Órgão emissor:
            </span>
            <span style={{ color: 'var(--cor-texto-secundario)' }}>
              {documento.quem_fornece && <strong>{documento.quem_fornece}</strong>}
              {documento.quem_fornece && documento.orgao_emissor && ' — '}
              {documento.orgao_emissor && <span>{documento.orgao_emissor}</span>}
            </span>
          </div>
        )}

        {/* 3. Como obter */}
        {documento.como_obter && (
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ fontWeight: 700, color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.2rem' }}>
              Procedimento para obtenção:
            </span>
            <span style={{ color: 'var(--cor-texto-secundario)', lineHeight: 1.5 }}>{documento.como_obter}</span>
            {documento.dados_solicitacao && (
              <div
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: 'var(--cor-superficie)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--raio-sm)',
                  border: '1px solid var(--cor-borda)',
                  fontSize: '0.82rem',
                }}
              >
                <strong style={{ color: 'var(--cor-primaria)' }}>Dados ou documentos necessários para solicitar: </strong>
                <span style={{ color: 'var(--cor-texto-secundario)' }}>{documento.dados_solicitacao}</span>
              </div>
            )}
          </div>
        )}

        {/* 4. Documentos alternativos aceitos */}
        {documento.documentos_alternativos && (
          <div style={{ gridColumn: '1 / -1', backgroundColor: 'var(--cor-secundaria-suave)', padding: '0.65rem', borderRadius: 'var(--raio-sm)', border: '1.5px solid var(--cor-secundaria)' }}>
            <span style={{ fontWeight: 700, color: 'var(--cor-secundaria-texto)', display: 'block', marginBottom: '0.2rem' }}>
              Alternativas aceitas pelo edital:
            </span>
            <span style={{ color: 'var(--cor-texto-principal)', fontSize: '0.84rem' }}>{documento.documentos_alternativos}</span>
          </div>
        )}

        {/* 5. Formatos aceitos e Condições de validade */}
        {(documento.formato_aceito || documento.exigencias_validade) && (
          <div>
            <span style={{ fontWeight: 600, color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.2rem' }}>
              Formato & Condições de validade:
            </span>
            <span style={{ color: 'var(--cor-texto-secundario)' }}>
              {documento.formato_aceito && <span>Formato: <strong>{documento.formato_aceito}</strong>. </span>}
              {documento.exigencias_validade && <span>Exigências: {documento.exigencias_validade}</span>}
            </span>
          </div>
        )}

        {/* 6. Canal de entrega & Seção */}
        <div>
          <span style={{ fontWeight: 600, color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.2rem' }}>
            Canal oficial de entrega:
          </span>
          <div style={{ color: 'var(--cor-texto-secundario)' }}>
            <span>{documento.local_entrega || 'Canal de envio oficial'}</span>
            {documento.secao_entrega && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--cor-texto-mutado)' }}>
                Seção: {documento.secao_entrega}
              </span>
            )}
            {documento.url_entrega && (
              <a
                href={documento.url_entrega}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  color: 'var(--cor-secundaria)',
                  fontWeight: 600,
                  marginTop: '0.25rem',
                }}
              >
                <ExternalLink size={12} />
                <span>Acessar portal de entrega</span>
              </a>
            )}
          </div>
        </div>

        {/* 7. Etapa do processo e Prazo exato */}
        <div>
          <span style={{ fontWeight: 600, color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.2rem' }}>
            Etapa & Prazo de entrega:
          </span>
          <span style={{ color: 'var(--cor-texto-secundario)' }}>
            {documento.etapa_processo && <strong>{documento.etapa_processo}</strong>}
            {documento.prazo_envio && (
              <span style={{ display: 'block', color: 'var(--cor-erro)', fontWeight: 600 }}>
                Data limite: {formatarDataPtBr(documento.prazo_envio)}
              </span>
            )}
            {documento.prazo_envio_descricao && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--cor-texto-mutado)' }}>
                {documento.prazo_envio_descricao}
              </span>
            )}
          </span>
        </div>

        {/* 8. Como confirmar envio & Protocolo */}
        {(documento.como_confirmar_envio || documento.instrucoes_protocolo) && (
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ fontWeight: 600, color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.2rem' }}>
              Confirmação de envio & Protocolo:
            </span>
            <span style={{ color: 'var(--cor-texto-secundario)' }}>
              {documento.como_confirmar_envio && <span>{documento.como_confirmar_envio}. </span>}
              {documento.instrucoes_protocolo && <span>Instruções de protocolo: {documento.instrucoes_protocolo}</span>}
            </span>
          </div>
        )}

        {/* Sinalização de Pendência ou Informação Não Localizada */}
        {documento.observacao_pendencia && (
          <div
            style={{
              gridColumn: '1 / -1',
              backgroundColor: '#fffbeb',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--raio-sm)',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              color: '#92400e',
              fontSize: '0.84rem',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Pendência / Atenção:</strong> {documento.observacao_pendencia}
            </div>
          </div>
        )}

        {/* Trecho Literal de Evidência no Edital */}
        {documento.trecho_evidencia && (
          <div
            style={{
              gridColumn: '1 / -1',
              backgroundColor: '#f1f5f9',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--raio-sm)',
              borderLeft: '4px solid var(--cor-secundaria)',
              fontSize: '0.82rem',
              color: '#334155',
              fontStyle: 'italic',
            }}
          >
            <span>« {documento.trecho_evidencia} »</span>
            {documento.pagina_origem && (
              <span style={{ display: 'block', marginTop: '0.2rem', fontWeight: 600, fontStyle: 'normal', color: 'var(--cor-texto-mutado)', fontSize: '0.76rem' }}>
                Fonte: Edital, pág. {documento.pagina_origem} {documento.secao_edital ? `(${documento.secao_edital})` : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Guias Práticos Expansíveis para Leigos: Preparação & Digitalização */}
      {(documento.instrucoes_preparacao || documento.como_digitalizar) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Botões de Abertura dos Guias */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {documento.instrucoes_preparacao && (
              <button
                type="button"
                onClick={() => setMostrarGuiaPreparacao(!mostrarGuiaPreparacao)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--raio-sm)',
                  border: mostrarGuiaPreparacao ? '1px solid var(--cor-primaria)' : '1px solid var(--cor-borda)',
                  backgroundColor: mostrarGuiaPreparacao ? '#f1f5f9' : '#ffffff',
                  color: 'var(--cor-primaria)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileCheck size={15} />
                <span>Como Preparar e Conferir</span>
                {mostrarGuiaPreparacao ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}

            {documento.como_digitalizar && (
              <button
                type="button"
                onClick={() => setMostrarGuiaDigitalizacao(!mostrarGuiaDigitalizacao)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--raio-sm)',
                  border: mostrarGuiaDigitalizacao ? '1px solid var(--cor-secundaria)' : '1px solid var(--cor-borda)',
                  backgroundColor: mostrarGuiaDigitalizacao ? '#eff6ff' : '#ffffff',
                  color: 'var(--cor-secundaria)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Smartphone size={15} />
                <span>Tutorial: Digitalizar no Celular</span>
                {mostrarGuiaDigitalizacao ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Painel do Guia de Preparação */}
          {mostrarGuiaPreparacao && documento.instrucoes_preparacao && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--cor-borda)',
                borderRadius: 'var(--raio-sm)',
                padding: '0.85rem 1rem',
                fontSize: '0.84rem',
                color: 'var(--cor-texto-principal)',
                whiteSpace: 'pre-line',
                lineHeight: 1.5,
              }}
            >
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--cor-primaria)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileCheck size={15} />
                <span>Instruções Práticas de Preparação e Validade:</span>
              </h4>
              {documento.instrucoes_preparacao}
            </div>
          )}

          {/* Painel do Tutorial de Digitalização */}
          {mostrarGuiaDigitalizacao && documento.como_digitalizar && (
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--raio-sm)',
                padding: '0.85rem 1rem',
                fontSize: '0.84rem',
                color: '#1e3a8a',
                whiteSpace: 'pre-line',
                lineHeight: 1.5,
              }}
            >
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Smartphone size={15} />
                <span>Tutorial de Digitalização para Leigos (Celular / Scanner):</span>
              </h4>
              {documento.como_digitalizar}
            </div>
          )}
        </div>
      )}

      {/* Checklist Independente de 5 Etapas do Documento */}
      <div
        style={{
          borderTop: '1px solid var(--cor-borda)',
          paddingTop: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cor-texto-principal)' }}>
            Checklist de Cumprimento do Documento ({etapasConcluidas}/{totalEtapas})
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cor-primaria)' }}>
            {porcentagemChecklist}% concluído
          </span>
        </div>

        {/* Barra de Progresso do Documento */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--cor-fundo)', border: '1px solid var(--cor-borda-forte)', borderRadius: 'var(--raio-sm)', overflow: 'hidden', marginBottom: '0.85rem' }}>
          <div
            style={{
              width: `${porcentagemChecklist}%`,
              height: '100%',
              backgroundColor: 'var(--cor-primaria)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Lista Interativa de Etapas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {etapasChecklist.map((etapa) => {
            const marcada = Boolean(checklist[etapa.chave]);
            return (
              <button
                key={etapa.chave}
                type="button"
                onClick={() => alternarEtapa(etapa.chave)}
                disabled={bloqueado || salvandoChecklist}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--raio-sm)',
                  border: marcada ? '1.5px solid var(--cor-sucesso-borda)' : '1px solid var(--cor-borda-forte)',
                  backgroundColor: marcada ? 'var(--cor-sucesso-fundo)' : 'var(--cor-superficie)',
                  textAlign: 'left',
                  cursor: bloqueado ? 'not-allowed' : 'pointer',
                  fontSize: '0.84rem',
                  color: marcada ? 'var(--cor-sucesso)' : 'var(--cor-texto-principal)',
                  fontWeight: marcada ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: 'var(--raio-sm)',
                    border: marcada ? 'none' : '1.5px solid var(--cor-borda-forte)',
                    backgroundColor: marcada ? 'var(--cor-primaria)' : 'var(--cor-superficie)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {marcada && <Check size={13} strokeWidth={3} />}
                </div>
                <span>{etapa.rotulo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Registro de Protocolo / Comprovante de Envio */}
      <form
        onSubmit={salvarProtocolo}
        style={{
          borderTop: '1px solid var(--cor-borda)',
          paddingTop: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor={`protocolo_${documento.id}`}
            style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cor-texto-principal)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Hash size={14} />
            <span>Número do Protocolo ou Registro do Envio:</span>
          </label>
          {mensagemSucesso && (
            <span style={{ fontSize: '0.78rem', color: 'var(--cor-sucesso)', fontWeight: 700 }}>
              {mensagemSucesso}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id={`protocolo_${documento.id}`}
            type="text"
            value={protocoloTexto}
            onChange={(e) => setProtocoloTexto(e.target.value)}
            placeholder="Ex: Protocolo nº 2026-UF-9844 / Recibo emitido em 12/03"
            disabled={bloqueado || salvandoProtocolo}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--raio-sm)',
              border: '1.5px solid var(--cor-borda-forte)',
              backgroundColor: 'var(--cor-fundo)',
              color: 'var(--cor-texto-principal)',
            }}
          />
          <button
            type="submit"
            disabled={bloqueado || salvandoProtocolo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--raio-sm)',
              border: '1.5px solid var(--cor-borda-forte)',
              backgroundColor: 'var(--cor-primaria)',
              color: 'var(--cor-fundo)',
              cursor: bloqueado || salvandoProtocolo ? 'not-allowed' : 'pointer',
              boxShadow: '1.5px 1.5px 0px var(--cor-borda-forte)',
            }}
          >
            <Save size={14} />
            <span>{salvandoProtocolo ? 'Salvando...' : 'Salvar Protocolo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
