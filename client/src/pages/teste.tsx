import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import TestPanel from '@/components/TestPanel';

export default function TestPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Ferramentas de Teste</h1>
        <p className="text-center mb-8 text-gray-600">
          Esta página contém ferramentas para testar funcionalidades do sistema.
          <br />
          <span className="text-red-500 font-semibold">Apenas para uso em desenvolvimento!</span>
        </p>
        
        <TestPanel />
        
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Nota importante</h2>
          <p>
            Esta interface simula o webhook do Stripe para finalizar o processamento de
            cadastros de usuários com planos pagos. Em produção, este processo seria
            acionado automaticamente após a confirmação do pagamento.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}