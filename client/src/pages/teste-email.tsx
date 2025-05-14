import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Definindo o esquema dos dados do formulário
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  assunto: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type FormValues = z.infer<typeof formSchema>;

export default function TesteEmailPage() {
  const { toast } = useToast();
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Formulário com validação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      assunto: 'Teste de Email - PlannerPro',
      mensagem: 'Olá, este é um email de teste do sistema PlannerPro. Obrigado por testar nossa plataforma!',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Enviar a requisição para testar o email
      const result = await apiRequest('POST', '/api/teste-email', {
        to: data.email,
        subject: data.assunto,
        htmlContent: `<div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #0066cc;">${data.assunto}</h1>
          <p>${data.mensagem.replace(/\n/g, '<br/>')}</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipe PlannerPro</strong></p>
        </div>`,
        textContent: data.mensagem
      });
      
      const resultData = await result.json();
      setResponse(JSON.stringify(resultData, null, 2));
      
      if (resultData.success) {
        toast({
          title: "Email enviado",
          description: `Email enviado com sucesso para ${data.email}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Erro ao enviar email",
          description: resultData.message || "Falha ao enviar o email",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      setResponse(JSON.stringify({
        error: true,
        message: error.response?.data || error.message
      }, null, 2));
      
      toast({
        title: "Erro ao enviar email",
        description: error.response?.data || error.message || "Ocorreu um erro ao enviar o email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Teste de Envio de Email</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Email de Teste</CardTitle>
              <CardDescription>
                Envie um email de teste usando a API do Brevo
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
                        <FormLabel>Email do Destinatário</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assunto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Assunto do email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mensagem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conteúdo do email" 
                            className="min-h-[150px]"
                            {...field} 
                          />
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
                    {loading ? "Enviando..." : "Enviar Email"}
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
                  Envie um email para ver o resultado
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}