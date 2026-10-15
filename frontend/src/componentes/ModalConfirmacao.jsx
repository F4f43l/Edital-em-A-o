import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Botao } from './Botao.jsx';

export function ModalConfirmacao({
  aberto,
  titulo = 'Confirmar Exclusão',
  nomeItem,
  mensagem = 'Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.',
  avisoDependencias = null,
  aoConfirmar,
  aoCancelar,
  carregando = false,
}) {
  useEffect(() => {
    function lidarComTeclaEsc(evento) {
      if (evento.key === 'Escape' && aberto && !carregando) {
        aoCancelar();
      }
    }
    window.addEventListener('keydown', lidarComTeclaEsc);
    return () => window.removeEventListener('keydown', lidarComTeclaEsc);
  }, [aberto, carregando, aoCancelar]);

  if (!aberto) return null;

  return (
    <div className="sobreposicao-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
      <div className="conteudo-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ color: 'var(--cor-erro)', display: 'flex' }}>
              <AlertTriangle size={24} />
            </div>
            <h2 id="titulo-modal" style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)' }}>
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={aoCancelar}
            disabled={carregando}
            aria-label="Fechar modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--cor-texto-secundario)',
              padding: '0.2rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--cor-texto-principal)' }}>
          <p style={{ marginBottom: '0.75rem' }}>{mensagem}</p>
          {nomeItem && (
            <div
              style={{
                backgroundColor: '#f3f4f6',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--raio-md)',
                fontWeight: 600,
                color: 'var(--cor-primaria)',
                wordBreak: 'break-word',
                marginBottom: '0.75rem',
              }}
            >
              « {nomeItem} »
            </div>
          )}

          {avisoDependencias && (
            <div className="alerta alerta-atencao" style={{ marginTop: '0.75rem', fontSize: '0.88rem' }}>
              <div>{avisoDependencias}</div>
            </div>
          )}
        </div>

        <div className="acoes-modal">
          <Botao variante="secundario" onClick={aoCancelar} disabled={carregando}>
            Cancelar
          </Botao>
          <Botao variante="perigo" onClick={aoConfirmar} carregando={carregando}>
            Confirmar e Excluir
          </Botao>
        </div>
      </div>
    </div>
  );
}

