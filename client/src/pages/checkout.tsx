import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function Checkout() {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Obtém o plano dos parâmetros de consulta
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');
  
  useEffect(() => {
    if (!plan) {
      setError("Nenhum plano foi selecionado. Por favor, volte e escolha um plano.");
      return;
    }
    
    // Redirecionar para a sessão do Stripe
    const redirectToStripe = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/checkout", { plan });
        const data = await response.json();
        
        if (data.success && data.url) {
          // Redireciona para a página de checkout do Stripe
          window.location.href = data.url;
        } else {
          setError(data.message || "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.");
        }
      } catch (err) {
        console.error("Erro ao criar sessão de checkout:", err);
        setError("Não foi possível conectar ao servidor de pagamento. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    
    redirectToStripe();
  }, [plan]);
  
  const handleVoltar = () => {
    setLocation("/planos");
  };
  
  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen">
      <header className="bg-blue-800 text-white py-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <p className="mt-2 text-lg">Processando seu plano</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 animate-spin border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-lg">Redirecionando para o ambiente seguro de pagamento...</p>
              <p className="text-sm text-gray-500">Por favor, aguarde um momento.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-600">Erro</h2>
              <p className="text-gray-600">{error}</p>
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleVoltar}
              >
                Voltar para Planos
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg">Preparando seu pagamento...</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}