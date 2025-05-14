#!/bin/bash

# Script para implantar o PlannerPro em produção

echo "🚀 Iniciando o processo de deploy..."

# Verificando se o script de verificação de ambiente existe
if [ ! -f "verificar-env.js" ]; then
  echo "❌ Erro: Script verificar-env.js não encontrado!"
  exit 1
fi

# Verificar se NODE_ENV está definido como production
if [[ "$NODE_ENV" != "production" ]]; then
  echo "⚠️  AVISO: Ambiente de produção não detectado!"
  echo "⚠️  Definindo NODE_ENV=production para este script"
  export NODE_ENV=production
fi

echo "⏳ Verificando variáveis de ambiente..."
# Executar o verificador de ambiente
if ! node verificar-env.js; then
  echo "❌ Erro: Verificação de ambiente falhou. Corrija os problemas acima antes de continuar."
  echo "   Consulte o arquivo CHECKLIST_PRODUCAO.md para mais detalhes."
  exit 1
fi

echo "✅ Verificações de ambiente concluídas"
echo "⏳ Compilando o projeto para produção..."

# Limpando a pasta dist
echo "🧹 Limpando diretório de build anterior..."
rm -rf dist
mkdir -p dist

# Compilando o frontend e o backend
echo "⏳ Compilando o frontend..."
vite build

echo "⏳ Compilando o backend..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Verificar se a compilação foi bem-sucedida
if [ ! -f "dist/index.js" ]; then
  echo "❌ Erro: Compilação do backend falhou!"
  exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Erro: Compilação do frontend falhou!"
  exit 1
fi

echo "✅ Compilação concluída com sucesso!"

# Executar migrações do banco de dados, se necessário
echo "⏳ Executando migrações do banco de dados..."
npm run db:push

echo "🚀 Iniciando o servidor em modo de produção..."

# Iniciar o servidor
NODE_ENV=production node dist/index.js