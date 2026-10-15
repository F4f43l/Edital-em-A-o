import React from 'react';
import { Inbox } from 'lucide-react';
import { Botao } from './Botao.jsx';

export function EstadoVazio({
  titulo = 'Nenhum item encontrado',
  descricao = 'Não há registros para exibir no momento.',
  icone = null,
  textoAcao = null,
  aoClicarAcao = null,
}) {
  return (
    <div className="estado-container cartao" style={{ margin: '1.5rem 0' }}>
      <div style={{ color: 'var(--cor-texto-mutado)', marginBottom: '1rem' }}>
        {icone || <Inbox size={48} strokeWidth={1.5} />}
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--cor-primaria)', marginBottom: '0.4rem' }}>
        {titulo}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)', maxWidth: '420px', marginBottom: textoAcao ? '1.5rem' : 0 }}>
        {descricao}
      </p>
      {textoAcao && aoClicarAcao && (
        <Botao variante="primario" onClick={aoClicarAcao}>
          {textoAcao}
        </Botao>
      )}
    </div>
  );
}

