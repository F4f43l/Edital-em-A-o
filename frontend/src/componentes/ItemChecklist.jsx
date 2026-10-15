import React from 'react';
import { Check, Clock, Trash2, Edit3, Link2 } from 'lucide-react';
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
        backgroundColor: concluida ? '#f9fafb' : '#ffffff',
        borderColor: concluida ? '#e5e7eb' : 'var(--cor-borda)',
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
          borderRadius: '6px',
          border: concluida ? 'none' : '2px solid var(--cor-borda-foco)',
          backgroundColor: concluida ? 'var(--cor-secundaria)' : '#ffffff',
          color: '#ffffff',
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
              fontWeight: 600,
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
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--raio-full)',
                border: '1px solid var(--cor-borda)',
                backgroundColor:
                  tarefa.status === 'concluida'
                    ? 'var(--cor-sucesso-fundo)'
                    : tarefa.status === 'em_andamento'
                    ? 'var(--cor-info-fundo)'
                    : tarefa.status === 'bloqueada'
                    ? 'var(--cor-erro-fundo)'
                    : tarefa.status === 'nao_se_aplica'
                    ? '#f3f4f6'
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
            <span style={{ color: 'var(--cor-secundaria)', fontStyle: 'italic' }}>
              Requisito: {tarefa.requisito_titulo}
            </span>
          )}
        </div>
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

