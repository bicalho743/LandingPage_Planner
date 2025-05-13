import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest("POST", "/api/leads", { name, email });
      
      toast({
        title: "Obrigado!",
        description: "Confira seu e-mail para mais informações."
      });
      
      // Limpa os campos do formulário
      setName("");
      setEmail("");
    } catch (error) {
      toast({
        title: "Erro ao enviar dados",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Quer saber mais?</CardTitle>
        <CardDescription>
          Cadastre-se para receber novidades e conteúdos exclusivos sobre organização e produtividade.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {loading ? "Enviando..." : "Conheça Mais Sobre!"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}