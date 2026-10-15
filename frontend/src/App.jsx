import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BarraNavegacao } from './componentes/BarraNavegacao.jsx';
import { PainelInicio } from './paginas/PainelInicio.jsx';
import { ListaEditais } from './paginas/ListaEditais.jsx';
import { FormularioEdital } from './paginas/FormularioEdital.jsx';
import { DetalhesEdital } from './paginas/DetalhesEdital.jsx';
import { PerfilUsuario } from './paginas/PerfilUsuario.jsx';
import { ResultadoAnalise } from './paginas/ResultadoAnalise.jsx';
import { PlanoAcao } from './paginas/PlanoAcao.jsx';
import { Sobre } from './paginas/Sobre.jsx';

export function App() {
  return (
    <BrowserRouter>
      <div className="conteiner-aplicacao">
        <BarraNavegacao />

        <main className="conteudo-principal">
          <Routes>
            <Route path="/" element={<PainelInicio />} />
            <Route path="/editais" element={<ListaEditais />} />
            <Route path="/editais/novo" element={<FormularioEdital />} />
            <Route path="/editais/:id/editar" element={<FormularioEdital />} />
            <Route path="/editais/:id" element={<DetalhesEdital />} />
            <Route path="/perfis" element={<PerfilUsuario />} />
            <Route path="/analises/:id" element={<ResultadoAnalise />} />
            <Route path="/plano-de-acao" element={<PlanoAcao />} />
            <Route path="/sobre" element={<Sobre />} />
          </Routes>
        </main>

        <footer className="rodape">
          <p>
            <strong>Edital em Ação</strong> — Projeto Fullstack desenvolvido para o programa Recode Pro AI (ODS 10).
          </p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--cor-texto-mutado)' }}>
            Ferramenta orientativa de apoio à leitura e organização. A aprovação depende das decisões oficiais das instituições.
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

