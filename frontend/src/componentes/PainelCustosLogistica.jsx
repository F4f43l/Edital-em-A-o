import React from 'react';
import {
  DollarSign,
  Gift,
  MapPin,
  Calendar,
  Clock,
  Compass,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Cartao } from './Cartao.jsx';
import { CampoTexto } from './CampoTexto.jsx';
import { CampoSelecao } from './CampoSelecao.jsx';

export function PainelCustosLogistica({
  custosLogistica,
  editavel = false,
  aoMudarCampo,
}) {
  if (!custosLogistica && !editavel) {
    return (
      <div className="alerta alerta-info" style={{ margin: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={18} />
          <span>Nenhuma informação de custos e logística foi registrada para este edital.</span>
        </div>
      </div>
    );
  }

  const dados = custosLogistica || {};
  const taxa = dados.taxa_inscricao || {};
  const isencao = dados.isencao || {};
  const etapa = dados.etapa_presencial || {};
  const outros = dados.outros_custos || {};

  const valorTaxaLimpo = taxa.valor || 'Não identificado no edital';
  const ehGratuito =
    taxa.possui_taxa === false ||
    String(valorTaxaLimpo).toLowerCase().includes('gratuito') ||
    String(valorTaxaLimpo).toLowerCase().includes('isento');

  const possuiIsencao = isencao.possui_isencao;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Banner de Conformidade ODS 10 e Factualidade */}
      <div
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--raio-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          fontSize: '0.86rem',
          color: '#166534',
        }}
      >
        <Compass size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Transparência em Custos e Logística (ODS 10):</strong> Todas as informações abaixo foram extraídas
          exclusivamente das cláusulas do edital. Informações não expressas no texto permanecem como{' '}
          <em>«Não identificado no edital»</em>, evitando presunções indevidas.
        </div>
      </div>

      {/* Grid de 4 Cards Informativos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* CARD 1: Taxa de Inscrição & Pagamento */}
        <div
          style={{
            border: '1px solid var(--cor-borda)',
            borderRadius: 'var(--raio-md)',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: 'var(--sombra-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--raio-sm)',
                  backgroundColor: ehGratuito ? 'var(--cor-sucesso-fundo)' : '#e0f2fe',
                  color: ehGratuito ? 'var(--cor-sucesso)' : 'var(--cor-info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--cor-primaria)' }}>Taxa de Inscrição</h3>
            </div>

            <span
              className={`cracha ${
                ehGratuito
                  ? 'cracha-sucesso'
                  : taxa.possui_taxa
                  ? 'cracha-info'
                  : 'cracha-neutro'
              }`}
            >
              {ehGratuito ? 'Gratuito' : taxa.possui_taxa ? 'Cobrança Prevista' : 'Não Identificado'}
            </span>
          </div>

          {editavel ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <CampoTexto
                id="edit_taxa_valor"
                rotulo="Valor da Taxa"
                valor={taxa.valor || ''}
                aoMudar={(e) => aoMudarCampo('taxa_inscricao', 'valor', e.target.value)}
                placeholder="Ex: Gratuito ou R$ 85,00"
              />
              <CampoTexto
                id="edit_taxa_prazo"
                rotulo="Prazo de Pagamento"
                valor={taxa.prazo_pagamento || ''}
                aoMudar={(e) => aoMudarCampo('taxa_inscricao', 'prazo_pagamento', e.target.value)}
                placeholder="Ex: Até 25/11/2026"
              />
              <CampoTexto
                id="edit_taxa_instrucoes"
                rotulo="Instruções / Forma de Pagamento"
                valor={taxa.instrucoes_pagamento || ''}
                aoMudar={(e) => aoMudarCampo('taxa_inscricao', 'instrucoes_pagamento', e.target.value)}
                placeholder="Ex: Boleto bancário no Banco do Brasil ou PIX"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Valor da Inscrição:
                </span>
                <strong
                  style={{
                    fontSize: '1.15rem',
                    color: ehGratuito ? 'var(--cor-sucesso)' : 'var(--cor-primaria)',
                  }}
                >
                  {taxa.valor || 'Não identificado no edital'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Prazo de Pagamento:
                </span>
                <span style={{ color: 'var(--cor-texto-principal)', fontWeight: 500 }}>
                  {taxa.prazo_pagamento || 'Não identificado no edital'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Forma e Instruções de Pagamento:
                </span>
                <span style={{ color: 'var(--cor-texto-secundario)' }}>
                  {taxa.instrucoes_pagamento || 'Não identificado no edital'}
                </span>
              </div>

              {taxa.trecho_evidencia && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--raio-sm)',
                    borderLeft: '3px solid var(--cor-secundaria)',
                    fontSize: '0.78rem',
                    color: 'var(--cor-texto-secundario)',
                    fontStyle: 'italic',
                  }}
                >
                  « {taxa.trecho_evidencia} »
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 2: Isenção de Taxa */}
        <div
          style={{
            border: '1px solid var(--cor-borda)',
            borderRadius: 'var(--raio-md)',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: 'var(--sombra-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--raio-sm)',
                  backgroundColor: '#fef3c7',
                  color: 'var(--cor-atencao)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Gift size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--cor-primaria)' }}>Isenção de Taxa</h3>
            </div>

            <span
              className={`cracha ${
                possuiIsencao === true
                  ? 'cracha-sucesso'
                  : possuiIsencao === false
                  ? 'cracha-neutro'
                  : 'cracha-atencao'
              }`}
            >
              {possuiIsencao === true
                ? 'Isenção Prevista'
                : possuiIsencao === false
                ? 'Sem Isenção / Gratuito'
                : 'Não Identificado'}
            </span>
          </div>

          {editavel ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <CampoTexto
                id="edit_isencao_prazo"
                rotulo="Prazo para Solicitar Isenção"
                valor={isencao.prazo_solicitacao || ''}
                aoMudar={(e) => aoMudarCampo('isencao', 'prazo_solicitacao', e.target.value)}
                placeholder="Ex: De 01/11 a 05/11/2026"
              />
              <CampoTexto
                id="edit_isencao_regras"
                rotulo="Regras e Critérios de Isenção"
                multilinha
                rows={2}
                valor={isencao.regras_isencao || ''}
                aoMudar={(e) => aoMudarCampo('isencao', 'regras_isencao', e.target.value)}
                placeholder="Ex: Inscritos no CadÚnico ou doadores de medula óssea"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Prazo para Pedido de Isenção:
                </span>
                <span style={{ color: 'var(--cor-texto-principal)', fontWeight: 600 }}>
                  {isencao.prazo_solicitacao || 'Não identificado no edital'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Regras e Condições de Isenção:
                </span>
                <span style={{ color: 'var(--cor-texto-secundario)' }}>
                  {isencao.regras_isencao || 'Não identificado no edital'}
                </span>
              </div>

              {isencao.trecho_evidencia && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--raio-sm)',
                    borderLeft: '3px solid var(--cor-secundaria)',
                    fontSize: '0.78rem',
                    color: 'var(--cor-texto-secundario)',
                    fontStyle: 'italic',
                  }}
                >
                  « {isencao.trecho_evidencia} »
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 3: Etapa Presencial & Local de Prova */}
        <div
          style={{
            border: '1px solid var(--cor-borda)',
            borderRadius: 'var(--raio-md)',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: 'var(--sombra-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--raio-sm)',
                  backgroundColor: '#ede9fe',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--cor-primaria)' }}>Etapa / Prova</h3>
            </div>

            <span className="cracha cracha-neutro">
              {etapa.modalidade || 'Não identificado'}
            </span>
          </div>

          {editavel ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <CampoTexto
                id="edit_etapa_modalidade"
                rotulo="Modalidade da Etapa/Prova"
                valor={etapa.modalidade || ''}
                aoMudar={(e) => aoMudarCampo('etapa_presencial', 'modalidade', e.target.value)}
                placeholder="Ex: Presencial, Online/Remota ou Sem Prova"
              />
              <CampoTexto
                id="edit_etapa_data_horario"
                rotulo="Data e Horário"
                valor={etapa.data_horario || ''}
                aoMudar={(e) => aoMudarCampo('etapa_presencial', 'data_horario', e.target.value)}
                placeholder="Ex: 15/12/2026 às 13:00"
              />
              <CampoTexto
                id="edit_etapa_cidade"
                rotulo="Cidade de Realização"
                valor={etapa.cidade || ''}
                aoMudar={(e) => aoMudarCampo('etapa_presencial', 'cidade', e.target.value)}
                placeholder="Ex: São Paulo/SP"
              />
              <CampoTexto
                id="edit_etapa_endereco"
                rotulo="Local / Endereço da Prova"
                valor={etapa.endereco || ''}
                aoMudar={(e) => aoMudarCampo('etapa_presencial', 'endereco', e.target.value)}
                placeholder="Ex: Campus Central, Bloco B, Sala 102"
              />
              <CampoTexto
                id="edit_etapa_deslocamento"
                rotulo="Avaliação de Deslocamento"
                valor={etapa.exige_deslocamento || ''}
                aoMudar={(e) => aoMudarCampo('etapa_presencial', 'exige_deslocamento', e.target.value)}
                placeholder="Ex: Não determinado com as informações disponíveis no edital."
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Data e Horário:
                </span>
                <span style={{ color: 'var(--cor-texto-principal)', fontWeight: 600 }}>
                  {etapa.data_horario || 'Não identificado no edital'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Cidade e Local de Realização:
                </span>
                <span style={{ color: 'var(--cor-texto-principal)' }}>
                  {etapa.cidade !== 'Não identificado no edital' || etapa.endereco !== 'Não identificado no edital' ? (
                    <>
                      <strong>{etapa.cidade || 'Cidade não indicada'}</strong>
                      {etapa.endereco && etapa.endereco !== 'Não identificado no edital' && (
                        <span> — {etapa.endereco}</span>
                      )}
                    </>
                  ) : (
                    'Não identificado no edital'
                  )}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Necessidade de Deslocamento:
                </span>
                <span style={{ color: 'var(--cor-secundaria)', fontWeight: 500, fontSize: '0.84rem' }}>
                  {etapa.exige_deslocamento || 'Não determinado com as informações disponíveis no edital.'}
                </span>
              </div>

              {etapa.trecho_evidencia && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--raio-sm)',
                    borderLeft: '3px solid var(--cor-secundaria)',
                    fontSize: '0.78rem',
                    color: 'var(--cor-texto-secundario)',
                    fontStyle: 'italic',
                  }}
                >
                  « {etapa.trecho_evidencia} »
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 4: Outros Custos & Informações Logísticas */}
        <div
          style={{
            border: '1px solid var(--cor-borda)',
            borderRadius: 'var(--raio-md)',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: 'var(--sombra-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--raio-sm)',
                  backgroundColor: '#fee2e2',
                  color: 'var(--cor-erro)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--cor-primaria)' }}>Outros Custos & Logística</h3>
            </div>
          </div>

          {editavel ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <CampoTexto
                id="edit_outros_descricao"
                rotulo="Descrição de Outros Custos / Despesas"
                multilinha
                rows={3}
                valor={outros.descricao || ''}
                aoMudar={(e) => aoMudarCampo('outros_custos', 'descricao', e.target.value)}
                placeholder="Ex: Despesas com transporte, alimentação ou materiais por conta do candidato"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Despesas e Logística Adicionais:
                </span>
                <span style={{ color: 'var(--cor-texto-secundario)', lineHeight: 1.5 }}>
                  {outros.descricao || 'Não identificado no edital'}
                </span>
              </div>

              {outros.trecho_evidencia && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--raio-sm)',
                    borderLeft: '3px solid var(--cor-secundaria)',
                    fontSize: '0.78rem',
                    color: 'var(--cor-texto-secundario)',
                    fontStyle: 'italic',
                  }}
                >
                  « {outros.trecho_evidencia} »
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
