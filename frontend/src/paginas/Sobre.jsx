import React from 'react';
import { ShieldCheck, HeartHandshake, AlertCircle, FileText, Cpu, CheckCircle2, Lock } from 'lucide-react';
import { Cartao } from '../componentes/Cartao.jsx';

export function Sobre() {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div className="kicker-editorial">MANIFESTO & DIRETRIZES</div>
        <h1 style={{ fontSize: '2rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700, margin: '0.2rem 0' }}>
          Sobre o Edital em Ação
        </h1>
        <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '1.05rem', fontStyle: 'italic' }}>
          “Do edital à oportunidade, sem se perder no caminho.”
        </p>
      </div>

      {/* Missão e ODS 10 */}
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--cor-secundaria)',
              color: 'var(--cor-texto-principal)',
              padding: '0.75rem',
              borderRadius: 'var(--raio-xs)',
              border: '1px solid var(--cor-borda-forte)',
              boxShadow: 'var(--sombra-plana-sm)',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <HeartHandshake size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Objetivo Social & ODS 10 (Redução das Desigualdades)
            </h2>
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Editais de bolsas de estudo, auxílios estudantis e cursos profissionalizantes costumam ser longos,
              burocráticos e de difícil compreensão. Muitas pessoas desistem ou perdem prazos não por falta de mérito,
              mas pela barreira informacional.
            </p>
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
              O <strong>Edital em Ação</strong> foi desenvolvido no âmbito do programa <strong>Recode Pro AI</strong> com o
              propósito de democratizar o acesso a oportunidades, convertendo termos jurídicos e administrativos em
              exigências claras, evidências verificáveis e tarefas organizadas.
            </p>
          </div>
        </div>
      </Cartao>

      {/* Limitações da IA e Natureza Orientativa */}
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--cor-alerta-fundo)',
              color: 'var(--cor-alerta-texto)',
              padding: '0.75rem',
              borderRadius: 'var(--raio-xs)',
              border: '1px solid var(--cor-alerta-borda)',
              boxShadow: 'var(--sombra-plana-sm)',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Limitações da Inteligência Artificial e Termo Orientativo
            </h2>
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              A plataforma é uma ferramenta de apoio à leitura e ao planejamento pessoal. Os resultados apresentados
              possuem caráter estritamente <strong>orientativo</strong>.
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', fontSize: '0.92rem', color: 'var(--cor-texto-secundario)', lineHeight: 1.7 }}>
              <li>
                <strong>Não substitui a leitura oficial:</strong> O candidato deve conferir integralmente o documento
                publicado pela instituição promotora.
              </li>
              <li>
                <strong>Sem garantia de aprovação:</strong> O sistema não promete nem garante deferimento de inscrição,
                concessão de bolsa ou benefício legal.
              </li>
              <li>
                <strong>Transparência nas incertezas:</strong> Sempre que uma regra for ambígua ou faltarem dados, o
                sistema sinalizará o estado «Precisa confirmar», incentivando a revisão humana.
              </li>
            </ul>
          </div>
        </div>
      </Cartao>

      {/* Privacidade e Minimização de Dados */}
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--cor-fundo)',
              color: 'var(--cor-primaria)',
              padding: '0.75rem',
              borderRadius: 'var(--raio-xs)',
              border: '1px solid var(--cor-borda-forte)',
              boxShadow: 'var(--sombra-plana-sm)',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Lock size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Compromisso com a Privacidade e Proteção de Dados
            </h2>
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Aplicamos o princípio de minimização de dados conforme boas práticas de segurança:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', fontSize: '0.92rem', color: 'var(--cor-texto-secundario)', lineHeight: 1.7 }}>
              <li>Não coletamos CPF, senhas bancárias ou dados de saúde.</li>
              <li>Todas as chaves de API e credenciais de banco operam exclusivamente no servidor backend.</li>
              <li>
                Ao excluir um edital ou análise, seus vínculos são limpos com integridade relacional, prevenindo
                registros órfãos.
              </li>
            </ul>
          </div>
        </div>
      </Cartao>

      {/* Arquitetura e Tecnologias */}
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--cor-primaria)',
              color: 'var(--cor-fundo)',
              padding: '0.75rem',
              borderRadius: 'var(--raio-xs)',
              border: '1px solid var(--cor-borda-forte)',
              boxShadow: 'var(--sombra-plana-sm)',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Cpu size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Tecnologias Utilizadas
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--cor-fundo)', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda-forte)' }}>
                <strong style={{ color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}>Frontend:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)', marginTop: '0.2rem' }}>
                  ReactJS com Vite, React Router, Design Modernista / Construtivista Editorial em Vanilla CSS.
                </p>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--cor-fundo)', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda-forte)' }}>
                <strong style={{ color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}>Backend:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)', marginTop: '0.2rem' }}>
                  Node.js com Express, API RESTful, Multer e extração real de PDF com pdf-parse.
                </p>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--cor-fundo)', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda-forte)' }}>
                <strong style={{ color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}>Banco de Dados:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)', marginTop: '0.2rem' }}>
                  MySQL 8.0, InnoDB, utf8mb4, Prepared Statements com mysql2/promise.
                </p>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--cor-fundo)', borderRadius: 'var(--raio-sm)', border: '1px solid var(--cor-borda-forte)' }}>
                <strong style={{ color: 'var(--cor-primaria)', fontFamily: 'var(--fonte-titulos)' }}>Análise Inteligente:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)', marginTop: '0.2rem' }}>
                  Google Gemini SDK (@google/genai) com fallback elegante para motor heurístico local.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Cartao>
    </div>
  );
}

