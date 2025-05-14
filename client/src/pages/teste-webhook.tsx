import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Definindo o esquema dos dados do formulário
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  webhookType: z.enum(['checkout', 'invoice', 'subscription']),
  eventType: z.string().min(3, 'Tipo de evento inválido'),
  userId: z.string().optional(),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TesteWebhookPage() {
  const { toast } = useToast();
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Formulário com validação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      webhookType: 'checkout',
      eventType: 'checkout.session.completed',
      userId: '',
      password: '',
    },
  });

  // Opções de eventos
  const eventOptions = {
    checkout: [
      { value: 'checkout.session.completed', label: 'Checkout Concluído' },
      { value: 'checkout.session.async_payment_succeeded', label: 'Pagamento Assíncrono Concluído' },
      { value: 'checkout.session.async_payment_failed', label: 'Pagamento Assíncrono Falhou' },
    ],
    invoice: [
      { value: 'invoice.paid', label: 'Fatura Paga' },
      { value: 'invoice.payment_succeeded', label: 'Pagamento da Fatura Bem-Sucedido' },
      { value: 'invoice.payment_failed', label: 'Pagamento da Fatura Falhou' },
      { value: 'invoice.finalized', label: 'Fatura Finalizada' },
    ],
    subscription: [
      { value: 'customer.subscription.created', label: 'Assinatura Criada' },
      { value: 'customer.subscription.updated', label: 'Assinatura Atualizada' },
      { value: 'customer.subscription.deleted', label: 'Assinatura Cancelada' },
      { value: 'customer.subscription.trial_will_end', label: 'Trial Terminará em Breve' },
    ],
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Codificar senha em base64 se fornecida usando btoa (função nativa do browser)
      const encodedPassword = data.password ? btoa(data.password) : undefined;
      
      // Construir o payload do webhook com base no tipo
      let payload: any = {
        type: data.eventType,
      };
      
      // Adicionar dados específicos com base no tipo de webhook
      if (data.webhookType === 'checkout') {
        payload.data = {
          object: {
            id: `cs_test_${Math.random().toString(36).substring(2, 12)}`,
            customer_email: data.email,
            metadata: {
              userId: data.userId,
              senha: encodedPassword,
            }
          }
        };
      } else if (data.webhookType === 'invoice') {
        payload.data = {
          object: {
            id: `in_test_${Math.random().toString(36).substring(2, 12)}`,
            customer_email: data.email,
            customer: `cus_${Math.random().toString(36).substring(2, 12)}`,
            subscription: `sub_${Math.random().toString(36).substring(2, 12)}`
          }
        };
      } else if (data.webhookType === 'subscription') {
        payload.data = {
          object: {
            id: `sub_${Math.random().toString(36).substring(2, 12)}`,
            customer: `cus_${Math.random().toString(36).substring(2, 12)}`,
            status: 'active',
            metadata: {
              email: data.email,
              userId: data.userId,
            }
          }
        };
      }

      // Enviar o webhook para o endpoint robusto que criamos
      const result = await apiRequest('POST', '/api/webhook-fixuser', payload);
      const resultData = await result.json();
      
      setResponse(JSON.stringify(resultData, null, 2));
      
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

  // Atualizar eventos disponíveis quando o tipo de webhook muda
  const updateEventType = (value: 'checkout' | 'invoice' | 'subscription') => {
    form.setValue('webhookType', value);
    // Definir o primeiro evento do tipo selecionado como padrão
    if (eventOptions[value]?.length > 0) {
      form.setValue('eventType', eventOptions[value][0].value);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Teste de Webhook</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Simular Webhook do Stripe</CardTitle>
              <CardDescription>
                Envie um evento de webhook de teste para o sistema sem precisar 
                do Stripe CLI ou eventos reais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="webhookType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Webhook</FormLabel>
                        <Select 
                          onValueChange={(value: 'checkout' | 'invoice' | 'subscription') => updateEventType(value)} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de webhook" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checkout">Checkout</SelectItem>
                            <SelectItem value="invoice">Fatura</SelectItem>
                            <SelectItem value="subscription">Assinatura</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o evento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventOptions[form.getValues('webhookType') as keyof typeof eventOptions]?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Usuário (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="ID do usuário no banco de dados" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha (opcional)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Senha para criar usuário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-4"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Webhook"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>
                A resposta do servidor será exibida aqui após o envio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response ? (
                <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-[400px]">
                  {response}
                </pre>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-400">
                  Envie um webhook para ver o resultado
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  window.open('/api/admin/users', '_blank');
                }}
              >
                Ver Usuários Cadastrados
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}