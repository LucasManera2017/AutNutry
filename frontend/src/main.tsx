// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router'; // Importe seu AppRouter
import './index.css'; // Mantenha seu CSS global (onde o Tailwind é importado)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter /> {/* Renderize seu componente de rotas aqui */}
  </React.StrictMode>,
);