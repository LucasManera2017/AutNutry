import { useEffect } from 'react'
import { supabase } from './services/supabase'; 
import './App.css'

function App() {
  useEffect(() => {
    // Apenas para verificar no console se a conexão está ok
    console.log('⚡ App.jsx Carregado!');
    if (supabase) {
      console.log('✅ Supabase importado com sucesso no App.jsx!');
    } else {
      console.error('❌ Erro ao importar Supabase no App.jsx!');
    }

  }, []);

  return (
    <div className= " flex items-center justify-center">
      <h1 className="text-4xl font-extrabold text-lime-400 p-4 rounded-lg shadow-2xl">
         Bem-vindo ao AutNutry! 
      </h1>
    </div>
  );
}

export default App;

