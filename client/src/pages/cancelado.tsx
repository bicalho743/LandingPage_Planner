import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Cancelado() {
  const [_, setLocation] = useLocation();

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800 font-sans min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600">Pagamento Não Concluído</h1>
            <p className="mt-4 text-lg">Você saiu do processo de pagamento antes de concluí-lo.</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">O que aconteceu?</h2>
            <p className="text-gray-700 mb-4">
              O processo de pagamento foi interrompido antes da conclusão. Não se preocupe, 
              nenhum valor foi cobrado e você pode tentar novamente quando quiser.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm mb-2">
                  <strong>Precisa de ajuda?</strong> Se estiver tendo problemas com o pagamento, 
                  entre em contato com nosso suporte:
                </p>
                <p className="text-sm">
                  <a href="mailto:suporte@planner-pro.com" className="text-blue-600 hover:underline">
                    suporte@planner-pro.com
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Button>
            
            <Button 
              className="bg-blue-800 hover:bg-blue-900 text-white"
              onClick={() => setLocation("/planos")}
            >
              Escolher um Plano
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}