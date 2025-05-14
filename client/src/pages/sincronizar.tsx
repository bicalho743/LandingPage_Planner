import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Sincronizar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [showResetLink, setShowResetLink] = useState(false);

  // Obter o parâmetro da URL se disponível
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email para sincronizar a conta.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/sync-user', {
        email,
        password
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erro ao sincronizar usuário");
      }
      
      if (data.resetLink) {
        setResetLink(data.resetLink);
        setShowResetLink(true);
      }
      
      if (data.existingUser) {
        toast({
          title: "Usuário sincronizado",
          description: "Seu usuário já existe e foi sincronizado. Use o link para definir uma nova senha.",
        });
      } else if (data.newUser) {
        toast({
          title: "Usuário criado com sucesso",
          description: "Seu usuário foi criado no Firebase. Use o link para definir sua senha.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao sincronizar",
        description: error.message || "Não foi possível sincronizar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen">
      <header className="bg-blue-800 text-white py-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">PlannerPro</h1>
          <p className="mt-2 text-lg">Sincronização de Conta</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Sincronizar Conta</h2>
          
          <div className="p-4 bg-yellow-50 rounded-lg mb-6">
            <p className="text-sm text-yellow-700">
              <strong>Este é um processo de recuperação:</strong> Se você tem uma conta no sistema mas 
              não consegue fazer login, use esta ferramenta para sincronizar sua conta e redefinir a senha.
            </p>
          </div>

          {showResetLink ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-700 mb-2">
                  Conta sincronizada com sucesso!
                </h3>
                <p className="text-sm text-green-600 mb-3">
                  Use o link abaixo para definir uma nova senha para sua conta:
                </p>
                <div className="bg-white p-3 rounded border border-green-200 text-xs break-all">
                  <a href={resetLink} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {resetLink}
                  </a>
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={() => setLocation('/login')}
              >
                Ir para a página de login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email da sua conta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha (opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite uma nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Se deixar este campo em branco, você poderá definir uma senha através do link de redefinição.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full mr-2"></span>
                    Sincronizando...
                  </span>
                ) : "Sincronizar Conta"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Voltar para a{" "}
              <a 
                href="#" 
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation("/login");
                }}
              >
                página de login
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 PlannerPro Organizer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}