import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";

export default function Planos() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");

  const iniciarCheckout = async (plan: string) => {
    if (!email) {
      alert("Por favor, insira seu e-mail.");
      return;
    }

    try {
      // Validar o e-mail com Zod
      try {
        z.string().email().parse(email);
      } catch (error) {
        alert("Por favor, insira um e-mail válido.");
        return;
      }

      // Registrar lead antes do checkout
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name: "Cliente interessado", email })
        });
      } catch (e) {
        console.error("Erro ao salvar lead:", e);
        // Continuamos mesmo com erro ao salvar lead
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan, email })
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Erro ao iniciar checkout. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      alert("Erro ao iniciar checkout. Tente novamente.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Escolha seu Plano</h2>
      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-col space-y-3">
        <button 
          className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition"
          onClick={() => iniciarCheckout("mensal")}
        >Plano Mensal</button>

        <button 
          className="bg-green-600 text-white p-3 rounded-md font-semibold hover:bg-green-700 transition"
          onClick={() => iniciarCheckout("anual")}
        >Plano Anual</button>

        <button 
          className="bg-yellow-600 text-white p-3 rounded-md font-semibold hover:bg-yellow-700 transition"
          onClick={() => iniciarCheckout("vitalicio")}
        >Plano Vitalício</button>
      </div>
      
      <button 
        className="mt-6 w-full p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition"
        onClick={() => setLocation("/")}
      >
        Voltar
      </button>
    </div>
  );
}