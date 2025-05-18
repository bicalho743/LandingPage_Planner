import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import LeadForm from "../components/LeadForm";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Users, Star, Sun, BarChart2 } from "lucide-react";
import { StarFilled } from "../components/ui/icons";
import { scrollToSection } from "@/lib/utils";
import { 
  PlannerHeroImage, 
  WorkspaceImage, 
  DesignIntuitiveImage, 
  OrganizationCompleteImage, 
  PersonalizationFlexibleImage,
  ChevronDownIcon,
  FullStar
} from "../components/PlannerIcons";

export default function LandingPage() {
  // Usando o router do Next.js de forma compatível com wouter
  const router = {
    push: (path: string) => {
      setLocation(path);
    }
  } as any;
  
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleGetStarted = () => {
    router.push("/planos");
  };
  
  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setSubmitMessage("Por favor, insira um email válido.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage("");
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          name: email.split('@')[0] // Usar parte do email como nome temporário
        }),
      });
      
      if (response.ok) {
        setEmail("");
        setSubmitMessage("✅ Obrigado! Confira seu email para mais informações.");
      } else {
        setSubmitMessage("❌ Ocorreu um erro. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      setSubmitMessage("❌ Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      {/* Navbar */}
      <nav className="container mx-auto py-4 px-4 flex justify-between items-center sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">
            <span className="text-gray-800">Planner</span>
            <span className="text-green-600">Organiza</span>
          </h1>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-[#1e40af] font-medium">Início</a>
          <a 
            href="javascript:void(0)" 
            onClick={() => scrollToSection("funcionalidades")} 
            className="text-gray-600 hover:text-[#1e40af] font-medium"
          >
            Funcionalidades
          </a>
          <a 
            href="javascript:void(0)" 
            onClick={() => scrollToSection("depoimentos")} 
            className="text-gray-600 hover:text-[#1e40af] font-medium"
          >
            Depoimentos
          </a>
          <a 
            href="#contato" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("contato");
            }} 
            className="text-gray-600 hover:text-[#1e40af] font-medium"
          >
            Contato
          </a>
        </div>
      </nav>

      <main>
        {/* Bloco 1 - Hero Section */}
        <section className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Nunca Mais Perca Clientes e Oportunidades
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Você é uma Personal Organizer e já perdeu a conta dos clientes que não retornaram? Seu faturamento parece um mistério? Chega de confusão e incerteza. O PlannerOrganiza é a solução que você precisava.
            </p>
            <div className="space-y-3">
              <Button 
                className="bg-green-500 text-white hover:bg-green-600 w-full md:w-auto px-6 py-3 text-left flex items-center"
                onClick={handleGetStarted}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Quero uma Base de Clientes Fiéis e Lucrativos!
              </Button>
              <Button 
                className="bg-green-500 text-white hover:bg-green-600 w-full md:w-auto px-6 py-3 text-left flex items-center"
                onClick={handleGetStarted}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Não Quero Mais Esquecer Datas Importantes!
              </Button>
            </div>
            <div className="mt-6">
              <a href="#recursos" className="text-gray-500 hover:text-gray-700 font-medium">
                Ver Mais Recursos
              </a>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="relative">
              <p className="text-sm text-right text-gray-500 mb-2">
                Vida organizada com planner e acessórios
              </p>
              <div className="bg-gray-50 rounded-lg p-4 h-auto md:h-80 flex items-center justify-center">
                <img 
                  src="/stressed-woman.png" 
                  alt="Mulher estressada com papéis e planilhas" 
                  className="max-w-full h-auto rounded shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 2 - Recursos exclusivos */}
        <section id="recursos" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">RECURSOS EXCLUSIVOS PARA PERSONAL ORGANIZERS</p>
              <h2 className="text-3xl font-bold text-gray-900">Nunca Mais Perca um Cliente</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Desenvolvido especialmente para Personal Organizers que querem manter contato constante com seus clientes e ter controle total do negócio.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
              <Button 
                className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 text-left flex items-center"
                onClick={handleGetStarted}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Quero Controlar Minhas Finanças com Facilidade!
              </Button>
              <Button 
                className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 text-left flex items-center"
                onClick={handleGetStarted}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Quero Simplificar Minha Rotina e Crescer!
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex items-start">
                <div className="mr-4 text-yellow-500">
                  <Sun className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Design Intuitivo</h3>
                  <p className="text-gray-600">
                    Interface simples e elegante, projetada para tornar o gerenciamento de clientes e projetos mais prático.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 text-green-500">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Organização Completa</h3>
                  <p className="text-gray-600">
                    Controle total em um só lugar: clientes, propostas, finanças e tarefas, tudo organizado de forma clara e acessível.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 text-purple-500">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Personalização Flexível</h3>
                  <p className="text-gray-600">
                    Adapte o sistema às suas necessidades, criando fluxos e modelos que combinam com seu estilo de trabalho.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 text-blue-500">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Economia de Tempo</h3>
                  <p className="text-gray-600">
                    Automatize tarefas repetitivas e foque no que realmente importa: seu negócio e seus clientes. Ganhe horas valiosas em sua semana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 3 - Benefícios */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">BENEFÍCIOS</p>
              <h2 className="text-3xl font-bold text-gray-900">Transforme sua produtividade</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Descubra como o PlannerOrganiza pode revolucionar sua vida e ajudar a alcançar seus objetivos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5">
                <div className="bg-gray-50 rounded-lg p-4 h-auto flex items-center justify-center shadow-md">
                  <img 
                    src="/relaxed-reading.png" 
                    alt="Mulher tranquila lendo um livro" 
                    className="max-w-full h-auto rounded"
                  />
                </div>
              </div>
              
              <div className="md:col-span-7 space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Redução do Estresse Mental</h3>
                  <p className="text-gray-600">
                    Ter tudo registrado e organizado libera espaço mental, reduzindo a ansiedade e aumentando a sensação de controle.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Economia de Tempo</h3>
                  <p className="text-gray-600">
                    Planejamento eficiente pode economizar até 10 horas por semana, permitindo que você foque no que realmente importa.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Alcance de Metas</h3>
                  <p className="text-gray-600">
                    Estudos mostram que pessoas que escrevem seus objetivos têm 42% mais chances de alcançá-los.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 4 - Conheça o Planner */}
        <section id="planner-organizer" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Conheça o PlannerOrganiza</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Elegante, funcional e totalmente adaptado às suas necessidades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="bg-gray-50 mb-4 h-40 flex items-center justify-center rounded">
                    <img 
                      src="/design-intuitivo.svg" 
                      alt="Design Intuitivo" 
                      className="max-w-full h-auto"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Design Intuitivo</h3>
                  <p className="text-gray-600">
                    Interface simples e elegante, projetada para tornar o gerenciamento de clientes e projetos mais prático.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="bg-gray-50 mb-4 h-40 flex items-center justify-center rounded">
                    <img 
                      src="/organizacao-completa.svg" 
                      alt="Organização Completa" 
                      className="max-w-full h-auto"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Organização Completa</h3>
                  <p className="text-gray-600">
                    Controle total em um só lugar: clientes, propostas, finanças e tarefas, tudo organizado de forma clara e acessível.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="bg-gray-50 mb-4 h-40 flex items-center justify-center rounded">
                    <img 
                      src="/personalizacao-flexivel.svg" 
                      alt="Personalização Flexível" 
                      className="max-w-full h-auto"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Personalização Flexível</h3>
                  <p className="text-gray-600">
                    Adapte o sistema às suas necessidades, criando fluxos e modelos que combinam com seu estilo de trabalho.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Bloco 5 - Depoimentos */}
        <section id="depoimentos" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">O Que Nossos Clientes Dizem</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Personal Organizers que transformaram seu negócio com o PlannerOrganiza
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <FullStar />
                    <FullStar />
                    <FullStar />
                    <FullStar />
                    <FullStar />
                  </div>
                  <p className="text-gray-600 mb-6">
                    "Eu nunca mais esqueci o aniversário de um cliente, e meu faturamento cresceu 40%! Antes, eu perdia clientes por não manter contato no momento certo. O PlannerOrganiza é meu parceiro de negócios e me ajuda a controlar tudo."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-gray-200 w-10 h-10 rounded-full mr-3 flex items-center justify-center">
                      <span className="font-semibold text-gray-700">AC</span>
                    </div>
                    <div>
                      <p className="font-semibold">Ana Costa</p>
                      <p className="text-sm text-gray-500">Personal Organizer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <FullStar />
                    <FullStar />
                    <FullStar />
                    <FullStar />
                    <FullStar />
                  </div>
                  <p className="text-gray-600 mb-6">
                    "Antes, eu gastava horas tentando organizar meus clientes e finanças em planilhas confusas. Agora, faço tudo em minutos e nunca mais perdi oportunidades de recontrataçāo. O sistema de lembretes automáticos é simplesmente incrível!"
                  </p>
                  <div className="flex items-center">
                    <div className="bg-gray-200 w-10 h-10 rounded-full mr-3 flex items-center justify-center">
                      <span className="font-semibold text-gray-700">JS</span>
                    </div>
                    <div>
                      <p className="font-semibold">Julia Santos</p>
                      <p className="text-sm text-gray-500">Personal Organizer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <FullStar />
                    <FullStar />
                    <FullStar />
                    <FullStar />
                    <FullStar />
                  </div>
                  <p className="text-gray-600 mb-6">
                    "Meus clientes estavam sumindo e eu não sabia por quê. Desde que comecei a usar o PlannerOrganiza, tenho controle total sobre quem precisa de follow-up e quando foi a última organização. Meu negócio cresceu 35% em 3 meses!"
                  </p>
                  <div className="flex items-center">
                    <div className="bg-gray-200 w-10 h-10 rounded-full mr-3 flex items-center justify-center">
                      <span className="font-semibold text-gray-700">CM</span>
                    </div>
                    <div>
                      <p className="font-semibold">Carla Mendes</p>
                      <p className="text-sm text-gray-500">Personal Organizer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button 
                className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 text-left flex items-center"
                onClick={handleGetStarted}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Quero Enviar Propostas Profissionais em Segundos!
              </Button>
              <Button 
                className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 text-left flex items-center"
                onClick={handleGetStarted}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Não Vou Mais Perder Oportunidades de Vendas!
              </Button>
            </div>
          </div>
        </section>

        {/* Bloco 6 - FAQ */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Perguntas Frequentes</h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left focus:outline-none">
                    <h3 className="font-semibold text-lg">Como o PlannerOrganiza me ajuda a manter o contato com meus clientes?</h3>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </button>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left focus:outline-none">
                    <h3 className="font-semibold text-lg">Preciso instalar algum software no meu computador?</h3>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </button>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left focus:outline-none">
                    <h3 className="font-semibold text-lg">Como funciona o período de teste gratuito?</h3>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </button>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left focus:outline-none">
                    <h3 className="font-semibold text-lg">Quando serei cobrado após escolher um plano?</h3>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </button>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between items-center w-full text-left focus:outline-none">
                    <h3 className="font-semibold text-lg">O sistema guarda histórico de atendimentos aos clientes?</h3>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4 mt-12">
                <Button 
                  className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 text-left flex items-center"
                  onClick={handleGetStarted}
                >
                  <CheckCircle className="mr-2 h-5 w-5" /> Quero Ter Relatórios Claros e Precisos!
                </Button>
                <Button 
                  className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 text-left flex items-center"
                  onClick={handleGetStarted}
                >
                  <CheckCircle className="mr-2 h-5 w-5" /> Não Quero Mais Planilhas Confusas!
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 7 - CTA Final + Form */}
        <section id="funcionalidades" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Cansada de Anotar em Papéis Soltos e Esquecer Aniversários de Clientes?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Você é uma Personal Organizer e sente que está perdendo o controle? Seus clientes somem e você não sabe o que aconteceu? Datas importantes passam despercebidas, e você fica sem saber quando foi a última organização realizada?
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Controle Financeiro Completo: Visualize receitas, despesas e lucros em tempo real.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Gestão de Clientes Simplificada: Cadastre clientes, acompanhe aniversários e veja o histórico de atendimento.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Lembretes Automáticos Inteligentes: Receba alertas de aniversário e saiba quando foi realizada a última organização.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Envio de Propostas Profissionais: Crie e envie em PDF com apenas um clique.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Relatórios Poderosos: Visualize métricas de desempenho e crescimento.</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-lg flex items-center mb-4">
                    <span className="mr-2 text-yellow-500">💡</span> Como Funciona?
                  </h3>
                  <ol className="space-y-2 list-decimal pl-5">
                    <li>Cadastre seus clientes com todas as informações importantes, incluindo datas de aniversário e última organização.</li>
                    <li>Crie e envie propostas personalizadas diretamente pela plataforma.</li>
                    <li>Controle suas finanças e visualize seu lucro.</li>
                    <li>Tenha relatórios automáticos e métricas de desempenho.</li>
                  </ol>
                  
                  <div className="mt-6">
                    <Button 
                      className="bg-green-500 text-white hover:bg-green-600 w-full px-6 py-3 text-left flex items-center"
                      onClick={handleGetStarted}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" /> Não Vou Mais Perder Oportunidades de Vendas!
                    </Button>
                  </div>
                </div>

                <div id="contato" className="mt-8">
                  <div className="mb-4">
                    <input 
                      type="email" 
                      placeholder="Digite seu e-mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    className="w-full bg-[#1e40af] text-white hover:bg-[#1e3a8a] py-3 text-center font-bold text-lg"
                    onClick={handleSubscribe}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Sim, Quero Resolver Meu Negócio!"}
                  </Button>
                  {submitMessage && (
                    <p className="mt-2 text-center font-medium">{submitMessage}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="mb-4">&copy; 2025 PlannerOrganiza. Todos os direitos reservados.</p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">Termos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-white">Política de Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-white">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}