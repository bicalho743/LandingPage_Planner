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

# Script para executar migrações seguras de produção
echo "⏳ Executando migrações seguras do banco de dados para produção..."
cat > migrate-production.js << EOF
import { runProductionMigration } from './dist/production-migration.js';

async function main() {
  const success = await runProductionMigration();
  if (!success) {
    console.error('❌ Falha ao executar migrações de produção');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
EOF

NODE_ENV=production node --input-type=module migrate-production.js || {
  echo "⚠️ Houve um problema na migração do banco de dados."
  echo "   Confirmar que deseja continuar? (s/N)"
  read resp
  if [ "$resp" != "s" ] && [ "$resp" != "S" ]; then
    echo "Operação cancelada."
    exit 1
  fi
}

# Inicia o servidor de produção
echo "🚀 Iniciando o servidor em modo de produção..."
node dist/index.js