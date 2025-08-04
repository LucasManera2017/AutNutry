// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router'; // Importe seu AppRouter
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter /> {/* Renderize seu componente de rotas aqui */}
  </React.StrictMode>,
);