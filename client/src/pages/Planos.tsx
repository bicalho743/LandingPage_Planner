import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, ChevronLeft, Sparkles, Calendar, Infinity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Planos() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const iniciarCheckout = async (plan: string) => {
    if (!email) {
      setErrorMessage("Por favor, insira seu e-mail.");
      return;
    }

    // Resetar qualquer erro anterior
    setErrorMessage(null);
    // Ativar loading para o plano específico
    setLoading(plan);

    try {
      // Validar o e-mail com Zod
      try {
        z.string().email().parse(email);
      } catch (error) {
        setErrorMessage("Por favor, insira um e-mail válido.");
        setLoading(null);
        return;
      }

      // Registrar lead antes do checkout 
      // Não esperamos por esta requisição para não atrasar o checkout
      fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "Cliente interessado", email })
      }).catch(e => {
        console.error("Erro ao salvar lead:", e);
        // Não bloqueamos o fluxo por causa deste erro
      });

      console.log("Redirecionando para registro com plano:", plan);
      
      // NOVO FLUXO: Redirecionar para a página de registro com o email e plano
      const params = new URLSearchParams();
      params.append('plano', plan);
      params.append('email', email);
      
      // Redirecionar para a página de registro com os parâmetros
      window.location.href = `/registro?${params.toString()}`;
    } catch (error) {
      console.error("Erro ao iniciar registro:", error);
      setErrorMessage("Erro ao processar sua solicitação. Tente novamente.");
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "mensal",
      name: "Plano Mensal",
      price: "R$ 9,70",
      color: "blue",
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
      description: "Acesso total, perfeito para testar todas as funcionalidades",
      features: ["Acesso a todos os recursos", "Suporte por e-mail", "Atualizações mensais"],
      popular: false
    },
    {
      id: "anual",
      name: "Plano Anual",
      price: "R$ 97,00",
      color: "green",
      icon: <Sparkles className="h-5 w-5 text-green-600" />,
      description: "Nosso plano mais popular, com economia de 17%",
      features: ["Tudo do plano mensal", "Economia de 17%", "Suporte prioritário", "Atualizações prioritárias"],
      popular: true
    },
    {
      id: "vitalicio",
      name: "Plano Vitalício",
      price: "R$ 247,00",
      color: "yellow",
      icon: <Infinity className="h-5 w-5 text-yellow-600" />,
      description: "Acesso permanente sem mensalidades",
      features: ["Pagamento único", "Acesso vitalício", "Todas as atualizações futuras", "Suporte premium"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-700"
          onClick={() => setLocation("/")}
          disabled={loading !== null}
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para a página inicial
        </Button>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
            Escolha o Plano Perfeito para Você
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Todos os planos incluem trial de 7 dias e acesso completo a todas as funcionalidades.
            Cancele a qualquer momento.
          </p>
        </div>
        
        <div className="mb-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-8 p-6 border border-blue-100">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Comece sua experiência</h3>
            <p className="text-gray-600 mb-4">Digite seu e-mail para continuar com a assinatura</p>
            
            {/* Input de email */}
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`mb-4 ${errorMessage ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={loading !== null}
            />
            
            {/* Mensagem de erro */}
            {errorMessage && (
              <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.id} className={`border-${plan.color}-100 hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
                {plan.popular && (
                  <div className="bg-green-500 text-white text-xs font-bold uppercase tracking-wider py-1 text-center">
                    Mais Popular
                  </div>
                )}
                <CardHeader className={`bg-${plan.color}-50`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className={`rounded-full bg-${plan.color}-100 p-2`}>
                      {plan.icon}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-sm">Preço total</span>
                      <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                    </div>
                  </div>
                  <CardTitle className={`text-${plan.color}-800`}>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 text-${plan.color}-500`} />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.id === "mensal" && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                      onClick={() => iniciarCheckout(plan.id)}
                      disabled={loading !== null}
                    >
                      {loading === plan.id ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </div>
                      ) : (
                        `Escolher ${plan.name}`
                      )}
                    </Button>
                  )}
                  {plan.id === "anual" && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                      onClick={() => iniciarCheckout(plan.id)}
                      disabled={loading !== null}
                    >
                      {loading === plan.id ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </div>
                      ) : (
                        `Escolher ${plan.name}`
                      )}
                    </Button>
                  )}
                  {plan.id === "vitalicio" && (
                    <Button 
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3"
                      onClick={() => iniciarCheckout(plan.id)}
                      disabled={loading !== null}
                    >
                      {loading === plan.id ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </div>
                      ) : (
                        `Escolher ${plan.name}`
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Feedback adicional durante o carregamento */}
        {loading && (
          <div className="text-center mt-8">
            <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Preparando checkout seguro... Você será redirecionado para o Stripe em instantes.
              </p>
            </div>
          </div>
        )}
        
        {/* Seção de garantia */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Garantia de Satisfação</h3>
            <p className="text-gray-600 mb-2">
              Experimente o PlannerPro por 7 dias sem compromisso. 
              Se não gostar, cancele facilmente e não será cobrado.
            </p>
            <p className="text-gray-500 text-sm">
              Cancele sua assinatura a qualquer momento diretamente na sua conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}