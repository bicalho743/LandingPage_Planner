import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle, ShieldCheck, Infinity, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Planos() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const handleSubscribe = async (plan: string) => {
    try {
      setLoadingPlan(plan);
      
      // Fazer requisição direta para a API de checkout
      const response = await apiRequest("POST", "/api/checkout", { plan });
      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirecionar para o Stripe
        window.location.href = data.url;
      } else {
        toast({
          title: "Erro",
          description: data.message || "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao iniciar o checkout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao servidor de pagamento. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleVoltar = () => {
    setLocation("/");
  };

  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen">
      <header className="bg-blue-800 text-white py-6">
        <div className="container mx-auto text-center flex justify-between items-center px-4">
          <h1 className="text-4xl font-bold">Escolha seu Plano</h1>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-blue-700"
            onClick={handleVoltar}
          >
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border p-6 rounded-md shadow-md text-center">
          <ShieldCheck className="w-12 h-12 text-green-600 mx-auto" />
          <h2 className="text-2xl font-bold">Plano Mensal</h2>
          <p className="mt-4">Acesso completo por apenas R$ 9,70/mês</p>
          <Button 
            className="bg-green-600 text-white px-6 py-3 mt-4 rounded-md hover:bg-green-700" 
            onClick={() => handleSubscribe('mensal')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'mensal' ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full mr-2"></span>
                Processando...
              </span>
            ) : "Assinar Agora"}
          </Button>
        </div>

        <div className="border p-6 rounded-md shadow-md text-center relative">
          <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-sm py-1">
            Mais Popular
          </div>
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mt-4" />
          <h2 className="text-2xl font-bold">Plano Anual</h2>
          <p className="mt-4">Economize com o plano anual - R$ 97,00/ano</p>
          <Button 
            className="bg-green-600 text-white px-6 py-3 mt-4 rounded-md hover:bg-green-700" 
            onClick={() => handleSubscribe('anual')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'anual' ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full mr-2"></span>
                Processando...
              </span>
            ) : "Assinar Agora"}
          </Button>
        </div>

        <div className="border p-6 rounded-md shadow-md text-center">
          <Infinity className="w-12 h-12 text-yellow-600 mx-auto" />
          <h2 className="text-2xl font-bold">Plano Vitalício</h2>
          <p className="mt-4">Pague uma vez e tenha acesso para sempre - R$ 247,00</p>
          <Button 
            className="bg-green-600 text-white px-6 py-3 mt-4 rounded-md hover:bg-green-700" 
            onClick={() => handleSubscribe('vitalicio')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'vitalicio' ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full mr-2"></span>
                Processando...
              </span>
            ) : "Assinar Agora"}
          </Button>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}