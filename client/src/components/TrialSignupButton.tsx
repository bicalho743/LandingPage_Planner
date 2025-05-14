import React from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TrialSignupProps {
  planType?: 'monthly' | 'annual' | 'lifetime';
  buttonText?: string;
  className?: string;
}

export default function TrialSignupButton({ 
  planType = 'monthly',
  buttonText = 'Iniciar Trial de 7 Dias',
  className
}: TrialSignupProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleTrialSignup = async () => {
    try {
      setLoading(true);
      
      // Simulação: Em uma implementação real, você abriria um modal para pegar os dados do usuário
      const userData = {
        name: "Usuário Teste Trial",
        email: `teste-${Date.now()}@example.com`,
        password: "Senha123!",
        planType: planType
      };
      
      // Chamar a API para iniciar o checkout de trial
      const response = await axios.post('/api/trial-checkout', userData);
      
      if (response.data.checkoutUrl) {
        // Redirecionar para o checkout do Stripe
        window.location.href = response.data.checkoutUrl;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o checkout. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Erro ao iniciar trial:', error);
      
      toast({
        title: "Erro ao iniciar trial",
        description: error.response?.data?.error || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleTrialSignup} 
      className={className}
      disabled={loading}
      variant="default"
    >
      {loading ? "Processando..." : buttonText}
    </Button>
  );
}