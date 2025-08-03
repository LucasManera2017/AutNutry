// src/pages/Auth/SignupPage.tsx
import React, { useState, type FormEvent, type JSX } from 'react'; // Importe FormEvent
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';

function SignupPage(): JSX.Element { // Tipando o retorno do componente
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSignup = async (e: FormEvent) => { // Tipando o parâmetro 'e' como FormEvent
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // 1. Registrar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // Você pode passar metadados adicionais aqui, como nome completo
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      console.error('Erro ao registrar usuário (Auth):', authError.message);
      setLoading(false);
      return;
    }

    // Se o registro via Auth foi bem-sucedido, agora insira no perfil do nutricionista
    // authData.user pode ser null se email_confirm_aut_signup estiver ativado no Supabase Auth
    if (authData.user) {
      // 2. Inserir o perfil do nutricionista na tabela 'nutricionistas'
      const { error: profileError } = await supabase
        .from('nutricionistas')
        .insert({
          id: authData.user.id, // O ID do usuário do Auth é o mesmo para a tabela 'nutricionistas'
          nome_completo: fullName,
          email: email,
          // Outros campos como telefone podem ser adicionados depois ou em um perfil separado
        });

      if (profileError) {
        setError(profileError.message);
        console.error('Erro ao criar perfil do nutricionista:', profileError.message);
        // Considere reverter o registro de autenticação aqui se a criação do perfil for crítica
        // await supabase.auth.signOut(); // Exemplo de como reverter
      } else {
        setMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
        console.log('Usuário e perfil registrados com sucesso!');
        // Opcional: Redirecionar após um pequeno delay ou manter na página com a mensagem
        // navigate('/login'); // Redireciona para login após o cadastro
      }
    } else {
        // Isso pode acontecer se email_confirm: true estiver ativado no Supabase Auth e
        // o usuário precisar confirmar o email antes de ter uma 'session' ou 'user' direto aqui
        setMessage('Cadastro iniciado! Verifique seu e-mail para confirmar a conta.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Cadastro de Nutricionista 🌱</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo:
            </label>
            <input
              type="text"
              id="fullName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Seu Nome Completo"
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail:
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha:
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;