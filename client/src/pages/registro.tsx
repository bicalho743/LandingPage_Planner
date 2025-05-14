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
      
      // Redirecionar para o checkout do Stripe
      if (data.checkoutUrl) {
        // Timeout para permitir que o toast seja visto
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 1500);
      } else {
        setLocation('/planos');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível completar o cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Criar conta no PlannerPro</h1>
          
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
              </select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-md hover:from-blue-700 hover:to-blue-900 transition duration-300 flex items-center justify-center"
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
              ) : "Criar conta e prosseguir para pagamento"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já possui uma conta?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}