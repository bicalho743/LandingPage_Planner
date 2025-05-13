import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirecionar para o login se o usuário não estiver autenticado
      setLocation('/login');
    }
  }, [isAuthenticated, loading, setLocation]);

  // Mostrar indicador de carregamento enquanto estiver verificando a autenticação
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Renderizar o conteúdo se autenticado
  return isAuthenticated ? <>{children}</> : null;
}