// src/pages/NotFoundPage.tsx
import React, { type JSX } from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage(): JSX.Element { // Tipando o retorno do componente
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Página não encontrada!</p>
      <Link
        to="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
      >
        Voltar para o Login
      </Link>
    </div>
  );
}

export default NotFoundPage;