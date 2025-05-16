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
      
      <footer className="bg-blue-800 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-blue-200">
            &copy; {new Date().getFullYear()} PlannerOrganiza. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}