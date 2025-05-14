#!/bin/bash

# Script para implantar o PlannerPro em produção

echo "🚀 Iniciando o processo de deploy..."

# Verificando NODE_ENV
if [[ "$NODE_ENV" != "production" ]]; then
  echo "⚠️  AVISO: Ambiente de produção não detectado!"
  echo "⚠️  Defina NODE_ENV=production antes de executar este script"
  echo "⚠️  Você pode fazer isso executando: export NODE_ENV=production"
  exit 1
fi

# Verificando chaves do Stripe
if [[ -z "$STRIPE_SECRET_KEY" || ! "$STRIPE_SECRET_KEY" == sk_live_* ]]; then
  echo "⚠️  AVISO: STRIPE_SECRET_KEY de produção não configurada corretamente!"
  echo "⚠️  A chave deve começar com 'sk_live_'"
  exit 1
fi

if [[ -z "$STRIPE_PUBLIC_KEY" || ! "$STRIPE_PUBLIC_KEY" == pk_live_* ]]; then
  echo "⚠️  AVISO: STRIPE_PUBLIC_KEY de produção não configurada corretamente!"
  echo "⚠️  A chave deve começar com 'pk_live_'"
  exit 1
fi

# Verificando IDs de preço do Stripe
if [[ -z "$STRIPE_PRICE_MONTHLY" || -z "$STRIPE_PRICE_ANNUAL" || -z "$STRIPE_PRICE_LIFETIME" ]]; then
  echo "⚠️  AVISO: IDs de preço do Stripe não configurados!"
  echo "⚠️  Configure STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL e STRIPE_PRICE_LIFETIME"
  exit 1
fi

echo "✅ Verificações preliminares concluídas"
echo "⏳ Compilando o projeto para produção..."

# Limpando a pasta dist
rm -rf dist
mkdir -p dist

# Compilando o frontend e o backend
echo "⏳ Compilando o frontend..."
vite build

echo "⏳ Compilando o backend..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Compilação concluída"
echo "🚀 Iniciando o servidor em modo de produção..."

# Iniciar o servidor
node dist/index.js