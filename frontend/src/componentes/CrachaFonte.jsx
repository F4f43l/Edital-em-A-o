import React from 'react';
import { BookOpen, Globe, Lightbulb, HelpCircle, AlertTriangle } from 'lucide-react';
import { ROTULOS_CLASSIFICACAO_FONTE } from '../utilitarios/formatadores.js';

export function CrachaFonte({
  classificacao = 'confirmado_edital',
  secao = null,
  pagina = null,
  linkOficial = null,
  dataVerificacao = null,
}) {
  const config = ROTULOS_CLASSIFICACAO_FONTE[classificacao] || ROTULOS_CLASSIFICACAO_FONTE.confirmado_edital;

  const obterIcone = () => {
    switch (classificacao) {
      case 'confirmado_edital':
        return <BookOpen size={13} />;
      case 'confirmado_outra_fonte':
        return <Globe size={13} />;
      case 'recomendacao_organizacao':
        return <Lightbulb size={13} />;
      case 'nao_localizado':
        return <HelpCircle size={13} />;
      case 'ambiguo_pendente':
        return <AlertTriangle size={13} />;
      default:
        return <BookOpen size={13} />;
    }
  };

  return (
    <span
      title={config.descricao}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--raio-full)',
        fontSize: '0.74rem',
        fontWeight: 600,
        backgroundColor: config.fundo,
        color: config.cor,
        border: `1px solid ${config.borda}`,
        lineHeight: 1.2,
      }}
    >
      {obterIcone()}
      <span>{config.texto}</span>
      {secao && <span style={{ opacity: 0.85, fontWeight: 500 }}>({secao}{pagina ? `, pág. ${pagina}` : ''})</span>}
      {linkOficial && (
        <a
          href={linkOficial}
          target="_blank"
          rel="noopener noreferrer"
          title={`Acessar fonte oficial: ${linkOficial}`}
          style={{
            marginLeft: '0.2rem',
            color: 'inherit',
            textDecoration: 'underline',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ↗
        </a>
      )}
    </span>
  );
}
