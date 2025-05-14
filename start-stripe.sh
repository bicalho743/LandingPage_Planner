#!/bin/bash

# Definindo a porta padrão (5000) ou usando a variável de ambiente PORT
PORT=${PORT:-5000}

# Verificando se o servidor está rodando
echo "🔎 Verificando se o servidor está rodando na porta ${PORT}..."

# Verificando se o servidor está rodando na porta configurada
while ! lsof -i :$PORT > /dev/null 2>&1; do
  echo "⏳ Servidor não encontrado na porta ${PORT}. Tentando na próxima porta..."
  ((PORT++))
  if [ $PORT -gt 5100 ]; then
    echo "❌ Não foi possível encontrar um servidor rodando."
    exit 1
  fi
done

echo "✅ Servidor detectado na porta ${PORT}. Iniciando o Stripe CLI..."

# Iniciar o Stripe CLI para redirecionar automaticamente para o servidor
# Adicionado novo endpoint do nosso webhook direto como opção
echo "Escolha o endpoint para receber os webhooks:"
echo "1) /api/webhooks/stripe (original)"
echo "2) /api/stripe-webhook (versão melhorada)"
echo "3) /api/webhook-direto (versão direta, mais robusta)"
read -p "Digite o número (1-3, padrão: 3): " endpoint_choice

# Define o endpoint com base na escolha, padrão para a opção 3
case "$endpoint_choice" in
  1) ENDPOINT="/api/webhooks/stripe" ;;
  2) ENDPOINT="/api/stripe-webhook" ;;
  *) ENDPOINT="/api/webhook-direto" ;;
esac

echo "✅ Redirecionando eventos para http://localhost:$PORT$ENDPOINT"
stripe listen --forward-to http://localhost:$PORT$ENDPOINT