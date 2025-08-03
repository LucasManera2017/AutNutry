// src/pages/DashboardPage.tsx
import { useEffect, useState, type JSX } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom'; // Importe Link
import type { User } from '@supabase/supabase-js'; // Importe o tipo User do Supabase JS
 // Importe o tipo User do Supabase JS

function DashboardPage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null); // Pode ser um objeto User ou null
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
        console.log('Usuário autenticado:', user);
      }
      setLoading(false);
    };

    fetchUser();

    // Listener para mudanças de estado de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
        }
      }
    );

    return () => {
      // É importante verificar se 'subscription' existe antes de tentar desinscrever
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error.message);
      setLoading(false);
    } else {
      console.log('Logout bem-sucedido!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-blue-600">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">
          Olá, Nutricionista {user ? user.user_metadata?.full_name || user.email : ''}! 🍎
        </h1>
        <p className="text-lg text-gray-700 text-center mb-8">
          Bem-vindo ao seu painel de gerenciamento de pacientes.
        </p>
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>

        {/* Links de navegação para as próximas seções */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Gerenciar Pacientes</h3>
            <p className="text-gray-600">Adicione, edite e visualize seus pacientes.</p>
            <Link to="/patients" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Ir para Pacientes</Link>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-2">Controle Financeiro</h3>
            <p className="text-gray-600">Registre e acompanhe pagamentos.</p>
            <Link to="/finances" className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">Ir para Finanças</Link>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Mensagens Agendadas</h3>
            <p className="text-gray-600">Programe mensagens para seus pacientes.</p>
            <Link to="/messages" className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">Ir para Mensagens</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;