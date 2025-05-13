import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import LeadForm from "../components/LeadForm";

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <section className="py-12 md:py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
          PlannerPro Organizer
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-[800px]">
          A solução completa para organizar sua vida, tarefas e projetos em um só lugar.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            onClick={() => navigate("/planos")}
            size="lg" 
            className="bg-primary text-white hover:bg-primary/90"
          >
            Ver Planos
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
            Entrar
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Organize sua vida com eficiência</h2>
          <p className="text-muted-foreground">
            Gerencie tarefas, projetos e compromissos com nossa interface intuitiva e poderosa.
            Aumente sua produtividade e nunca mais perca prazos importantes.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Organize tarefas por projetos e categorias</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Defina prioridades e prazos</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Receba lembretes personalizados</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Sincronize entre todos os seus dispositivos</span>
            </li>
          </ul>
        </div>
        <div>
          <LeadForm />
        </div>
      </section>

      <section className="py-12 md:py-24 text-center">
        <h2 className="text-3xl font-bold mb-8">Funcionalidades Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Planejamento Diário</h3>
            <p>Visualize e organize suas tarefas diárias de forma eficiente com nosso sistema de planejamento intuitivo.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Projetos e Metas</h3>
            <p>Defina e acompanhe projetos e metas de longo prazo, dividindo-os em tarefas gerenciáveis.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Relatórios e Análises</h3>
            <p>Acompanhe seu progresso com relatórios detalhados e análises de produtividade personalizadas.</p>
          </div>
        </div>
      </section>
    </div>
  );
}