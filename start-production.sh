#!/bin/bash

# Script para iniciar o PlannerPro em produção

# Configuração de ambiente
export NODE_ENV=production

# Verifica se o build existe
if [ ! -f "dist/index.js" ]; then
  echo "❌ Erro: Build não encontrado. Execute o script deploy.sh primeiro."
  echo "   Comando: ./deploy.sh"
  exit 1
fi

# Configuração de porta (opcional)
if [ -n "$PORT" ]; then
  echo "🔌 Usando porta especificada: $PORT"
  export PORT=$PORT
else
  echo "🔌 Usando porta padrão"
fi

# Verificação de variáveis de ambiente
echo "⏳ Verificando configuração de ambiente..."
if ! node verificar-env.js; then
  echo "⚠️ Algumas variáveis de ambiente não estão configuradas corretamente."
  echo "   Confirmar que deseja continuar? (s/N)"
  read resp
  if [ "$resp" != "s" ] && [ "$resp" != "S" ]; then
    echo "Operação cancelada."
    exit 1
  fi
fi

# Inicia o servidor de produção
echo "🚀 Iniciando o servidor em modo de produção..."
node dist/index.js