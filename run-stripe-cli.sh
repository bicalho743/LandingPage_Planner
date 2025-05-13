#!/bin/bash

# Script para executar o Stripe CLI em uma nova aba de terminal
# Este script é mais conveniente para ser executado manualmente

echo "🚀 Iniciando Stripe CLI para Webhooks..."
echo "🔍 Este script detectará automaticamente a porta em que o servidor está rodando"
echo "   e configurará o Stripe CLI para encaminhar eventos para o endpoint de webhook correto."
echo ""
echo "⚠️  Certifique-se que seu servidor está rodando antes de executar este script."
echo ""

# Executar o script principal
node run-stripe-webhook.js