import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function TestPanel() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [useTrial, setUseTrial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleCompleteRegistration = async () => {
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe um email para testar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setResponse(null);

    try {
      const result = await apiRequest('POST', '/api/test/complete-registration', { email, useTrial });
      const data = await result.json();
      
      setResponse(data);
      
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: data.message || "Operação realizada com sucesso",
          variant: "default",
        });
      } else {
        toast({
          title: "Erro",
          description: data.message || "Ocorreu um erro na operação",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setResponse({ success: false, error: error.message });
      toast({
        title: "Erro na requisição",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Painel de Testes</CardTitle>
        <CardDescription>
          Use este painel para testar funções do sistema (apenas desenvolvimento)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email do usuário
            </label>
            <Input
              type="email"
              placeholder="Informe o email para testar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="use-trial"
              checked={useTrial}
              onChange={(e) => setUseTrial(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="use-trial" className="text-sm font-medium text-gray-700">
              Ativar período de trial (7 dias)
            </label>
          </div>
          
          {response && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Resposta:</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setResponse(null)}
        >
          Limpar
        </Button>
        <Button 
          onClick={handleCompleteRegistration}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : "Simular Webhook"}
        </Button>
      </CardFooter>
    </Card>
  );
}