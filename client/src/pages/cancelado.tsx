import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Cancelado() {
  const [_, setLocation] = useLocation();

  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Pagamento Cancelado ❌</h1>
        <p className="mt-4 text-lg">Você não completou o pagamento.</p>
        <Button 
          className="mt-6 bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-900" 
          onClick={() => setLocation("/planos")}
        >
          Escolher Outro Plano
        </Button>
      </div>
    </div>
  );
}