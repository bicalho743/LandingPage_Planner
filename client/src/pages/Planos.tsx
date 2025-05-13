import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Planos() {
  const [location, setLocation] = useLocation();

  const handleVoltar = () => {
    setLocation("/");
  };

  const handleAssinar = (plano: string) => {
    // Aqui poderia redirecionar para a página de checkout do Stripe
    alert(`Você selecionou o plano ${plano}`);
  };

  return (
    <>
      <Helmet>
        <title>Planos de Assinatura - PlannerPro</title>
        <meta name="description" content="Escolha o plano ideal para o seu negócio de organização. Opções mensais, anuais ou lifetime." />
      </Helmet>
      
      <div className="bg-white text-gray-800 font-sans min-h-screen">
        <header className="bg-blue-800 text-white py-6">
          <div className="container mx-auto flex justify-between items-center px-4">
            <h1 className="text-2xl font-bold">PlannerPro</h1>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-blue-700"
              onClick={handleVoltar}
            >
              Voltar
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Escolha seu Plano</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecione o plano que melhor atende às necessidades do seu negócio de organização
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <Card className="border-gray-200 shadow-md flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Mensal</CardTitle>
                <p className="text-3xl font-bold mt-4">R$ 49,90<span className="text-sm text-gray-500">/mês</span></p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Até 20 clientes</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Sistema de projetos básico</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Geração de relatórios</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Suporte por email</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleAssinar("Mensal")}
                >
                  Assinar
                </Button>
              </CardFooter>
            </Card>

            {/* Plano Anual */}
            <Card className="border-primary shadow-lg flex flex-col relative">
              <div className="bg-primary text-white text-center py-1 text-sm">
                Mais Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Anual</CardTitle>
                <p className="text-3xl font-bold mt-4">R$ 399,90<span className="text-sm text-gray-500">/ano</span></p>
                <p className="text-green-600 text-sm mt-1">Economize 33%</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Clientes ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Sistema de projetos completo</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Modelos de propostas</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                  onClick={() => handleAssinar("Anual")}
                >
                  Assinar
                </Button>
              </CardFooter>
            </Card>

            {/* Plano Lifetime */}
            <Card className="border-gray-200 shadow-md flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Lifetime</CardTitle>
                <p className="text-3xl font-bold mt-4">R$ 999,90<span className="text-sm text-gray-500">/único</span></p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Acesso vitalício</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Atualizações incluídas</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Suporte VIP</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Sessão de onboarding</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleAssinar("Lifetime")}
                >
                  Comprar
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Todos os planos incluem 14 dias de teste grátis. Não é necessário cartão de crédito para iniciar. 
              Você pode cancelar a qualquer momento.
            </p>
          </div>
        </main>

        <footer className="bg-blue-800 text-white py-4 text-center">
          <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
}