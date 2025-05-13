import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";

export default function Sucesso() {
  const [_, setLocation] = useLocation();

  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen">
      <header className="bg-blue-800 text-white py-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">Pagamento Confirmado</h1>
          <p className="mt-2 text-lg">Bem-vindo ao PlannerPro!</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-lg">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-green-600">Pagamento realizado com sucesso!</h2>
            
            <p className="text-gray-600">
              Obrigado por escolher o PlannerPro! Sua conta foi ativada e você já pode começar a usar 
              todos os recursos disponíveis em seu plano.
            </p>

            <div className="bg-gray-50 p-4 rounded-md w-full">
              <h3 className="font-semibold text-lg mb-2">Próximos passos:</h3>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Complete seu perfil com suas informações profissionais</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Configure suas preferências de notificações</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Adicione seus primeiros clientes e comece a organizar</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setLocation("/dashboard")}
              >
                Acessar Dashboard
              </Button>
              <Button 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => setLocation("/")}
              >
                Voltar para Home
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}