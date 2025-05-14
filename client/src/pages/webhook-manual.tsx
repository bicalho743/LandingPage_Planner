import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export default function WebhookManualPage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const enviarWebhook = async () => {
    if (!userId || !email) {
      toast({
        title: "Campos obrigatórios",
        description: "ID do usuário e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Codificar senha em base64
      const encodedPassword = Buffer.from(password).toString('base64');
      
      // Estrutura do evento de checkout.session.completed
      const payload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_' + Math.random().toString(36).substring(2, 15),
            customer_email: email,
            metadata: {
              userId: userId,
              senha: encodedPassword
            }
          }
        }
      };

      // Enviar para o endpoint /api/webhook-direto
      const result = await axios.post('/api/webhook-direto', payload);
      
      setResponse(JSON.stringify(result.data, null, 2));
      
      toast({
        title: "Webhook enviado",
        description: "Webhook enviado com sucesso! Verifique os logs do servidor.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Erro ao enviar webhook:', error);
      
      setResponse(JSON.stringify({
        error: true,
        message: error.response?.data || error.message
      }, null, 2));
      
      toast({
        title: "Erro ao enviar webhook",
        description: error.response?.data || error.message || "Ocorreu um erro ao enviar o webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Webhook Manual - Stripe</h1>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enviar Webhook Manualmente</CardTitle>
            <CardDescription>
              Esta ferramenta envia um webhook do Stripe de forma manual, 
              sem verificação de assinatura, para fins de teste.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ID do Usuário</label>
              <Input 
                type="text" 
                placeholder="ID do usuário (número)" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="Email do usuário" 
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
                  {response}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={enviarWebhook}
              disabled={loading}
            >
              {loading ? "Processando..." : "Enviar Webhook"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}