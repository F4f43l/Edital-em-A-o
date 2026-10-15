import React from 'react';

export function CampoTexto({
  id,
  rotulo,
  dica,
  erro,
  tipo = 'text',
  multilinha = false,
  obrigatorio = false,
  valor,
  aoMudar,
  placeholder,
  ...props
}) {
  const identificador = id || `campo_${rotulo ? rotulo.toLowerCase().replace(/\s+/g, '_') : 'texto'}`;

  return (
    <div className="grupo-campo">
      {rotulo && (
        <label htmlFor={identificador} className="rotulo-campo">
          {rotulo}
          {obrigatorio && <span style={{ color: 'var(--cor-erro)', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      {dica && <span className="dica-campo">{dica}</span>}

      {multilinha ? (
        <textarea
          id={identificador}
          value={valor ?? ''}
          onChange={aoMudar}
          placeholder={placeholder}
          className="entrada-area-texto"
          style={{ borderColor: erro ? 'var(--cor-erro)' : undefined }}
          {...props}
        />
      ) : (
        <input
          id={identificador}
          type={tipo}
          value={valor ?? ''}
          onChange={aoMudar}
          placeholder={placeholder}
          className="entrada-texto"
          style={{ borderColor: erro ? 'var(--cor-erro)' : undefined }}
          {...props}
        />
      )}

      {erro && (
        <span style={{ fontSize: '0.8rem', color: 'var(--cor-erro)', marginTop: '0.2rem' }}>
          {erro}
        </span>
      )}
    </div>
  );
}
