import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";

export default function Planos() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const iniciarCheckout = async (plan: string) => {
    if (!email) {
      setErrorMessage("Por favor, insira seu e-mail.");
      return;
    }

    // Resetar qualquer erro anterior
    setErrorMessage(null);
    // Ativar loading para o plano específico
    setLoading(plan);

    try {
      // Validar o e-mail com Zod
      try {
        z.string().email().parse(email);
      } catch (error) {
        setErrorMessage("Por favor, insira um e-mail válido.");
        setLoading(null);
        return;
      }

      // Registrar lead antes do checkout 
      // Não esperamos por esta requisição para não atrasar o checkout
      fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "Cliente interessado", email })
      }).catch(e => {
        console.error("Erro ao salvar lead:", e);
        // Não bloqueamos o fluxo por causa deste erro
      });

      // Iniciar checkout com Stripe
      console.log("Iniciando checkout para:", plan, email);
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan, email })
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        console.log("Redirecionando para Stripe Checkout:", data.url);
        window.location.href = data.url;
      } else {
        setErrorMessage(data.message || "Erro ao iniciar checkout. Tente novamente.");
        setLoading(null);
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      setErrorMessage("Erro ao conectar-se ao servidor. Tente novamente.");
      setLoading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Escolha seu Plano</h2>
      
      {/* Input de email */}
      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={`w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errorMessage ? 'border-red-500' : ''
        }`}
        disabled={loading !== null}
      />
      
      {/* Mensagem de erro */}
      {errorMessage && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col space-y-3">
        {/* Botão Plano Mensal */}
        <button 
          className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition flex justify-center items-center"
          onClick={() => iniciarCheckout("mensal")}
          disabled={loading !== null}
        >
          {loading === "mensal" ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </div>
          ) : (
            "Plano Mensal"
          )}
        </button>

        {/* Botão Plano Anual */}
        <button 
          className="bg-green-600 text-white p-3 rounded-md font-semibold hover:bg-green-700 transition flex justify-center items-center"
          onClick={() => iniciarCheckout("anual")}
          disabled={loading !== null}
        >
          {loading === "anual" ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </div>
          ) : (
            "Plano Anual"
          )}
        </button>

        {/* Botão Plano Vitalício */}
        <button 
          className="bg-yellow-600 text-white p-3 rounded-md font-semibold hover:bg-yellow-700 transition flex justify-center items-center"
          onClick={() => iniciarCheckout("vitalicio")}
          disabled={loading !== null}
        >
          {loading === "vitalicio" ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </div>
          ) : (
            "Plano Vitalício"
          )}
        </button>
      </div>
      
      {/* Botão Voltar */}
      <button 
        className="mt-6 w-full p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition"
        onClick={() => setLocation("/")}
        disabled={loading !== null}
      >
        Voltar
      </button>

      {/* Feedback adicional durante o carregamento */}
      {loading && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Preparando checkout seguro... Você será redirecionado para o Stripe.
        </p>
      )}
    </div>
  );
}