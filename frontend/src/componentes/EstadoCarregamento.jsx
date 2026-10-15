import React from 'react';
import { Loader2 } from 'lucide-react';

export function EstadoCarregamento({ mensagem = 'Carregando dados...' }) {
  return (
    <div className="estado-container" style={{ minHeight: '220px' }}>
      <Loader2 size={36} className="icone-girando" style={{ marginBottom: '1rem' }} />
      <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem' }}>{mensagem}</p>
    </div>
  );
}
