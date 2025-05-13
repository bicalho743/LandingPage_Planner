import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useLocation } from "wouter";

export default function LandingPage() {
  // Usando o router do Next.js de forma compatível com wouter
  const router = {
    push: (path: string) => {
      setLocation(path);
    }
  } as any;
  
  const [_, setLocation] = useLocation();

  const handleGetStarted = () => {
    router.push("/planos");
  };

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Quero uma Base de Clientes Fiéis e Lucrativos!</Button>
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Não Quero Mais Esquecer Datas Importantes!</Button>
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Quero Controlar Minhas Finanças com Facilidade!</Button>
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Quero Simplificar Minha Rotina e Crescer!</Button>
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Quero Enviar Propostas Profissionais em Segundos!</Button>
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Não Vou Mais Perder Oportunidades de Vendas!</Button>
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Quero Ter Relatórios Claros e Precisos!</Button>
            <Button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700" onClick={handleGetStarted}>✅ Não Quero Mais Planilhas Confusas!</Button>
          </div>
        </section>

        <section className="my-8 text-center">
          <Button className="bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-900" onClick={handleGetStarted}>
            Experimente Grátis
          </Button>
        </section>
      </main>

      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}