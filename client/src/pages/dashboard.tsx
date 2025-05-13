import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { logout } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    planType: string;
    status: string;
    currentPeriodEnd: string;
    isActive: boolean;
  } | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  
  // Buscar informações da assinatura
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!user?.email) return;
      
      try {
        setIsLoadingSubscription(true);
        const response = await fetch(`/api/user/subscription?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        
        if (data.success && data.hasSubscription) {
          setSubscriptionInfo(data.subscription);
        } else {
          console.log('Usuário não possui assinatura:', data.message);
        }
      } catch (error) {
        console.error('Erro ao buscar informações da assinatura:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as informações da sua assinatura.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSubscription(false);
      }
    };
    
    fetchSubscriptionInfo();
  }, [user?.email, toast]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado com sucesso.",
      });
      setLocation("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar sair. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  // Formatar o tipo de plano para exibição
  const getPlanTypeDisplay = (planType: string | undefined) => {
    if (!planType) return 'Desconhecido';
    switch (planType) {
      case 'monthly': return 'Mensal';
      case 'annual': return 'Anual';
      case 'lifetime': return 'Vitalício';
      default: return planType.charAt(0).toUpperCase() + planType.slice(1);
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800 font-sans min-h-screen">
      <header className="bg-blue-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">PlannerPro Dashboard</h1>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-blue-700"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <span className="flex items-center">
                <span className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full mr-2"></span>
                Saindo...
              </span>
            ) : "Sair"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            Bem-vindo, {user?.email?.split('@')[0] || 'Usuário'}!
          </h2>
          <div className="flex items-center mb-4 text-gray-600">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <span className="text-blue-700 font-semibold text-lg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm">Logado como: <span className="font-medium">{user?.email}</span></p>
              <p className="text-xs text-gray-500">
                Membro desde: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-gray-600">
            Você agora tem acesso a todas as funcionalidades do PlannerPro Organizer.
            Este é um dashboard personalizado com suas informações e estatísticas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Clientes</h3>
            <p className="text-gray-600 mb-4">Gerencie seus clientes e projetos em andamento.</p>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">0 clientes cadastrados</p>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Adicionar Cliente
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Projetos</h3>
            <p className="text-gray-600 mb-4">Acompanhe o progresso dos seus projetos de organização.</p>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">0 projetos em andamento</p>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Criar Projeto
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Sua Assinatura</h3>
            
            {isLoadingSubscription ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : subscriptionInfo ? (
              <>
                <div className={`p-4 rounded-md mb-4 ${subscriptionInfo.isActive ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <p className={`text-sm font-medium ${subscriptionInfo.isActive ? 'text-green-800' : 'text-yellow-800'}`}>
                    {subscriptionInfo.isActive ? 'Ativa' : 'Inativa'}
                  </p>
                  <p className={`text-xs mt-1 ${subscriptionInfo.isActive ? 'text-green-700' : 'text-yellow-700'}`}>
                    {subscriptionInfo.isActive 
                      ? 'Seu plano está ativo e funcionando' 
                      : 'Sua assinatura precisa de atenção'}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Plano:</span> {getPlanTypeDisplay(subscriptionInfo.planType)}</p>
                  {subscriptionInfo.planType !== 'lifetime' && subscriptionInfo.currentPeriodEnd && (
                    <p>
                      <span className="font-medium">Próxima renovação:</span>{' '}
                      {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                  {subscriptionInfo.planType === 'lifetime' && (
                    <p className="text-green-700 font-medium text-xs mt-1">
                      Acesso vitalício sem renovações
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-800">Nenhuma assinatura encontrada</p>
                <p className="text-xs text-gray-600 mt-1">
                  Você ainda não possui um plano ativo
                </p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-blue-600 text-blue-600"
              onClick={() => setLocation("/planos")}
            >
              {subscriptionInfo ? 'Gerenciar Assinatura' : 'Adquirir um Plano'}
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}