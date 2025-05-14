import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export default function ExemploWebhookPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const simulateCheckout = async () => {
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Email e senha são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Simular criação de usuário pendente com a senha
      const createUserResponse = await axios.post('/api/register', {
        name: "Teste Webhook",
        email: email,
        password: password,
        planType: 'monthly'
      });

      if (createUserResponse.data.userId) {
        setResponse({
          step1: "Usuário pendente criado com sucesso",
          userId: createUserResponse.data.userId
        });

        // 2. Simular o webhook do Stripe
        const webhookResponse = await axios.post('/api/stripe-webhook-new', {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_' + Math.random().toString(36).substring(2, 12),
              customer_email: email,
              metadata: {
                userId: createUserResponse.data.userId.toString(),
                name: "Teste Webhook",
                email: email,
                senha: Buffer.from(password).toString('base64'),
                planType: 'monthly',
                trial: 'false'
              }
            }
          }
        });

        setResponse(prev => ({
          ...prev,
          step2: "Webhook simulado executado com status: " + webhookResponse.status,
          webhookResponse: webhookResponse.data
        }));

        toast({
          title: "Simulação concluída",
          description: "Checkout e webhook simulados com sucesso",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Erro na simulação:", error);
      toast({
        title: "Erro na simulação",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao simular o checkout e webhook",
        variant: "destructive"
      });
      setResponse({
        error: true,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Simulação de Webhook do Stripe</h1>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Simulador de Webhook</CardTitle>
            <CardDescription>
              Esta ferramenta simula o fluxo completo de checkout e webhook do Stripe para fins de teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input 
                type="password" 
                placeholder="Senha para criar usuário" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {response && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium mb-2">Resposta:</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={simulateCheckout}
              disabled={loading}
            >
              {loading ? "Processando..." : "Simular Checkout e Webhook"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}