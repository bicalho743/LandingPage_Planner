import React from 'react';
import { Link, useLocation } from 'wouter';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-blue-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold mb-2">PlannerOrganiza</h3>
              <p className="text-blue-200 text-sm">
                Ferramentas para teste de integrações do Stripe
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Links Rápidos</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link href="/">
                    <a className="hover:text-blue-200">Página Inicial</a>
                  </Link>
                </li>
                <li>
                  <Link href="/planos">
                    <a className="hover:text-blue-200">Planos</a>
                  </Link>
                </li>
                <li>
                  <Link href="/teste">
                    <a className="hover:text-blue-200">Área de Testes</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-blue-700 text-center text-sm text-blue-300">
            &copy; {new Date().getFullYear()} PlannerPro Organizer. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}