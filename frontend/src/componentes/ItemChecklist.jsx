import React, { useState } from 'react';
import {
  Check,
  Clock,
  Trash2,
  Edit3,
  Link2,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smartphone,
  FileCheck,
  Building,
} from 'lucide-react';
import { CrachaStatus } from './CrachaStatus.jsx';
import { CrachaPrazo } from './CrachaPrazo.jsx';

export function ItemChecklist({
  tarefa,
  aoAlternar,
  aoMudarStatus,
  aoEditar,
  aoExcluir,
  bloqueado = false,
}) {
  const [mostrarDetalhesDoc, setMostrarDetalhesDoc] = useState(false);
  const concluida = tarefa.status === 'concluida';

  return (
    <div
      className="cartao"
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        backgroundColor: concluida ? 'var(--cor-fundo)' : 'var(--cor-superficie)',
        border: '1px solid var(--cor-borda-forte)',
        borderRadius: 'var(--raio-sm)',
        boxShadow: 'var(--sombra-plana-sm)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Botão de Checkbox Customizado */}
      <button
        type="button"
        onClick={() => aoAlternar(tarefa)}
        disabled={bloqueado}
        aria-label={concluida ? 'Marcar tarefa como pendente' : 'Marcar tarefa como concluída'}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '2px',
          border: '2px solid var(--cor-primaria)',
          backgroundColor: concluida ? 'var(--cor-primaria)' : 'var(--cor-superficie)',
          color: 'var(--cor-fundo)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: bloqueado ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          marginTop: '3px',
          transition: 'all 0.15s ease',
        }}
      >
        {concluida && <Check size={16} strokeWidth={3} />}
      </button>

      {/* Conteúdo da Tarefa */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <h4
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--fonte-titulos)',
              color: concluida ? 'var(--cor-texto-mutado)' : 'var(--cor-primaria)',
              textDecoration: concluida ? 'line-through' : 'none',
              wordBreak: 'break-word',
            }}
          >
            {tarefa.titulo}
          </h4>

          <CrachaStatus tipo="prioridade" valor={tarefa.prioridade} />

          {/* Seletor Rápido de Status Diretamente no Card */}
          {aoMudarStatus ? (
            <select
              value={tarefa.status}
              onChange={(e) => aoMudarStatus(tarefa, e.target.value)}
              disabled={bloqueado}
              title="Alterar status desta atividade"
              aria-label="Alteração rápida de status da atividade"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'var(--fonte-mono)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--cor-borda-forte)',
                backgroundColor:
                  tarefa.status === 'concluida'
                    ? 'var(--cor-sucesso-fundo)'
                    : tarefa.status === 'em_andamento'
                    ? 'var(--cor-info-fundo)'
                    : tarefa.status === 'bloqueada'
                    ? 'var(--cor-erro-fundo)'
                    : tarefa.status === 'nao_se_aplica'
                    ? 'var(--cor-borda-suave)'
                    : 'var(--cor-atencao-fundo)',
                color:
                  tarefa.status === 'concluida'
                    ? 'var(--cor-sucesso)'
                    : tarefa.status === 'em_andamento'
                    ? 'var(--cor-info)'
                    : tarefa.status === 'bloqueada'
                    ? 'var(--cor-erro)'
                    : tarefa.status === 'nao_se_aplica'
                    ? 'var(--cor-texto-mutado)'
                    : 'var(--cor-atencao)',
                cursor: bloqueado ? 'not-allowed' : 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <option value="pendente">⏳ Pendente</option>
              <option value="em_andamento">🔄 Em andamento</option>
              <option value="concluida">✅ Concluída</option>
              <option value="bloqueada">🚫 Bloqueada</option>
              <option value="nao_se_aplica">⚪ Não se aplica</option>
            </select>
          ) : (
            tarefa.status !== 'concluida' && <CrachaStatus tipo="tarefa" valor={tarefa.status} />
          )}
        </div>

        {tarefa.descricao && (
          <p
            style={{
              fontSize: '0.88rem',
              color: concluida ? 'var(--cor-texto-mutado)' : 'var(--cor-texto-secundario)',
              marginBottom: '0.65rem',
              whiteSpace: 'pre-line',
            }}
          >
            {tarefa.descricao}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
          <CrachaPrazo dataIso={tarefa.data_limite} />

          {tarefa.edital_titulo && (
            <span style={{ color: 'var(--cor-texto-mutado)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Link2 size={13} />
              <span>{tarefa.edital_titulo}</span>
            </span>
          )}

          {tarefa.requisito_titulo && (
            <span style={{ color: 'var(--cor-primaria)', fontWeight: 600, fontStyle: 'italic' }}>
              Requisito: {tarefa.requisito_titulo}
            </span>
          )}

          {tarefa.documento_id && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--raio-sm)',
                backgroundColor: 'var(--cor-fundo)',
                color: 'var(--cor-primaria)',
                fontWeight: 600,
                fontSize: '0.76rem',
                fontFamily: 'var(--fonte-mono)',
                border: '1px solid var(--cor-borda-forte)',
              }}
            >
              <FileText size={12} />
              <span>Doc: {tarefa.documento_nome_simples || tarefa.documento_nome}</span>
            </span>
          )}
        </div>

        {/* Tutorial & Orientações Práticas do Documento Vinculado */}
        {tarefa.documento_id && (
          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMostrarDetalhesDoc(!mostrarDetalhesDoc)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--cor-borda-forte)',
                backgroundColor: mostrarDetalhesDoc ? 'var(--cor-fundo)' : 'var(--cor-superficie)',
                boxShadow: 'var(--sombra-plana-sm)',
                color: 'var(--cor-primaria)',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'var(--fonte-titulos)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <FileCheck size={14} />
              <span>
                {mostrarDetalhesDoc
                  ? 'Ocultar orientações detalhadas'
                  : '📋 Ver passo a passo completo (Como obter, preparar e entregar)'}
              </span>
              {mostrarDetalhesDoc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {mostrarDetalhesDoc && (
              <div
                style={{
                  marginTop: '0.65rem',
                  padding: '0.85rem',
                  backgroundColor: 'var(--cor-fundo)',
                  border: '1px solid var(--cor-borda-forte)',
                  borderRadius: 'var(--raio-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  fontSize: '0.84rem',
                }}
              >
                {tarefa.documento_como_obter && (
                  <div>
                    <strong style={{ color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.15rem' }}>
                      🏢 Onde e como obter:
                    </strong>
                    <span style={{ color: 'var(--cor-texto-secundario)', lineHeight: 1.4 }}>
                      {tarefa.documento_orgao_emissor ? `[${tarefa.documento_orgao_emissor}] ` : ''}
                      {tarefa.documento_como_obter}
                    </span>
                    {tarefa.documento_link_fonte_oficial && (
                      <div style={{ marginTop: '0.3rem' }}>
                        <a
                          href={tarefa.documento_link_fonte_oficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.78rem',
                            color: 'var(--cor-primaria)',
                            fontWeight: 700,
                            textDecoration: 'underline',
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Acessar portal oficial de emissão</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {tarefa.documento_instrucoes_preparacao && (
                  <div style={{ backgroundColor: 'var(--cor-superficie)', padding: '0.6rem', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda-forte)' }}>
                    <strong style={{ color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.15rem' }}>
                      📋 Como preparar e conferir:
                    </strong>
                    <span style={{ color: 'var(--cor-texto-secundario)', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                      {tarefa.documento_instrucoes_preparacao}
                    </span>
                  </div>
                )}

                {tarefa.documento_como_digitalizar && (
                  <div style={{ backgroundColor: 'var(--cor-fundo)', padding: '0.6rem', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda-forte)', borderLeft: '4px solid var(--cor-secundaria)' }}>
                    <strong style={{ color: 'var(--cor-primaria)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.15rem' }}>
                      <Smartphone size={14} />
                      <span>Tutorial para digitalizar no celular:</span>
                    </strong>
                    <span style={{ color: 'var(--cor-texto-principal)', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                      {tarefa.documento_como_digitalizar}
                    </span>
                  </div>
                )}

                {tarefa.documento_local_entrega && (
                  <div>
                    <strong style={{ color: 'var(--cor-primaria)', display: 'block', marginBottom: '0.15rem' }}>
                      📬 Canal oficial de entrega:
                    </strong>
                    <span style={{ color: 'var(--cor-texto-secundario)' }}>
                      {tarefa.documento_local_entrega}
                    </span>
                    {tarefa.documento_url_entrega && (
                      <div style={{ marginTop: '0.2rem' }}>
                        <a
                          href={tarefa.documento_url_entrega}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.78rem',
                            color: 'var(--cor-secundaria)',
                            fontWeight: 600,
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Link do sistema de envio</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ações da Tarefa */}
      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
        {aoEditar && (
          <button
            type="button"
            onClick={() => aoEditar(tarefa)}
            title="Editar tarefa"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.4rem',
              color: 'var(--cor-texto-secundario)',
              cursor: 'pointer',
              borderRadius: 'var(--raio-sm)',
            }}
          >
            <Edit3 size={16} />
          </button>
        )}
        {aoExcluir && (
          <button
            type="button"
            onClick={() => aoExcluir(tarefa)}
            title="Excluir tarefa"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.4rem',
              color: 'var(--cor-erro)',
              cursor: 'pointer',
              borderRadius: 'var(--raio-sm)',
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

