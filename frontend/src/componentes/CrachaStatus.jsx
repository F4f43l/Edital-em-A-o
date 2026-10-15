import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, MinusCircle, Clock, Check, AlertTriangle } from 'lucide-react';
import {
  ROTULOS_STATUS_CRITERIO,
  ROTULOS_STATUS_TAREFA,
  ROTULOS_PRIORIDADE,
  ROTULOS_RESULTADO_ORIENTATIVO,
} from '../utilitarios/formatadores.js';

export function CrachaStatus({ tipo, valor, tamanho = 'md' }) {
  let texto = valor;
  let variante = 'neutro';
  let icone = null;

  if (tipo === 'criterio') {
    const config = ROTULOS_STATUS_CRITERIO[valor] || { texto: valor, variante: 'neutro' };
    texto = config.texto;
    variante = config.variante;
    if (valor === 'atendido') icone = <CheckCircle2 size={13} />;
    else if (valor === 'nao_atendido') icone = <XCircle size={13} />;
    else if (valor === 'confirmar') icone = <HelpCircle size={13} />;
    else icone = <MinusCircle size={13} />;
  } else if (tipo === 'resultado_orientativo') {
    const config = ROTULOS_RESULTADO_ORIENTATIVO[valor] || { texto: valor, variante: 'neutro' };
    texto = config.texto;
    variante = config.variante;
    if (valor === 'possivel_compatibilidade') icone = <CheckCircle2 size={14} />;
    else if (valor === 'criterios_incompativeis') icone = <XCircle size={14} />;
    else if (valor === 'faltam_informacoes') icone = <AlertTriangle size={14} />;
  } else if (tipo === 'tarefa') {
    const config = ROTULOS_STATUS_TAREFA[valor] || { texto: valor, variante: 'neutro' };
    texto = config.texto;
    variante = config.variante;
    if (valor === 'concluida') icone = <Check size={13} />;
    else if (valor === 'em_andamento') icone = <Clock size={13} />;
    else if (valor === 'nao_se_aplica') icone = <MinusCircle size={13} />;
    else icone = <AlertTriangle size={13} />;
  } else if (tipo === 'prioridade') {
    const config = ROTULOS_PRIORIDADE[valor] || { texto: valor, variante: 'neutro' };
    texto = config.texto;
    variante = config.variante;
  } else if (tipo === 'edital_status') {
    if (valor === 'ativo') {
      texto = 'Ativo';
      variante = 'sucesso';
      icone = <CheckCircle2 size={13} />;
    } else if (valor === 'rascunho') {
      texto = 'Rascunho';
      variante = 'neutro';
    } else if (valor === 'encerrado') {
      texto = 'Encerrado';
      variante = 'perigo';
      icone = <XCircle size={13} />;
    } else {
      texto = 'Arquivado';
      variante = 'neutro';
    }
  }

  const classesVariante = {
    sucesso: 'cracha-sucesso',
    atencao: 'cracha-atencao',
    perigo: 'cracha-perigo',
    info: 'cracha-info',
    neutro: 'cracha-neutro',
  }[variante] || 'cracha-neutro';

  return (
    <span className={`cracha ${classesVariante}`}>
      {icone}
      <span>{texto}</span>
    </span>
  );
}


