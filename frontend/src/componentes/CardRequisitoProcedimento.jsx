import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Link2,
  ExternalLink,
  Edit,
  Trash2,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';
import { CrachaFonte } from './CrachaFonte.jsx';
import { CrachaStatus } from './CrachaStatus.jsx';

export function CardRequisitoProcedimento({
  requisito,
  documentosVinculados = [],
  aoEditar,
  aoExcluir,
  aoSelecionarDocumento,
}) {
  const [expandido, setExpandido] = useState(false);

  // Parse do procedimento_detalhado (pode vir como objeto ou string JSON)
  let proc = {};
  if (requisito.procedimento_detalhado) {
    if (typeof requisito.procedimento_detalhado === 'string') {
      try {
        proc = JSON.parse(requisito.procedimento_detalhado);
      } catch (e) {
        proc = {};
      }
    } else if (typeof requisito.procedimento_detalhado === 'object') {
      proc = requisito.procedimento_detalhado;
    }
  }

  const temProcedimento = Object.keys(proc).length > 0;

  // Os 16 pontos do procedimento exigidos pela diretriz
  const itensProcedimento = [
    { numero: 1, rotulo: 'O que a instituição exige', valor: proc.o_que_exige || requisito.descricao },
    { numero: 2, rotulo: 'Condição ou valor a ser atendido', valor: proc.condicao_valor },
    { numero: 3, rotulo: 'Quem precisa cumprir a exigência', valor: proc.quem_deve_cumprir },
    { numero: 4, rotulo: 'Como verificar se atende ao requisito', valor: proc.como_verificar_atendimento },
    { numero: 5, rotulo: 'Quais documentos comprovam o requisito', valor: proc.documentos_comprobatorios },
    { numero: 6, rotulo: 'Como obter cada documento', valor: proc.como_obter },
    { numero: 7, rotulo: 'Quem deve emitir ou fornecer cada documento', valor: proc.quem_emite },
    { numero: 8, rotulo: 'Quais formatos são aceitos', valor: proc.formatos_aceitos },
    { numero: 9, rotulo: 'Exigências de assinatura, autenticação ou validade', valor: proc.exigencias_validade_assinatura },
    { numero: 10, rotulo: 'Onde o documento deve ser entregue', valor: proc.onde_entregar },
    { numero: 11, rotulo: 'Como acessar o canal oficial de envio', valor: proc.como_acessar_canal },
    { numero: 12, rotulo: 'Em qual etapa deve ser apresentado', valor: proc.etapa_apresentacao },
    { numero: 13, rotulo: 'Prazo exato para entrega', valor: proc.prazo_exato },
    { numero: 14, rotulo: 'Como verificar se o envio foi realizado corretamente', valor: proc.como_verificar_envio },
    { numero: 15, rotulo: 'Como guardar o protocolo ou comprovante', valor: proc.como_guardar_protocolo },
    { numero: 16, rotulo: 'Fonte oficial da informação', valor: proc.fonte_oficial || (requisito.secao_edital ? `Seção ${requisito.secao_edital}` : null) },
  ];

  return (
    <div
      className="cartao"
      style={{
        border: '1px solid var(--cor-borda-forte)',
        borderRadius: 'var(--raio-sm)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        backgroundColor: 'var(--cor-superficie)',
        boxShadow: 'var(--sombra-plana-sm)',
      }}
    >
      {/* Cabeçalho do Requisito */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--cor-primaria)', fontWeight: 700, fontFamily: 'var(--fonte-titulos)' }}>
            {requisito.titulo}
          </h4>
          <CrachaStatus tipo="criterio" valor={requisito.status_perfil} />
          <span className="cracha cracha-neutro" style={{ fontSize: '0.72rem' }}>
            {requisito.tipo}
          </span>
          {requisito.obrigatorio && (
            <span className="cracha cracha-perigo" style={{ fontSize: '0.72rem' }}>
              Obrigatório
            </span>
          )}
          <CrachaFonte
            classificacao={requisito.classificacao_fonte}
            secao={requisito.secao_edital}
            pagina={requisito.pagina_origem}
            linkOficial={requisito.link_fonte_oficial}
            dataVerificacao={requisito.data_verificacao_externa}
          />
        </div>

        {/* Ações de Edição / Exclusão */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {aoEditar && (
            <button
              type="button"
              onClick={() => aoEditar(requisito)}
              title="Editar requisito"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-texto-secundario)' }}
            >
              <Edit size={15} />
            </button>
          )}
          {aoExcluir && (
            <button
              type="button"
              onClick={() => aoExcluir(requisito)}
              title="Excluir requisito"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--cor-erro)' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Descrição em linguagem simples */}
      {requisito.descricao && (
        <p style={{ fontSize: '0.92rem', color: 'var(--cor-texto-secundario)', lineHeight: 1.5 }}>
          {requisito.descricao}
        </p>
      )}

      {/* Alerta de Pendência ou Não Localizado */}
      {requisito.observacao_pendencia && (
        <div
          style={{
            backgroundColor: 'var(--cor-alerta-fundo)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--raio-sm)',
            border: '1px solid var(--cor-alerta-borda)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            color: 'var(--cor-alerta-texto)',
            fontSize: '0.84rem',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Pendência / Atenção:</strong> {requisito.observacao_pendencia}
          </div>
        </div>
      )}

      {/* Evidência Textual do Edital */}
      {requisito.evidencia_texto && (
        <div
          style={{
            backgroundColor: 'var(--cor-fundo)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--raio-sm)',
            border: '1px solid var(--cor-borda-suave)',
            borderLeft: '4px solid var(--cor-secundaria)',
            fontSize: '0.82rem',
            color: 'var(--cor-texto-principal)',
            fontStyle: 'italic',
          }}
        >
          <span>« {requisito.evidencia_texto} »</span>
          {requisito.pagina_origem && (
            <span style={{ display: 'block', marginTop: '0.25rem', fontWeight: 600, fontStyle: 'normal', color: 'var(--cor-texto-mutado)', fontSize: '0.78rem', fontFamily: 'var(--fonte-mono)' }}>
              Fonte no Edital: Página {requisito.pagina_origem} {requisito.secao_edital ? `(Seção ${requisito.secao_edital})` : ''}
            </span>
          )}
        </div>
      )}

      {/* Documentos vinculados a este requisito */}
      {documentosVinculados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: 'var(--cor-fundo)', padding: '0.75rem', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda-forte)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Documentos Comprobatórios deste Requisito ({documentosVinculados.length}):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {documentosVinculados.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => aoSelecionarDocumento && aoSelecionarDocumento(doc)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--raio-sm)',
                  border: '1px solid var(--cor-borda-forte)',
                  backgroundColor: 'var(--cor-superficie)',
                  boxShadow: 'var(--sombra-plana-sm)',
                  color: 'var(--cor-primaria)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: aoSelecionarDocumento ? 'pointer' : 'default',
                }}
              >
                <FileText size={13} />
                <span>{doc.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botão de Expandir / Recolher o Procedimento Completo de 16 Pontos */}
      <div style={{ borderTop: '1px solid var(--cor-borda-suave)', paddingTop: '0.65rem' }}>
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'var(--cor-primaria)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            padding: '0.2rem 0',
            fontFamily: 'var(--fonte-titulos)',
          }}
        >
          {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>
            {expandido ? 'Ocultar procedimento passo a passo' : 'Ver procedimento passo a passo completo (16 etapas)'}
          </span>
        </button>

        {expandido && (
          <div
            style={{
              marginTop: '0.75rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.75rem',
              backgroundColor: 'var(--cor-fundo)',
              padding: '1rem',
              borderRadius: 'var(--raio-sm)',
              border: '1px solid var(--cor-borda-forte)',
            }}
          >
            {itensProcedimento.map((item) => (
              <div
                key={item.numero}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-mono)' }}>
                  [{String(item.numero).padStart(2, '0')}] {item.rotulo}:
                </span>
                <span
                  style={{
                    color: item.valor ? 'var(--cor-texto-principal)' : 'var(--cor-texto-mutado)',
                    fontStyle: item.valor ? 'normal' : 'italic',
                    lineHeight: 1.45,
                  }}
                >
                  {item.valor || 'Não especificado ou não localizado no edital.'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
