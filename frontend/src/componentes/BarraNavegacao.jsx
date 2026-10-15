import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FileText, User, CheckSquare, Info, Home, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../servicos/api.js';

export function BarraNavegacao() {
  const [estadoApi, setEstadoApi] = useState({ carregando: true, conectado: false });

  useEffect(() => {
    let ativo = true;
    api
      .verificarSaude()
      .then((dados) => {
        if (ativo) {
          setEstadoApi({
            carregando: false,
            conectado: dados.status === 'operacional',
            iaModo: dados.inteligenciaArtificial?.modoAtivo,
          });
        }
      })
      .catch(() => {
        if (ativo) {
          setEstadoApi({ carregando: false, conectado: false });
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <header className="barra-navegacao">
      <div className="navegacao-conteudo">
        <Link to="/" className="logo-link">
          <div className="logo-icone">
            <FileText size={22} />
          </div>
          <div className="logo-texto">
            <span className="logo-titulo">Edital em Ação</span>
            <span className="logo-subtitulo">Do edital à oportunidade</span>
          </div>
        </Link>

        <nav aria-label="Navegação Principal">
          <ul className="links-navegacao">
            <li className="item-navegacao">
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'ativo' : '')}>
                <Home size={18} />
                <span>Início</span>
              </NavLink>
            </li>
            <li className="item-navegacao">
              <NavLink to="/editais" className={({ isActive }) => (isActive ? 'ativo' : '')}>
                <FileText size={18} />
                <span>Editais</span>
              </NavLink>
            </li>
            <li className="item-navegacao">
              <NavLink to="/perfis" className={({ isActive }) => (isActive ? 'ativo' : '')}>
                <User size={18} />
                <span>Meu Perfil</span>
              </NavLink>
            </li>
            <li className="item-navegacao">
              <NavLink to="/plano-de-acao" className={({ isActive }) => (isActive ? 'ativo' : '')}>
                <CheckSquare size={18} />
                <span>Plano de Ação</span>
              </NavLink>
            </li>
            <li className="item-navegacao">
              <NavLink to="/sobre" className={({ isActive }) => (isActive ? 'ativo' : '')}>
                <Info size={18} />
                <span>Sobre</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}


