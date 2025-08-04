// src/pages/NotFoundPage.tsx
import React, { type JSX } from "react";
import { Link } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";

function NotFoundPage(): JSX.Element {
  // Tipando o retorno do componente
  useTitle("NotFound");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Página não encontrada!</p>
      <Link
        to="/login"
        className="flex justify-center py-3 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-green-400/80 hover:bg-[#05DF63] hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
      >
        Voltar para o Login
      </Link>
    </div>
  );
}

export default NotFoundPage;
