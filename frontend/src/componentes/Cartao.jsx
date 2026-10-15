import React from 'react';

export function Cartao({
  children,
  titulo,
  subtitulo,
  acoes,
  interativo = false,
  className = '',
  ...props
}) {
  return (
    <div className={`cartao ${interativo ? 'cartao-interativo' : ''} ${className}`.trim()} {...props}>
      {(titulo || subtitulo || acoes) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
          <div>
            {titulo && <h3 style={{ fontSize: '1.15rem', marginBottom: subtitulo ? '0.2rem' : 0 }}>{titulo}</h3>}
            {subtitulo && <p style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)' }}>{subtitulo}</p>}
          </div>
          {acoes && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{acoes}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
