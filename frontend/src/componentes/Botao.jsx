import React from 'react';
import { Loader2 } from 'lucide-react';

export function Botao({
  children,
  variante = 'primario',
  tamanho = 'md',
  carregando = false,
  icone = null,
  disabled = false,
  className = '',
  tipo = 'button',
  onClick,
  ...props
}) {
  const classesVariante = {
    primario: 'botao-primario',
    secundario: 'botao-secundario',
    perigo: 'botao-perigo',
    destaque: 'botao-destaque',
  }[variante] || 'botao-primario';

  const classesTamanho = {
    sm: 'botao-sm',
    md: '',
    lg: 'botao-lg',
  }[tamanho] || '';

  return (
    <button
      type={tipo}
      disabled={disabled || carregando}
      onClick={onClick}
      className={`botao ${classesVariante} ${classesTamanho} ${className}`.trim()}
      {...props}
    >
      {carregando ? (
        <>
          <Loader2 size={16} className="icone-girando" />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {icone && <span className="botao-icone">{icone}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
