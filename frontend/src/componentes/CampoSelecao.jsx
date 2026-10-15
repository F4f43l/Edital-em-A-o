import React from 'react';

export function CampoSelecao({
  id,
  rotulo,
  dica,
  erro,
  opcoes = [],
  obrigatorio = false,
  valor,
  aoMudar,
  placeholder = 'Selecione uma opção...',
  ...props
}) {
  const identificador = id || `campo_selecao_${rotulo ? rotulo.toLowerCase().replace(/\s+/g, '_') : 'selecao'}`;

  return (
    <div className="grupo-campo">
      {rotulo && (
        <label htmlFor={identificador} className="rotulo-campo">
          {rotulo}
          {obrigatorio && <span style={{ color: 'var(--cor-erro)', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      {dica && <span className="dica-campo">{dica}</span>}

      <select
        id={identificador}
        value={valor ?? ''}
        onChange={aoMudar}
        className="entrada-selecao"
        style={{ borderColor: erro ? 'var(--cor-erro)' : undefined }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((opcao) => {
          const valorOpcao = typeof opcao === 'object' ? opcao.valor : opcao;
          const rotuloOpcao = typeof opcao === 'object' ? opcao.rotulo : opcao;
          return (
            <option key={valorOpcao} value={valorOpcao}>
              {rotuloOpcao}
            </option>
          );
        })}
      </select>

      {erro && (
        <span style={{ fontSize: '0.8rem', color: 'var(--cor-erro)', marginTop: '0.2rem' }}>
          {erro}
        </span>
      )}
    </div>
  );
}
