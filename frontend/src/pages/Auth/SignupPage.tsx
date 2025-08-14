// src/pages/Auth/SignupPage.tsx
import React, { useState, type FormEvent, type JSX } from "react"; // Importe FormEvent
import { supabase } from "../../services/supabase";
import { Link } from "react-router-dom";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useTitle } from "../../hooks/useTitle";

function SignupPage(): JSX.Element {
  useTitle('Signup | AutNutry');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  // const navigate = useNavigate(); // Não precisamos mais do navigate aqui para o signup

  const handleSignup = async (e: FormEvent) => {
    

    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // 1. Registrar o usuário no Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // Passando o nome completo como metadado para a função do banco de dados
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      console.error('Erro ao registrar usuário:', authError.message);
    } else {
      // Se não houve erro no signUp, o trigger do banco de dados cuidará da criação do perfil.
      // Apenas informamos ao usuário para verificar o e-mail.
      setMessage('Cadastro iniciado! Verifique seu e-mail para confirmar a conta e faça login.');
      setEmail(''); // Limpa o formulário
      setPassword('');
      setFullName('');
      console.log('Usuário registrado via Auth. Perfil será criado pelo trigger.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-[url(../../public/images/backgroundLogin.jpg)] bg-cover bg-center bg-no-repeat flex items-center justify-center min-h-screen w-full">
      <div className="p-8 rounded-lg  min-w-[350px] w-full max-w-md mb-34">
        <h2 className="text-4xl font-bold text-center text-green-400 mb-8">
          Cadastro de Nutricionista
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <MdDriveFileRenameOutline />
              </span>
              <input
                type="text"
                id="fullName"
                className="mt-1 block w-full pl-10 px-3 py-3 border-[0.05px] bg-[rgba(55,65,81,0.15)] border-transparent rounded-3xl shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400/35 sm:text-sm placeholder-gray-500 text-gray-300"
                placeholder="*Nome Completo"
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFullName(e.target.value)
                }
                required
              />
            </div>
          </div>
          <div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaUserAlt />
              </span>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full pl-10 px-3 py-3 border-[0.05px] bg-[rgba(55,65,81,0.15)] border-transparent rounded-3xl shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400/35 sm:text-sm placeholder-gray-500 text-gray-300"
                placeholder="*seuemail@exemplo.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <RiLockPasswordFill />
              </span>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full pl-10 px-3 py-3 border-[0.05px] bg-[rgba(55,65,81,0.15)] border-transparent rounded-3xl shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400/35 sm:text-sm placeholder-gray-500 text-gray-300"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-green-400/80 hover:bg-[#05DF63] hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-medium text-green-400 hover:text-green-300"
          >
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
