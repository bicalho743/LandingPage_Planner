import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle, ShieldCheck, Infinity, Calendar, DollarSign, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { z } from "zod";

export default function Planos() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const validateEmail = (email: string): boolean => {
    // Validação de email usando zod
    const emailSchema = z.string().email({ message: "Email inválido" });
    try {
      emailSchema.parse(email);
      setEmailError("");
      return true;
    } catch (error) {
      setEmailError("Por favor, forneça um email válido");
      return false;
    }
  };

  const handleSubscribe = async (plan: string) => {
    // Validar e-mail antes de prosseguir
    if (!email) {
      setEmailError("Por favor, forneça seu email para continuar");
      toast({
        title: "Email obrigatório",
        description: "Por favor, digite seu email para prosseguir com a assinatura.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, digite um email válido para prosseguir.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoadingPlan(plan);
      
      console.log("Enviando requisição para checkout com plano:", plan, "email:", email);
      // Fazer requisição direta para a API de checkout incluindo o email
      const response = await fetch("/api/checkout", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan, email })
      });
      const data = await response.json();
      
      if (data.success && data.url) {
        // Adicionar email como lead antes de redirecionar
        try {
          await fetch("/api/leads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: "Cliente interessado", email })
          });
        } catch (e) {
          console.error("Erro ao salvar lead:", e);
          // Continuamos mesmo com erro ao salvar o lead
        }
        
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
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" /> 
            Digite seu e-mail para continuar
          </h2>
          <p className="text-gray-600 mb-4">
            Fornecendo seu e-mail, você receberá acesso ao sistema e informações sobre sua compra.
          </p>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value) validateEmail(e.target.value);
                }}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

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