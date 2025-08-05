// src/router/index.tsx
import React, { type JSX, type ReactNode } from 'react'; // Importe ReactNode
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js'; // Importe o tipo Session do Supabase JS
import PatientsPage from '../pages/PatientsPage';
 // Importe o tipo Session do Supabase JS

// Defina a interface para as props de PrivateRoute
interface PrivateRouteProps {
  children: ReactNode; // children é o tipo ReactNode
}

// Componente para rotas protegidas (somente para usuários autenticados)
const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element => {
  const [session, setSession] = React.useState<Session | null>(null); // Pode ser Session ou null
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (subscription) { // Verifique se a subscription existe antes de desinscrever
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-blue-600">Verificando autenticação...</p>
      </div>
    );
  }

  return session ? (children as JSX.Element) : <Navigate to="/login" replace />;
};

function AppRouter(): JSX.Element {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Rota Protegida */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <PatientsPage />
            </PrivateRoute>
          }
        />
        {/* Redirecionamento da raiz para o login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rota 404 para caminhos não encontrados */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;