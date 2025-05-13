import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";

export default function LandingPage() {
  const [location, setLocation] = useLocation();

  const handleGetStarted = () => {
    // Aqui utilizamos wouter em vez de next/router
    setLocation("/planos");
  };

  return (
    <>
      <Helmet>
        <title>PlannerPro - Organize sua vida com estilo</title>
        <meta name="description" content="A solução completa para Personal Organizers. Controle clientes, finanças e propostas em um só lugar." />
        <meta property="og:title" content="PlannerPro - Organize sua vida com estilo" />
        <meta property="og:description" content="A solução completa para Personal Organizers. Controle clientes, finanças e propostas em um só lugar." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-white text-gray-800 font-sans min-h-screen">
        <header className="bg-blue-800 text-white py-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold">PlannerPro - Organize sua vida com estilo</h1>
            <p className="mt-2 text-lg">A solução completa para Personal Organizers</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <section className="my-8 text-center">
            <h2 className="text-3xl font-semibold">Benefícios do Sistema</h2>
            <ul className="list-none mt-4 space-y-2">
              <li>✅ Quero uma Base de Clientes Fiéis e Lucrativos!</li>
              <li>✅ Não Quero Mais Esquecer Datas Importantes!</li>
              <li>✅ Quero Controlar Minhas Finanças com Facilidade!</li>
              <li>✅ Quero Simplificar Minha Rotina e Crescer!</li>
              <li>✅ Quero Enviar Propostas Profissionais em Segundos!</li>
              <li>✅ Não Vou Mais Perder Oportunidades de Vendas!</li>
              <li>✅ Quero Ter Relatórios Claros e Precisos!</li>
              <li>✅ Não Quero Mais Planilhas Confusas!</li>
            </ul>
          </section>

          <section className="my-8 text-center">
            <Button 
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 h-auto" 
              onClick={handleGetStarted}
            >
              Experimente Grátis
            </Button>
          </section>
        </main>

        <footer className="bg-blue-800 text-white py-4 text-center">
          <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
}