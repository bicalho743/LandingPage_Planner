import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { apiRequest } from '@/lib/queryClient';

export default function Registro() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [plano, setPlano] = useState('mensal');

  // Obter o parâmetro da URL se disponível
  const searchParams = new URLSearchParams(window.location.search);
  const planoParam = searchParams.get('plano');
  const emailParam = searchParams.get('email');

  // Usar o plano da URL se disponível
  React.useEffect(() => {
    if (planoParam && ['mensal', 'anual', 'vitalicio'].includes(planoParam)) {
      setPlano(planoParam);
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [planoParam, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!nome.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, informe seu nome.",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, informe um e-mail válido.",
        variant: "destructive",
      });
      return;
    }
    
    if (senha.length < 6) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    if (senha !== confirmarSenha) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Enviar requisição para a API de registro
      const response = await apiRequest("POST", "/api/register", {
        nome,
        email,
        senha,
        plano
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erro ao registrar usuário");
      }
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você será redirecionado para finalizar o pagamento.",
      });
      
      // Redirecionar com base na resposta
      if (data.checkoutUrl) {
        // Para planos pagos, redirecionar para o checkout do Stripe
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será redirecionado para a página de pagamento.",
        });
        
        // Timeout para permitir que o toast seja visto
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 1500);
      } else if (data.redirectTo) {
        // Para sincronização ou outras ações especiais
        toast({
          title: "Operação concluída!",
          description: data.message || "Operação realizada com sucesso.",
        });
        
        // Timeout para permitir que o toast seja visto
        setTimeout(() => {
          window.location.href = data.redirectTo;
        }, 1500);
      } else if (data.redirectUrl) {
        // Para o plano gratuito, redirecionar para o dashboard
        toast({
          title: "Cadastro concluído!",
          description: "Seu cadastro no plano gratuito foi concluído com sucesso.",
        });
        
        // Timeout para permitir que o toast seja visto
        setTimeout(() => {
          setLocation(data.redirectUrl);
        }, 1500);
      } else {
        // Caso não tenha URL de redirecionamento, voltar para planos
        setLocation('/planos');
      }
    } catch (error: any) {
      // Mensagem mais amigável para erro de usuário já cadastrado
      if (error.message && error.message.includes("já está cadastrado")) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já possui uma conta. Por favor, faça login.",
          variant: "destructive",
        });
        // Adicionar um pequeno atraso para mostrar o toast antes de redirecionar
        setTimeout(() => {
          setLocation('/login');
        }, 2500);
      } else {
        toast({
          title: "Erro ao cadastrar",
          description: error.message || "Não foi possível completar o cadastro. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-blue-100">
          <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Criar conta no PlannerOrganiza</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite seu nome completo"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite seu e-mail"
                required
              />
            </div>
            
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Crie uma senha (min. 6 caracteres)"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a senha novamente"
                required
              />
            </div>
            
            <div>
              <label htmlFor="plano" className="block text-sm font-medium text-gray-700 mb-1">
                Plano selecionado
              </label>
              <select
                id="plano"
                value={plano}
                onChange={(e) => setPlano(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="mensal">Plano Mensal</option>
                <option value="anual">Plano Anual (Economize 20%)</option>
                <option value="vitalicio">Plano Vitalício (Pagamento único)</option>
                <option value="free">Plano Gratuito (Recursos limitados)</option>
              </select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition duration-300 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : plano === 'free' ? "Criar conta gratuita" : "Criar conta e prosseguir para pagamento"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já possui uma conta?{" "}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Faça login
              </a>
            </p>
          </div>
          
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 text-center">
              O PlannerOrganiza é sua solução completa para organização pessoal e profissional.
            </p>
            <div className="flex justify-center mt-2 space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}