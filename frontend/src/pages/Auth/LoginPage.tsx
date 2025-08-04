// src/pages/Auth/LoginPage.tsx
import React, { useState, type FormEvent, type JSX } from "react"; // Importe FormEvent
import { supabase } from "../../services/supabase";
import { Link, useNavigate } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useTitle } from "../../hooks/useTitle";


function LoginPage(): JSX.Element {
  useTitle('Login | AutNutry');

  // Tipando o retorno do componente
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    // Tipando o parâmetro 'e' como FormEvent
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      console.error("Erro de login:", authError.message);
    } else {
      console.log("Login bem-sucedido!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[url(../../public/images/backgroundLogin.jpg)] bg-cover bg-center bg-no-repeat flex items-center justify-center min-h-screen w-full">
      <div className=" flex items-center justify-center p-4 mb-34">
        <div className="p-8 rounded-lg  min-w-[350px] w-full max-w-md">
          <h2 className="text-5xl font-bold text-center text-green-400 mb-8 font-mono tracking-widest">
            AutNutry
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaUserAlt />
              </span>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full pl-10 px-3 py-3 border-[0.05px] bg-[rgba(55,65,81,0.15)] border-transparent rounded-3xl shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400/15 sm:text-sm placeholder-gray-400 text-gray-300"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <RiLockPasswordFill />
              </span>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full pl-10 px-3 py-3 border-[0.05px] bg-[rgba(55,65,81,0.15)] border-transparent rounded-3xl shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400/15 sm:text-sm placeholder-gray-400 text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                } // Tipando o evento de onChange
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-green-400/80 hover:bg-[#05DF63] hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Não tem uma conta?{" "}
            <Link
              to="/signup"
              className="font-medium text-green-400 hover:text-green-300"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
