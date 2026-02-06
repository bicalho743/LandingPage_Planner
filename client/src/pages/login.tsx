import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmailPassword, sendPasswordReset } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await loginWithEmailPassword(email, password);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo ao PlannerOrganiza, ${user.email}!`,
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      let errorMessage = error.message || "Não foi possível fazer login. Verifique suas credenciais.";
      let needsSync = false;
      
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
    <div className="bg-gray-50 min-h-screen flex flex-col" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Header - barra navy escura */}
      <header className="bg-[#1a1f4e] text-white py-3 shadow-md">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <span className="text-xl">📋</span>
          <h1 className="text-lg font-semibold tracking-wide">Planner Organizer</h1>
        </div>
      </header>

      {/* Conteúdo principal - duas colunas */}
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
          
          {/* Coluna esquerda - Marketing */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold text-gray-900">Planner Organizer</h2>
                <span className="text-gray-400 text-lg">🔗</span>
              </div>
              <p className="text-gray-500 text-sm">Sistema Profissional para Personal Organizers</p>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-xl p-5 text-center bg-white">
                <p className="text-3xl font-bold text-gray-800">+300%</p>
                <p className="text-xs text-gray-500 mt-2">Aumento na produtividade</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 text-center bg-white">
                <p className="text-3xl font-bold text-gray-800">-25%</p>
                <p className="text-xs text-gray-500 mt-2">Redução de retrabalho</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 text-center bg-white">
                <p className="text-3xl font-bold text-gray-800">+45%</p>
                <p className="text-xs text-gray-500 mt-2">Aumento no faturamento</p>
              </div>
            </div>

            {/* Seção Por que escolher */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Por que escolher o Planner Organizer?</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-5 bg-white">
                  <span className="text-2xl mb-2 block">📊</span>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">Gestão Completa</h4>
                  <p className="text-xs text-gray-500">Clientes, propostas e finanças em um só lugar</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-5 bg-white">
                  <span className="text-2xl mb-2 block">🔥</span>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">Produtividade</h4>
                  <p className="text-xs text-gray-500">Automatize tarefas e ganhe tempo</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-5 bg-white">
                  <span className="text-2xl mb-2 block">💰</span>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">Controle Financeiro</h4>
                  <p className="text-xs text-gray-500">Acompanhe receitas e despesas facilmente</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-5 bg-white">
                  <span className="text-2xl mb-2 block">📱</span>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">Acesso Mobile</h4>
                  <p className="text-xs text-gray-500">Use em qualquer dispositivo, a qualquer hora</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita - Formulário de Login */}
          <div className="flex items-start justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Acesse sua conta</h2>
                <p className="text-sm text-gray-500 mt-1">Entre com seu e-mail e senha para acessar o sistema</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder=""
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-12"
                      placeholder=""
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1a1f4e] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#252b66] transition-colors disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Entrando...
                    </span>
                  ) : "Entrar na minha conta"}
                </button>
              </form>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={handlePasswordReset}
                  disabled={isResettingPassword}
                  className="bg-[#dc3545] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#c82333] transition-colors disabled:opacity-60"
                >
                  {isResettingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                      Enviando...
                    </span>
                  ) : "Esqueceu sua senha?"}
                </button>
                <button
                  onClick={() => setLocation("/planos")}
                  className="bg-[#dc3545] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#c82333] transition-colors"
                >
                  Criar uma conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}