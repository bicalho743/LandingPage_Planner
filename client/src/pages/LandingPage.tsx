import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import LeadForm from "../components/LeadForm";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Users, TrendingUp, Calendar, FileText, PieChart, BarChart } from "lucide-react";

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
    <div className="bg-gradient-to-b from-gray-50 to-white text-gray-800 font-sans min-h-screen">
      {/* Hero Section com gradiente */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            PlannerPro - Organize sua vida com estilo
          </h1>
          <p className="mt-2 text-xl md:text-2xl max-w-2xl mx-auto text-blue-100">
            A solução completa para Personal Organizers que querem crescer
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300" 
              onClick={handleGetStarted}
            >
              Experimente Grátis
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg" 
              onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Conheça os Benefícios
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Seção de recursos com cards */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-800">
            Por que escolher o <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-green-600">PlannerPro?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
              <div className="h-2 bg-blue-600"></div>
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <CheckCircle className="text-blue-600 h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Design Intuitivo</h3>
                <p className="text-gray-600">Interface simples e elegante, fácil de usar, projetada para aumentar sua produtividade.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
              <div className="h-2 bg-green-600"></div>
              <CardContent className="pt-6">
                <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="text-green-600 h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Economia de Tempo</h3>
                <p className="text-gray-600">Automatize tarefas repetitivas e ganhe horas valiosas todo mês para focar no que importa.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
              <div className="h-2 bg-purple-600"></div>
              <CardContent className="pt-6">
                <div className="rounded-full bg-purple-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="text-purple-600 h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Gestão de Clientes</h3>
                <p className="text-gray-600">Organize e acompanhe seu relacionamento com clientes para nunca perder uma oportunidade.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
              <div className="h-2 bg-yellow-600"></div>
              <CardContent className="pt-6">
                <div className="rounded-full bg-yellow-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="text-yellow-600 h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Crescimento Garantido</h3>
                <p className="text-gray-600">Aumente seu faturamento e expanda seu negócio com ferramentas focadas em resultados.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Seção de benefícios com botões grandes */}
        <section id="beneficios" className="mb-20 py-10 px-4 md:px-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-blue-800">
            Benefícios do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start group hover:bg-white p-4 rounded-lg transition-all duration-300">
              <div className="rounded-full bg-blue-100 p-2 group-hover:bg-blue-200 transition-all">
                <Users className="text-blue-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-blue-800 group-hover:text-blue-700">Base de Clientes Fiéis e Lucrativos</h3>
                <p className="text-gray-600 mb-3">Gerencie seus clientes de forma eficiente e transforme leads em clientes fiéis</p>
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleGetStarted}>Quero começar agora</Button>
              </div>
            </div>
            
            <div className="flex gap-4 items-start group hover:bg-white p-4 rounded-lg transition-all duration-300">
              <div className="rounded-full bg-green-100 p-2 group-hover:bg-green-200 transition-all">
                <Calendar className="text-green-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-green-800 group-hover:text-green-700">Controle de Datas Importantes</h3>
                <p className="text-gray-600 mb-3">Nunca mais esqueça datas importantes com nosso sistema de lembretes inteligentes</p>
                <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handleGetStarted}>Quero começar agora</Button>
              </div>
            </div>
            
            <div className="flex gap-4 items-start group hover:bg-white p-4 rounded-lg transition-all duration-300">
              <div className="rounded-full bg-purple-100 p-2 group-hover:bg-purple-200 transition-all">
                <PieChart className="text-purple-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-purple-800 group-hover:text-purple-700">Controle Financeiro Simplificado</h3>
                <p className="text-gray-600 mb-3">Gerencie suas finanças com facilidade e tenha uma visão clara das suas receitas e despesas</p>
                <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={handleGetStarted}>Quero começar agora</Button>
              </div>
            </div>
            
            <div className="flex gap-4 items-start group hover:bg-white p-4 rounded-lg transition-all duration-300">
              <div className="rounded-full bg-yellow-100 p-2 group-hover:bg-yellow-200 transition-all">
                <Clock className="text-yellow-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-yellow-800 group-hover:text-yellow-700">Rotina Simplificada</h3>
                <p className="text-gray-600 mb-3">Otimize seu tempo e foque no crescimento do seu negócio com processos automatizados</p>
                <Button className="bg-yellow-600 text-white hover:bg-yellow-700" onClick={handleGetStarted}>Quero começar agora</Button>
              </div>
            </div>
            
            <div className="flex gap-4 items-start group hover:bg-white p-4 rounded-lg transition-all duration-300">
              <div className="rounded-full bg-red-100 p-2 group-hover:bg-red-200 transition-all">
                <FileText className="text-red-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-red-800 group-hover:text-red-700">Propostas Profissionais</h3>
                <p className="text-gray-600 mb-3">Crie propostas profissionais em segundos e impressione seus clientes</p>
                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleGetStarted}>Quero começar agora</Button>
              </div>
            </div>
            
            <div className="flex gap-4 items-start group hover:bg-white p-4 rounded-lg transition-all duration-300">
              <div className="rounded-full bg-indigo-100 p-2 group-hover:bg-indigo-200 transition-all">
                <BarChart className="text-indigo-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-indigo-800 group-hover:text-indigo-700">Relatórios Claros e Precisos</h3>
                <p className="text-gray-600 mb-3">Tenha acesso a relatórios detalhados e tome decisões baseadas em dados concretos</p>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleGetStarted}>Quero começar agora</Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA + Formulário Lead */}
        <section className="my-20 flex flex-col md:flex-row gap-8 items-center justify-center bg-white rounded-xl shadow-xl p-8">
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-800">
              Transforme seu negócio <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-green-600">hoje mesmo!</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Junte-se a milhares de profissionais que estão economizando tempo e aumentando seus lucros com o PlannerPro.
            </p>
            <Button 
              size="lg" 
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-6 text-lg shadow-lg font-bold" 
              onClick={handleGetStarted}
            >
              Começar Trial de 7 Dias
            </Button>
          </div>
          <div className="md:w-1/2 max-w-md">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 shadow-lg rounded-lg p-8 border border-blue-100">
              <h3 className="text-2xl font-bold mb-4 text-center text-blue-800">
                Receba Novidades
              </h3>
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">PlannerPro</h3>
              <p className="text-blue-200 max-w-xs">
                A melhor solução para personal organizers que querem crescer e se destacar no mercado.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Entre em Contato</h4>
              <p className="text-blue-200">contato@plannerorganiza.com.br</p>
            </div>
          </div>
          <div className="border-t border-blue-700 mt-8 pt-8 text-center">
            <p className="text-blue-200">© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}