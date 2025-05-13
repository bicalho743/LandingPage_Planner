import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { scrollToSection } from "@/lib/utils";
import { ClipboardCheck, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { leadSchema, type LeadFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function LandingPage() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema)
  });
  
  const leadMutation = useMutation({
    mutationFn: (data: LeadFormData) => {
      return apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Enviaremos mais informações sobre o PlannerPro para o seu email.",
        variant: "default",
      });
      reset();
      setIsSuccess(true);
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: LeadFormData) => {
    leadMutation.mutate(data);
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
        <header className="bg-blue-800 text-white py-8">
          <div className="container mx-auto text-center px-4">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white rounded-lg p-1.5 mr-2">
                <ClipboardCheck className="h-6 w-6 text-blue-800" />
              </div>
              <span className="text-2xl font-bold">PlannerPro</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Organize sua vida com estilo</h1>
            <p className="mt-4 text-xl">A solução completa para Personal Organizers</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <section className="my-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold mb-8">Benefícios do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Quero uma Base de Clientes Fiéis e Lucrativos!</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Não Quero Mais Esquecer Datas Importantes!</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Quero Controlar Minhas Finanças com Facilidade!</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Quero Simplificar Minha Rotina e Crescer!</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Quero Enviar Propostas Profissionais em Segundos!</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Não Vou Mais Perder Oportunidades de Vendas!</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Quero Ter Relatórios Claros e Precisos!</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="font-medium">✅ Não Quero Mais Planilhas Confusas!</p>
              </div>
            </div>
          </section>

          <section id="lead-form" className="my-16 text-center bg-gray-50 p-8 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Quer conhecer o PlannerPro?</h2>
            <p className="mb-6 text-gray-600">Cadastre-se para receber mais informações e testar gratuitamente</p>
            
            {isSuccess ? (
              <div className="py-8 text-center bg-white rounded-lg p-6 shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Obrigado pelo interesse!</h3>
                <p className="text-gray-600">
                  Acabamos de enviar um email com mais informações sobre o PlannerPro. 
                  Se não encontrar o email, verifique sua caixa de spam.
                </p>
                <Button 
                  className="mt-6 bg-blue-800 hover:bg-blue-700 text-white"
                  onClick={() => setIsSuccess(false)}
                >
                  Voltar ao formulário
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
                <div>
                  <input 
                    type="text" 
                    placeholder="Seu nome" 
                    className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 text-left">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <input 
                    type="email" 
                    placeholder="Seu melhor email" 
                    className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 text-left">{errors.email.message}</p>
                  )}
                </div>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-6 h-auto rounded-md text-lg font-medium"
                  type="submit"
                  disabled={leadMutation.isPending}
                >
                  {leadMutation.isPending ? "Processando..." : "Experimente Grátis"}
                </Button>
              </form>
            )}
            
            <p className="mt-4 text-sm text-gray-500">
              Não se preocupe, não enviaremos spam. Você pode cancelar a qualquer momento.
            </p>
          </section>
          
          <section className="my-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-8">O que nossos clientes dizem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <p className="italic text-gray-600 mb-4">
                  "O PlannerPro revolucionou meu negócio! Não consigo imaginar gerenciar meus clientes sem ele."
                </p>
                <p className="font-medium">Ana Silva</p>
                <p className="text-sm text-gray-500">Personal Organizer, RJ</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <p className="italic text-gray-600 mb-4">
                  "Economizo pelo menos 10 horas por semana em tarefas administrativas. Valeu cada centavo!"
                </p>
                <p className="font-medium">Ricardo Oliveira</p>
                <p className="text-sm text-gray-500">Organizer Profissional, SP</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <p className="italic text-gray-600 mb-4">
                  "As propostas profissionais me ajudaram a fechar mais contratos e aumentar minha credibilidade."
                </p>
                <p className="font-medium">Patrícia Mendes</p>
                <p className="text-sm text-gray-500">Consultora de Organização, MG</p>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-blue-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-white rounded-lg p-1 mr-2">
                  <ClipboardCheck className="h-5 w-5 text-blue-800" />
                </div>
                <span className="text-xl font-bold">PlannerPro</span>
              </div>
              <div className="text-center md:text-right">
                <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
                <p className="text-sm text-blue-200 mt-1">Desenvolvido com ❤️ para Personal Organizers</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}