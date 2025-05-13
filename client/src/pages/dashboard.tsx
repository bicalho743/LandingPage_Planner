import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [_, setLocation] = useLocation();

  return (
    <div className="bg-gray-100 text-gray-800 font-sans min-h-screen">
      <header className="bg-blue-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">PlannerPro Dashboard</h1>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-blue-700"
            onClick={() => setLocation("/")}
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Bem-vindo ao seu Dashboard!</h2>
          <p className="text-gray-600">
            Você agora tem acesso a todas as funcionalidades do PlannerPro Organizer.
            Este é um dashboard de exemplo para demonstrar a navegação após o pagamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Clientes</h3>
            <p className="text-gray-600 mb-4">Gerencie seus clientes e projetos em andamento.</p>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">0 clientes cadastrados</p>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Adicionar Cliente
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Projetos</h3>
            <p className="text-gray-600 mb-4">Acompanhe o progresso dos seus projetos de organização.</p>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">0 projetos em andamento</p>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Criar Projeto
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Sua Assinatura</h3>
            <div className="bg-green-50 p-4 rounded-md mb-4">
              <p className="text-sm text-green-800 font-medium">Ativa</p>
              <p className="text-xs text-green-700 mt-1">Seu plano está ativo e funcionando</p>
            </div>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Plano:</span> Premium</p>
              <p><span className="font-medium">Próxima cobrança:</span> 13/06/2025</p>
            </div>
            <Button variant="outline" className="w-full mt-4 border-blue-600 text-blue-600">
              Gerenciar Assinatura
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}