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
stripe listen --forward-to http://localhost:$PORT/api/webhooks/stripe