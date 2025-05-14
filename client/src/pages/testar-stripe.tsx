import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestarStripePage() {
  const { toast } = useToast();
  const [testingStripe, setTestingStripe] = useState(false);
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [secretKey, setSecretKey] = useState('');
  const [activeTab, setActiveTab] = useState('cli');

  const generateLogEntry = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${message}`;
  };

  const addLog = (message: string) => {
    setOutputLog(prev => [...prev, generateLogEntry(message)]);
  };

  const startStripeCLI = async () => {
    try {
      setTestingStripe(true);
      addLog('🚀 Iniciando Stripe CLI...');
      addLog('⏳ Aguardando resposta do servidor...');
      
      // Simular a execução do CLI com um fetch para o seu próprio servidor
      const response = await fetch('/api/admin/stripe-cli-status', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.running) {
          addLog('✅ Stripe CLI já está em execução!');
          addLog(`📡 Webhook signing secret: ${data.webhookSecret || 'não disponível'}`);
          addLog('✅ Eventos estão sendo redirecionados para sua aplicação.');
        } else {
          addLog('⚠️ Stripe CLI não está em execução.');
          addLog('🔄 Para iniciar, execute o comando abaixo em um terminal:');
          addLog('$ bash run-stripe-cli.sh');
        }
      } else {
        throw new Error('Falha ao verificar status do Stripe CLI');
      }
    } catch (error) {
      console.error('Erro ao iniciar Stripe CLI:', error);
      addLog('❌ Erro ao verificar status do Stripe CLI');
      addLog('🔄 Para iniciar manualmente, execute:');
      addLog('$ bash run-stripe-cli.sh');
      
      toast({
        title: 'Erro ao iniciar Stripe CLI',
        description: 'Verifique os logs para mais detalhes.',
        variant: 'destructive'
      });
    } finally {
      setTestingStripe(false);
    }
  };

  const clearLogs = () => {
    setOutputLog([]);
  };

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: 'Comando copiado!',
      description: 'O comando foi copiado para a área de transferência.',
      variant: 'default'
    });
  };

  const triggerTestEvent = async () => {
    try {
      setTestingStripe(true);
      addLog('🔄 Enviando evento de teste para o Stripe...');
      
      if (!secretKey) {
        addLog('⚠️ Chave secreta não fornecida. Usando chave de ambiente.');
      }
      
      const response = await fetch('/api/admin/stripe-test-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: 'checkout.session.completed',
          secretKey: secretKey || undefined
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog('✅ Evento enviado com sucesso!');
        addLog(`📝 ID do evento: ${data.eventId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao enviar evento de teste');
      }
    } catch (error: any) {
      console.error('Erro ao enviar evento de teste:', error);
      addLog(`❌ Erro ao enviar evento de teste: ${error.message}`);
      
      toast({
        title: 'Erro ao enviar evento',
        description: error.message || 'Verifique os logs para mais detalhes.',
        variant: 'destructive'
      });
    } finally {
      setTestingStripe(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Testar Stripe CLI & Webhooks</h1>
        
        <Alert className="mb-6">
          <AlertTitle>Importante!</AlertTitle>
          <AlertDescription>
            Para testar eventos reais do Stripe, você precisa do Stripe CLI instalado em sua máquina.
            Alternativamente, você pode usar o webhook simulado em /webhook-manual para testes locais.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="cli" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="cli">Usar Stripe CLI</TabsTrigger>
            <TabsTrigger value="api">Disparar Evento de Teste</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cli" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurar Stripe CLI</CardTitle>
                <CardDescription>
                  Execute o Stripe CLI para receber eventos reais do Stripe em seu ambiente de desenvolvimento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-auto">
                  <p># Instalar o Stripe CLI:</p>
                  <div className="flex items-center justify-between mt-2">
                    <code>curl -s https://packages.stripe.dev/api/security/key/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg &gt; /dev/null</code>
                    <Button variant="ghost" size="sm" onClick={() => copyCommand('curl -s https://packages.stripe.dev/api/security/key/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg > /dev/null')}>
                      Copiar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <code>echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list</code>
                    <Button variant="ghost" size="sm" onClick={() => copyCommand('echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list')}>
                      Copiar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <code>sudo apt update && sudo apt install stripe</code>
                    <Button variant="ghost" size="sm" onClick={() => copyCommand('sudo apt update && sudo apt install stripe')}>
                      Copiar
                    </Button>
                  </div>
                  
                  <p className="mt-4"># Fazer login no Stripe:</p>
                  <div className="flex items-center justify-between mt-2">
                    <code>stripe login</code>
                    <Button variant="ghost" size="sm" onClick={() => copyCommand('stripe login')}>
                      Copiar
                    </Button>
                  </div>
                  
                  <p className="mt-4"># Iniciar o redirecionamento de webhook:</p>
                  <div className="flex items-center justify-between mt-2">
                    <code>bash run-stripe-cli.sh</code>
                    <Button variant="ghost" size="sm" onClick={() => copyCommand('bash run-stripe-cli.sh')}>
                      Copiar
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button onClick={startStripeCLI} disabled={testingStripe}>
                    {testingStripe ? 'Verificando...' : 'Verificar Status do Stripe CLI'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Evento de Teste via API</CardTitle>
                <CardDescription>
                  Use a API do Stripe para enviar um evento de teste diretamente para sua aplicação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Chave Secreta do Stripe (opcional)</Label>
                  <Input 
                    id="secretKey" 
                    type="password" 
                    placeholder="sk_test_..." 
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Se não for fornecida, será usada a chave configurada no ambiente.
                  </p>
                </div>
                
                <Button 
                  onClick={triggerTestEvent} 
                  disabled={testingStripe}
                  className="w-full"
                >
                  {testingStripe ? 'Enviando...' : 'Enviar Evento de Teste'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle>Logs de Execução</CardTitle>
            <Button variant="outline" size="sm" onClick={clearLogs}>Limpar</Button>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 font-mono p-4 rounded-md h-60 overflow-y-auto">
              {outputLog.length > 0 ? (
                outputLog.map((log, index) => (
                  <div key={index} className="pb-1">{log}</div>
                ))
              ) : (
                <div className="text-gray-500 italic">Nenhum log disponível. Inicie o teste para ver os logs aqui.</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t rounded-b-md">
            <p className="text-xs text-gray-500 italic">
              Dica: Para testar o webhook com dados reais, use o Stripe CLI para encaminhar eventos para sua aplicação local.
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}