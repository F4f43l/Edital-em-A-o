import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Botao } from './Botao.jsx';

export function MensagemErro({
  titulo = 'Ocorreu um erro',
  mensagem,
  detalhes = [],
  aoTentarNovamente = null,
}) {
  return (
    <div className="alerta alerta-erro" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <AlertCircle size={20} />
        <strong style={{ fontSize: '1rem' }}>{titulo}</strong>
      </div>

      <p style={{ fontSize: '0.92rem', margin: 0 }}>
        {mensagem || 'Não foi possível completar a operação. Tente novamente mais tarde.'}
      </p>

      {detalhes && detalhes.length > 0 && (
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
          {detalhes.map((d, index) => (
            <li key={index}>
              {d.campo ? <strong>{d.campo}: </strong> : ''}
              {d.mensagem}
            </li>
          ))}
        </ul>
      )}

      {aoTentarNovamente && (
        <div style={{ marginTop: '0.5rem' }}>
          <Botao
            variante="secundario"
            tamanho="sm"
            onClick={aoTentarNovamente}
            icone={<RefreshCw size={14} />}
          >
            Tentar novamente
          </Botao>
        </div>
      )}
    </div>
  );
}

