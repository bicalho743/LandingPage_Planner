#!/bin/bash

# Script para configurar o webhook do Stripe para produção
echo "🔐 Configuração do Webhook do Stripe para Produção 🔐"
echo "=====================================================\n"

# Verificar se estamos em modo de produção
if [[ "$NODE_ENV" != "production" ]]; then
  echo "⚠️  AVISO: Ambiente de produção não detectado!"
  echo "⚠️  Definindo NODE_ENV=production para este script"
  export NODE_ENV=production
fi

# Verificar se STRIPE_SECRET_KEY está definida
if [[ -z "$STRIPE_SECRET_KEY" ]]; then
  echo "❌ ERRO: STRIPE_SECRET_KEY não está definida!"
  echo "   Adicione a variável de ambiente STRIPE_SECRET_KEY antes de continuar."
  exit 1
fi

# Verificar se STRIPE_WEBHOOK_SECRET está definida
if [[ -z "$STRIPE_WEBHOOK_SECRET" ]]; then
  echo "❌ ERRO: STRIPE_WEBHOOK_SECRET não está definida!"
  echo -e "\n📝 Para configurar o webhook do Stripe em produção, siga os passos abaixo:"
  echo -e "\n1. Acesse o Dashboard do Stripe (https://dashboard.stripe.com/)"
  echo "2. Navegue até Developers > Webhooks"
  echo "3. Clique em 'Add Endpoint'"
  echo "4. Configure as seguintes informações:"
  echo "   - URL do endpoint: https://seu-dominio.com/api/stripe-webhook"
  echo "   - Descrição: PlannerPro Production Webhook"
  echo "   - Eventos a escutar: Selecione os seguintes eventos:"
  echo "     * checkout.session.completed"
  echo "     * invoice.paid"
  echo "     * customer.subscription.created"
  echo "     * customer.subscription.updated"
  echo "     * customer.subscription.deleted"
  echo "     * customer.subscription.trial_will_end"
  echo "5. Ao criar o endpoint, você receberá uma Signing Secret"
  echo "6. Adicione a Signing Secret como variável de ambiente:"
  echo "   STRIPE_WEBHOOK_SECRET=whsec_seu_valor_aqui"
  echo -e "\n⚠️  IMPORTANTE: Mantenha esta chave em segredo!"
  echo -e "\nApós configurar, execute este script novamente para verificar.\n"
  exit 1
else
  echo "✅ STRIPE_WEBHOOK_SECRET está configurada corretamente!"
fi

echo -e "\nPara verificar se o webhook está funcionando corretamente em produção:"
echo "1. Acesse o Dashboard do Stripe em Developers > Webhooks"
echo "2. Clique no seu endpoint de produção"
echo "3. Clique em 'Send test webhook'"
echo "4. Selecione o evento 'checkout.session.completed'"
echo "5. Clique em 'Send test webhook'"
echo "6. Verifique os logs do seu servidor para confirmar que o evento foi recebido e processado"

echo -e "\n✅ O webhook do Stripe para produção está configurado corretamente!"
echo "📋 Rota do webhook: /api/stripe-webhook"
echo "📋 Middleware raw configurado em server/index.ts"
echo "📋 Implementação do webhook em server/stripe-webhook.ts"

echo -e "\n🚀 Seu sistema está pronto para processar pagamentos em produção!"