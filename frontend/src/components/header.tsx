import React, { type JSX } from "react";
import { MdLogout } from "react-icons/md";


interface HeaderProps {
  user: { email?: string; user_metadata?: { full_name?: string } } | null;
  handleLogout: () => void;
  loading: boolean;
}

import { useLocation } from "react-router-dom";

export function Header({
  user,
  handleLogout,
  loading,
}: HeaderProps): JSX.Element {
  const location = useLocation();

  // FUNÇÃO PARA LIDAR COM A RENDERIZAÇÃO DOS LINKS QUE APARECERÃO DE ACORDO COM O PATH
  const renderNavigation = () => {
    switch (location.pathname) {
      case "/dashboard":
        return null;

      case "/patients":
        return (
          <div className="flex gap-15 text-white font-bold tracking-wider font-light text-lg">
            <a href="/dashboard" className="hover:text-green-400/90">Dashboard</a>
            <a href="/finance" className="hover:text-green-400/90">Financeiro</a>
            <a href="/message" className="hover:text-green-400/90">Mensagens</a>
          </div>
        );

      case "/finance":
        return (
          <div className="flex gap-15 text-white font-bold tracking-wider font-light text-lg">
            <a href="/dashboard" className="hover:text-green-400/90">Dashboard</a>
            <a href="/patients" className="hover:text-green-400/90">Pacientes</a>
            <a href="/message" className="hover:text-green-400/90">Mensagens</a>
          </div>
        );

        case "/message":
        return (
          <div className="flex gap-15 text-white font-bold tracking-wider font-light text-lg">
            <a href="/dashboard" className="hover:text-green-400/90">Dashboard</a>
            <a href="/patients" className="hover:text-green-400/90">Pacientes</a>
            <a href="/message" className="hover:text-green-400/90">Financeiro</a>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <div className="flex justify-between items-center flex-wrap px-8 py-4 bg-transparent">
      <a
        className="text-3xl text-green-400 font-mono tracking-widest font-thin"
        href="/dashboard"
      >
        AutNutry
      </a>

      {renderNavigation()}

      <div className="flex justify-center items-center">
        {location.pathname === "/dashboard" ? (
          <p className="text-[1.25rem] font-light text-green-400 mr-6">
            Olá, {user ? user.user_metadata?.full_name || user.email : ""}
          </p>
        ) : null}
        <div className="text-center">
           
            <button
              onClick={handleLogout}
              className=" flex items-center justify-center ml-3 hover:cursor-pointer hover:text-red-600 text-[0.8rem] text-white font-medium py-1 px-3 tracking-widest rounded-lg shadow-md transition duration-150 ease-in-out"
              disabled={loading}
            >
              {loading ? "Saindo..." : "Logout"}
              <MdLogout className="ml-1 top-3" />
            </button>
        </div>
      </div>
    </div>
  );
}
