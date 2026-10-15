import React from 'react';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import { formatarDataPtBr, calcularDiasRestantes } from '../utilitarios/formatadores.js';

export function CrachaPrazo({ dataIso }) {
  if (!dataIso) {
    return (
      <span className="cracha cracha-neutro" title="Prazo não informado no documento">
        <Calendar size={13} />
        <span>Sem prazo fixado</span>
      </span>
    );
  }

  const dataFormatada = formatarDataPtBr(dataIso);
  const diasRestantes = calcularDiasRestantes(dataIso);

  if (diasRestantes !== null && diasRestantes < 0) {
    return (
      <span className="cracha cracha-perigo" title={`Prazo final expirou em ${dataFormatada}`}>
        <AlertCircle size={13} />
        <span>Expirado ({dataFormatada})</span>
      </span>
    );
  }

  if (diasRestantes === 0) {
    return (
      <span className="cracha cracha-atencao" title="Último dia para submissão!">
        <Clock size={13} />
        <span>Encerra hoje! ({dataFormatada})</span>
      </span>
    );
  }

  if (diasRestantes !== null && diasRestantes <= 5) {
    return (
      <span className="cracha cracha-atencao" title={`Faltam apenas ${diasRestantes} dias`}>
        <Clock size={13} />
        <span>{dataFormatada} ({diasRestantes}d restantes)</span>
      </span>
    );
  }

  return (
    <span className="cracha cracha-info">
      <Calendar size={13} />
      <span>{dataFormatada}</span>
    </span>
  );
}


