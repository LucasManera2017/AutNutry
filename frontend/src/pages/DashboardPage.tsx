// src/pages/DashboardPage.tsx
import { useEffect, useState, type JSX } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, Link } from "react-router-dom"; // Importe Link
import type { User } from "@supabase/supabase-js"; // Importe o tipo User do Supabase JS
import { useTitle } from "../hooks/useTitle";
import { Header } from "../components/header"

function DashboardPage(): JSX.Element {
  useTitle('Dashboard | AutNutry');

  const [user, setUser] = useState<User | null>(null); // Pode ser um objeto User ou null
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
        console.log("Usuário autenticado:", user);
      }
      setLoading(false);
    };

    fetchUser();

    // Listener para mudanças de estado de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        } else if (event === "SIGNED_IN") {
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
      console.error("Erro ao fazer logout:", error.message);
      setLoading(false);
    } else {
      console.log("Logout bem-sucedido!");
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
    <div className="bg-[url(../../public/images/backgroundLogin.jpg)] bg-cover bg-center bg-no-repeat min-h-screen bg-black/90 flex flex-col">
      <Header user={user} handleLogout={handleLogout} loading={loading}/>
      <div className="flex-1 max-w-4xl mx-auto flex flex-col justify-center items-center mb-70">
        <p className="text-3xl text-white font-light tracking-wider text-center mb-8">
          Bem-vindo ao seu painel de gerenciamento.
        </p>

        {/* Links de navegação para as próximas seções */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-red-700/90 p-6 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-semibold text-red-700/90 mb-2">
              Gerenciar Pacientes
            </h3>
            <p className="text-gray-400">
              Adicione, edite e visualize seus pacientes.
            </p>
            <Link
              to="/patients"
              className="w-full mt-5 flex justify-center py-3 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-red-700/90 hover:bg-red-700/80 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Ir para Pacientes
            </Link>
          </div>

          <div className="border border-green-400/70 p-6 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-semibold text-green-400 mb-2">
              Controle Financeiro
            </h3>
            <p className="text-gray-400">Registre e acompanhe pagamentos.</p>
            <Link
              to="/finances"
              className="w-full mt-5 flex justify-center py-3 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-green-400/80 hover:bg-[#05DF63] hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Ir para Finanças
            </Link>
          </div>
          <div className="border border-purple-800 p-6 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              Mensagens Agendadas
            </h3>
            <p className="text-gray-400">
              Programe mensagens para seus pacientes.
            </p>
            <Link
              to="/messages"
              className="w-full mt-5 flex justify-center py-3 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-purple-800 hover:bg-purple-800/90 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Ir para Mensagens
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
