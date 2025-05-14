import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TrialSignupButton from '@/components/TrialSignupButton';
import TestPanel from '@/components/TestPanel';

export default function TesteTrialPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Página de Teste - Trial de 7 Dias</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Teste de Trial com Stripe</CardTitle>
              <CardDescription>
                Inicie um checkout de Stripe com período trial de 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Este componente cria um checkout do Stripe configurado com um período trial de 7 dias.
                Durante este período, o usuário terá acesso completo ao sistema, sem ser cobrado.
                Após os 7 dias, o método de pagamento registrado será cobrado automaticamente.
              </p>
              <p className="text-sm font-medium">
                Detalhes técnicos:
              </p>
              <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
                <li>O checkout é configurado com <code>trial_period_days: 7</code></li>
                <li>O Firebase é criado imediatamente após a confirmação do checkout</li>
                <li>As datas de <code>trial_start</code> e <code>trial_end</code> são salvas no banco</li>
                <li>O usuário pode usar cupons promocionais no checkout</li>
              </ul>
            </CardContent>
            <CardFooter>
              <TrialSignupButton 
                planType="monthly"
                buttonText="Iniciar Trial de 7 Dias (Plano Mensal)"
                className="w-full"
              />
            </CardFooter>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Teste Simplificado</CardTitle>
              <CardDescription>
                Use esta ferramenta para ativar usuários com período trial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Esta seção permite testar a ativação de usuários com período trial sem precisar passar pelo checkout do Stripe.
                É útil para testar a lógica de período trial no ambiente de desenvolvimento.
              </p>
              <p className="text-sm font-medium">
                Funcionalidades:
              </p>
              <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
                <li>Ativação imediata do usuário no Firebase</li>
                <li>Configuração das datas de trial no banco</li>
                <li>Simulação do webhook do Stripe</li>
                <li>Visualização das informações do usuário ativado</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  window.location.href = "/teste"; 
                }}
              >
                Ir para Painel de Testes
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <TestPanel />
      </div>
    </MainLayout>
  );
}