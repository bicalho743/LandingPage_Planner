import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmailPassword, sendPasswordReset } from "@/lib/firebase";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Login real utilizando Firebase
      const user = await loginWithEmailPassword(email, password);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo ao PlannerPro, ${user.email}!`,
      });
      
      // Redirecionar para o dashboard
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      let errorMessage = error.message || "Não foi possível fazer login. Verifique suas credenciais.";
      let needsSync = false;
      
      // Verificar se é erro de usuário não encontrado ou credenciais inválidas
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.message?.includes('user-not-found') ||
          error.message?.includes('wrong-password')) {
        needsSync = true;
        errorMessage = "Usuário não encontrado ou senha incorreta. Talvez seja necessário sincronizar sua conta.";
      }
      
      toast({
        title: "Erro",
        description: (
          <div>
            {errorMessage}
            {needsSync && (
              <div className="mt-2">
                <button 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  onClick={() => setLocation("/sincronizar" + (email ? `?email=${encodeURIComponent(email)}` : ''))}
                >
                  Clique aqui para sincronizar sua conta →
                </button>
              </div>
            )}
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Digite seu e-mail",
        description: "Por favor, preencha o campo de e-mail antes de solicitar a recuperação de senha.",
        variant: "destructive"
      });
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      await sendPasswordReset(email);
      toast({
        title: "Email enviado",
        description: `Um link de recuperação de senha foi enviado para ${email}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email de redefinição de senha.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen">
      <header className="bg-blue-800 text-white py-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">PlannerPro</h1>
          <p className="mt-2 text-lg">Acesse sua conta</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Após pagar pelo plano:</strong>
            </p>
            <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
              <li>Você receberá um e-mail para definir sua senha</li>
              <li>Use o mesmo e-mail fornecido durante o checkout</li>
              <li>Caso não receba o e-mail, clique em "Esqueceu a senha?" abaixo</li>
            </ul>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <div className="flex justify-between">
                <Label htmlFor="password">Senha</Label>
                <div className="flex space-x-3">
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => setLocation(`/sincronizar${email ? `?email=${encodeURIComponent(email)}` : ''}`)}
                  >
                    Problemas com login?
                  </a>
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:underline"
                    onClick={handlePasswordReset}
                    aria-disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <span className="flex items-center">
                        <span className="animate-spin w-3 h-3 border-2 border-t-transparent rounded-full mr-1"></span>
                        Enviando...
                      </span>
                    ) : "Esqueceu a senha?"}
                  </a>
                </div>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full mr-2"></span>
                  Entrando...
                </span>
              ) : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Ainda não tem uma conta?{" "}
              <a 
                href="#" 
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation("/planos");
                }}
              >
                Assine agora
              </a>
            </p>
            
            <p className="text-sm text-gray-600">
              Problemas para acessar sua conta?{" "}
              <a 
                href="#" 
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation("/sincronizar" + (email ? `?email=${encodeURIComponent(email)}` : ''));
                }}
              >
                Clique aqui para sincronizar
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