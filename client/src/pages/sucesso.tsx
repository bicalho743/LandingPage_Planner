import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useSearch } from "wouter";
import { Check, CheckCircle, Award, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Sucesso() {
  const [_, setLocation] = useLocation();
  const search = useSearch();
  const [planInfo, setPlanInfo] = useState({
    type: '',
    name: '',
    period: '',
    features: [] as string[]
  });

  useEffect(() => {
    // Obter informações do plano da URL ou definir um padrão
    const urlParams = new URLSearchParams(window.location.search);
    const planType = urlParams.get('plan') || 'unknown';
    console.log('Parâmetros da URL:', window.location.search);
    console.log('Tipo de plano detectado:', planType);
    
    // Definir informações do plano com base no parâmetro
    if (planType === 'mensal') {
      setPlanInfo({
        type: 'mensal',
        name: 'Plano Mensal',
        period: 'Período de acesso: 1 mês com renovação automática',
        features: [
          'Acesso a todas as funcionalidades básicas',
          'Suporte por email',
          'Período de teste de 7 dias'
        ]
      });
    } else if (planType === 'anual') {
      setPlanInfo({
        type: 'anual',
        name: 'Plano Anual',
        period: 'Período de acesso: 12 meses com renovação automática',
        features: [
          'Acesso a todas as funcionalidades premium',
          'Suporte prioritário',
          'Período de teste de 7 dias',
          'Economia de 20% em relação ao plano mensal'
        ]
      });
    } else if (planType === 'vitalicio') {
      setPlanInfo({
        type: 'vitalicio',
        name: 'Plano Vitalício',
        period: 'Acesso vitalício sem cobranças recorrentes',
        features: [
          'Acesso permanente a todas as funcionalidades',
          'Suporte VIP',
          'Acesso a futuras atualizações sem custo adicional',
          'Economia significativa a longo prazo'
        ]
      });
    } else {
      setPlanInfo({
        type: 'unknown',
        name: 'Plano Contratado',
        period: 'Verifique seu email para detalhes sobre seu acesso',
        features: [
          'Acesso a todas as funcionalidades contratadas',
          'Suporte ao cliente'
        ]
      });
    }
  }, [search]);

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800 font-sans min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-green-600">Pagamento Confirmado!</h1>
            <p className="mt-4 text-lg">Obrigado por se inscrever no PlannerPro Organizer.</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">{planInfo.name}</h2>
            <p className="text-blue-700 mb-4">{planInfo.period}</p>
            
            <h3 className="font-medium text-blue-900 mb-2">Benefícios do seu plano:</h3>
            <ul className="space-y-2">
              {planInfo.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="mb-2">
                  <strong>Importante:</strong> Para completar seu registro, siga estas etapas:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Você receberá um e-mail de confirmação com um link para definir sua senha</li>
                  <li>Se não receber o e-mail em alguns minutos, verifique sua pasta de spam</li>
                  <li>Na tela de login, use o e-mail que você forneceu durante o checkout</li>
                </ol>
                <p className="mt-2 text-xs text-gray-600">
                  <strong>Nota:</strong> Em ambiente de desenvolvimento, os e-mails podem não ser enviados automaticamente. 
                  A criação da conta ocorre quando o Stripe notifica nosso servidor através de um webhook, o que requer 
                  configurações adicionais em ambiente local.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 rounded-md"
              onClick={() => setLocation("/login")}
            >
              Acessar o Sistema
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}