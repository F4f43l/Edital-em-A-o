import React, { useState, useMemo } from 'react';
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
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Tag,
} from 'lucide-react';
import { Cartao } from './Cartao.jsx';
import { CampoTexto } from './CampoTexto.jsx';
import { CampoSelecao } from './CampoSelecao.jsx';

export function PainelCustosLogistica({
  custosLogistica,
  editavel = false,
  aoMudarCampo,
}) {
  const [filtroCargo, setFiltroCargo] = useState('');
  const [tabelaExpandida, setTabelaExpandida] = useState(false);

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

  // Tabela de taxas detalhadas (se houver variação por cargo/nível)
  const listaTabelaTaxas = Array.isArray(taxa.tabela_taxas) ? taxa.tabela_taxas : [];
  const resumoNiveis = taxa.resumo_niveis && typeof taxa.resumo_niveis === 'object' ? taxa.resumo_niveis : null;

  const taxasFiltradas = useMemo(() => {
    if (!filtroCargo.trim()) return listaTabelaTaxas;
    const termo = filtroCargo.toLowerCase();
    return listaTabelaTaxas.filter(
      (item) =>
        (item.cargo && item.cargo.toLowerCase().includes(termo)) ||
        (item.nivel && item.nivel.toLowerCase().includes(termo)) ||
        (item.valor && item.valor.toLowerCase().includes(termo))
    );
  }, [listaTabelaTaxas, filtroCargo]);

  const itensExibidos = tabelaExpandida || filtroCargo.trim() ? taxasFiltradas : taxasFiltradas.slice(0, 8);

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
          exclusivamente das cláusulas, tabelas e anexos do edital. Informações não expressas no texto permanecem como{' '}
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

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {taxa.pagina_origem && (
                <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                  Pág. {taxa.pagina_origem}
                </span>
              )}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              {/* Destaque para o perfil do candidato se definido */}
              {taxa.taxa_perfil_candidato && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--raio-sm)',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Tag size={16} color="var(--cor-info)" />
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#1e40af', display: 'block' }}>
                      Taxa aplicável ao seu perfil:
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#1e3a8a' }}>
                      {taxa.taxa_perfil_candidato}
                    </strong>
                  </div>
                </div>
              )}

              <div>
                <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                  Valor da Inscrição:
                </span>
                <strong
                  style={{
                    fontSize: '1.08rem',
                    color: ehGratuito ? 'var(--cor-sucesso)' : 'var(--cor-primaria)',
                    lineHeight: 1.4,
                    display: 'block',
                  }}
                >
                  {taxa.valor || 'Não identificado no edital'}
                </strong>
              </div>

              {/* Resumo por escolaridade / nível */}
              {resumoNiveis && Object.keys(resumoNiveis).length > 0 && (
                <div style={{ marginTop: '0.2rem' }}>
                  <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    Valores por Escolaridade / Categoria:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {Object.entries(resumoNiveis).map(([nivel, v]) => (
                      <span
                        key={nivel}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 'var(--raio-sm)',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.76rem',
                          color: '#334155',
                          fontWeight: 500,
                        }}
                      >
                        <strong>{nivel}:</strong> {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

              {taxa.secao_edital && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.78rem' }}>
                    Seção / Cláusula:
                  </span>
                  <span style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.82rem' }}>
                    {taxa.secao_edital}
                  </span>
                </div>
              )}

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

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {isencao.pagina_origem && (
                <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                  Pág. {isencao.pagina_origem}
                </span>
              )}
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
                valor={isencao.regras_isencao || isencao.criterios || ''}
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
                <span style={{ color: 'var(--cor-texto-secundario)', lineHeight: 1.5 }}>
                  {isencao.criterios || isencao.regras_isencao || 'Não identificado no edital'}
                </span>
              </div>

              {isencao.como_solicitar && isencao.como_solicitar !== 'Não identificado no edital' && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.8rem' }}>
                    Procedimento de Solicitação:
                  </span>
                  <span style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.84rem' }}>
                    {isencao.como_solicitar}
                  </span>
                </div>
              )}

              {isencao.secao_edital && (
                <div>
                  <span style={{ color: 'var(--cor-texto-mutado)', display: 'block', fontSize: '0.78rem' }}>
                    Seção / Cláusula:
                  </span>
                  <span style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.82rem' }}>
                    {isencao.secao_edital}
                  </span>
                </div>
              )}

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

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {etapa.pagina_origem && (
                <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
                  Pág. {etapa.pagina_origem}
                </span>
              )}
              <span className="cracha cracha-neutro">
                {etapa.modalidade || 'Não identificado'}
              </span>
            </div>
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

      {/* SEÇÃO COMPLEMENTAR: Tabela Discriminada de Taxas por Cargo (se disponível) */}
      {listaTabelaTaxas.length > 0 && (
        <div
          style={{
            border: '1px solid var(--cor-borda)',
            borderRadius: 'var(--raio-md)',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            boxShadow: 'var(--sombra-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--cor-borda)',
              paddingBottom: '0.75rem',
            }}
          >
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--cor-primaria)', margin: 0 }}>
                Quadro de Taxas de Inscrição por Cargo e Categoria ({listaTabelaTaxas.length} cargos)
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--cor-texto-mutado)' }}>
                Valores oficiais extraídos diretamente do quadro de cargos do edital
                {taxa.pagina_origem ? ` (Páginas ${taxa.pagina_origem})` : ''}
              </span>
            </div>

            {/* Campo de Busca Rápida de Cargo */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', minWidth: '220px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.65rem', color: 'var(--cor-texto-mutado)' }}
              />
              <input
                type="text"
                placeholder="Filtrar por cargo ou nível..."
                value={filtroCargo}
                onChange={(e) => setFiltroCargo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.65rem 0.4rem 2.1rem',
                  fontSize: '0.84rem',
                  border: '1px solid var(--cor-borda)',
                  borderRadius: 'var(--raio-sm)',
                  backgroundColor: '#f8fafc',
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--cor-borda)' }}>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#334155' }}>
                    Cargo / Função
                  </th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#334155' }}>
                    Escolaridade / Nível
                  </th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                    Taxa de Inscrição
                  </th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                    Pág. Origem
                  </th>
                </tr>
              </thead>
              <tbody>
                {itensExibidos.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--cor-texto-mutado)' }}>
                      Nenhum cargo encontrado para o termo "{filtroCargo}".
                    </td>
                  </tr>
                ) : (
                  itensExibidos.map((item, idx) => {
                    const ehPerfilCandidato =
                      taxa.taxa_perfil_candidato &&
                      item.valor &&
                      taxa.taxa_perfil_candidato.includes(item.valor);

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--cor-borda)',
                          backgroundColor: ehPerfilCandidato ? '#eff6ff' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        }}
                      >
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: ehPerfilCandidato ? 600 : 500, color: '#1e293b' }}>
                          {item.cargo}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: '#e2e8f0',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                            }}
                          >
                            {item.nivel || 'Geral'}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '0.55rem 0.75rem',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: 'var(--cor-primaria)',
                          }}
                        >
                          {item.valor}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                          {item.pagina || taxa.pagina_origem || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {listaTabelaTaxas.length > 8 && !filtroCargo.trim() && (
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setTabelaExpandida(!tabelaExpandida)}
                style={{
                  background: 'none',
                  border: '1px solid var(--cor-borda)',
                  borderRadius: 'var(--raio-sm)',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.82rem',
                  color: 'var(--cor-primaria)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600,
                }}
              >
                {tabelaExpandida ? (
                  <>
                    <ChevronUp size={16} />
                    Recolher tabela (mostrar apenas os primeiros)
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Ver todos os {listaTabelaTaxas.length} cargos listados no edital
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
