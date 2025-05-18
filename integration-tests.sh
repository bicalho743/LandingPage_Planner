#!/bin/bash

# Script de Testes de Integração para PlannerOrganiza
# Este script verifica todas as integrações principais do sistema em ambiente de produção.

# Configuração
NODE_ENV=production
echo "🧪 Iniciando testes de integração em ambiente de produção..."
echo "===================================================="

# Funções utilitárias
function print_header() {
  echo -e "\n\033[1;36m$1\033[0m"
  echo "----------------------------------------------------"
}

function check_success() {
  if [ $? -eq 0 ]; then
    echo -e "\033[1;32m✅ Sucesso: $1\033[0m"
    return 0
  else
    echo -e "\033[1;31m❌ Falha: $1\033[0m"
    return 1
  fi
}

function test_endpoint() {
  local url=$1
  local method=${2:-GET}
  local expected_status=${3:-200}
  local data=${4:-""}
  
  echo -e "\n🔍 Testando endpoint: $method $url (status esperado: $expected_status)"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" -X $method $url)
  else
    response=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" $url)
  fi
  
  if [ "$response" = "$expected_status" ]; then
    echo -e "\033[1;32m✅ Endpoint $url retornou status $response conforme esperado\033[0m"
    return 0
  else
    echo -e "\033[1;31m❌ Endpoint $url retornou status $response (esperado: $expected_status)\033[0m"
    return 1
  fi
}

# 1. Verificar configuração das variáveis de ambiente
print_header "1. Verificação de Variáveis de Ambiente"

# Verificar variáveis do Stripe
required_vars=(
  "STRIPE_SECRET_KEY"
  "STRIPE_PUBLIC_KEY"
  "STRIPE_PRICE_MONTHLY"
  "STRIPE_PRICE_ANNUAL"
  "STRIPE_PRICE_LIFETIME"
  "STRIPE_WEBHOOK_SECRET"
  "FIREBASE_ADMIN_CREDENTIALS"
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_PROJECT_ID"
  "VITE_FIREBASE_APP_ID"
  "BREVO_API_KEY"
)

env_errors=0
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "\033[1;31m❌ Variável $var não está definida\033[0m"
    env_errors=$((env_errors + 1))
  else
    echo -e "\033[1;32m✅ Variável $var está definida\033[0m"
  fi
done

if [ $env_errors -gt 0 ]; then
  echo -e "\n\033[1;31m⚠️ $env_errors variáveis de ambiente obrigatórias não estão definidas!\033[0m"
else
  echo -e "\n\033[1;32m✅ Todas as variáveis de ambiente obrigatórias estão definidas!\033[0m"
fi

# 2. Verificar conexão com o banco de dados
print_header "2. Verificação de Conectividade com o Banco de Dados"

if node -e "const { pool } = require('./dist/db.js'); async function testDb() { try { const client = await pool.connect(); await client.query('SELECT NOW()'); client.release(); console.log('✅ Conexão com o banco de dados estabelecida com sucesso!'); process.exit(0); } catch (err) { console.error('❌ Erro ao conectar ao banco de dados:', err.message); process.exit(1); } } testDb();" > /dev/null 2>&1; then
  echo -e "\033[1;32m✅ Conexão com o banco de dados PostgreSQL testada com sucesso\033[0m"
else
  echo -e "\033[1;31m❌ Falha na conexão com o banco de dados PostgreSQL\033[0m"
fi

# 3. Verificar integração com o Firebase
print_header "3. Verificação de Integração com o Firebase"

if node -e "const admin = require('firebase-admin'); try { if (!process.env.FIREBASE_ADMIN_CREDENTIALS) { throw new Error('FIREBASE_ADMIN_CREDENTIALS não definido'); } const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS); if (admin.apps.length === 0) { admin.initializeApp({ credential: admin.credential.cert(credentials) }); } admin.auth().listUsers(1).then(() => { console.log('✅ Integração com Firebase testada com sucesso!'); process.exit(0); }).catch(err => { console.error('❌ Erro ao listar usuários no Firebase:', err.message); process.exit(1); }); } catch (err) { console.error('❌ Erro na integração com Firebase:', err.message); process.exit(1); }" > /dev/null 2>&1; then
  echo -e "\033[1;32m✅ Integração com Firebase Admin SDK testada com sucesso\033[0m"
else
  echo -e "\033[1;31m❌ Falha na integração com Firebase Admin SDK\033[0m"
fi

# 4. Verificar integração com o Stripe
print_header "4. Verificação de Integração com o Stripe"

if node -e "const Stripe = require('stripe'); try { if (!process.env.STRIPE_SECRET_KEY) { throw new Error('STRIPE_SECRET_KEY não definido'); } const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); stripe.customers.list({ limit: 1 }).then(() => { console.log('✅ Integração com Stripe testada com sucesso!'); process.exit(0); }).catch(err => { console.error('❌ Erro ao listar clientes no Stripe:', err.message); process.exit(1); }); } catch (err) { console.error('❌ Erro na integração com Stripe:', err.message); process.exit(1); }" > /dev/null 2>&1; then
  echo -e "\033[1;32m✅ Integração com Stripe API testada com sucesso\033[0m"
else
  echo -e "\033[1;31m❌ Falha na integração com Stripe API\033[0m"
fi

# 5. Verificar integração com o Brevo
print_header "5. Verificação de Integração com o Brevo"

if node -e "try { if (!process.env.BREVO_API_KEY) { throw new Error('BREVO_API_KEY não definido'); } const SibApiV3Sdk = require('sib-api-v3-sdk'); const defaultClient = SibApiV3Sdk.ApiClient.instance; const apiKey = defaultClient.authentications['api-key']; apiKey.apiKey = process.env.BREVO_API_KEY; const apiInstance = new SibApiV3Sdk.ContactsApi(); apiInstance.getContacts().then(() => { console.log('✅ Integração com Brevo testada com sucesso!'); process.exit(0); }).catch(err => { console.error('❌ Erro ao listar contatos no Brevo:', err.message); process.exit(1); }); } catch (err) { console.error('❌ Erro na integração com Brevo:', err.message); process.exit(1); }" > /dev/null 2>&1; then
  echo -e "\033[1;32m✅ Integração com Brevo API testada com sucesso\033[0m"
else
  echo -e "\033[1;31m❌ Falha na integração com Brevo API\033[0m"
fi

# 6. Verificar se o servidor está rodando
print_header "6. Verificação do Servidor"

if ! pgrep -f "node dist/index.js" > /dev/null; then
  echo -e "\033[1;33m⚠️ Servidor não está em execução. Tentando iniciar...\033[0m"
  # Inicia o servidor em segundo plano
  NODE_ENV=production node dist/index.js > server.log 2>&1 &
  server_pid=$!
  # Espera um pouco para o servidor iniciar
  sleep 5
  if ps -p $server_pid > /dev/null; then
    echo -e "\033[1;32m✅ Servidor iniciado com sucesso (PID: $server_pid)\033[0m"
  else
    echo -e "\033[1;31m❌ Falha ao iniciar o servidor\033[0m"
  fi
else
  echo -e "\033[1;32m✅ Servidor já está em execução\033[0m"
fi

# 7. Testar endpoints principais (assumindo que o servidor está em localhost:5000)
print_header "7. Teste de Endpoints Principais"

# Determinar a base URL
BASE_URL="http://localhost:5000"

# Testar API de leads
test_endpoint "$BASE_URL/api/leads" "POST" 200 '{"name":"Teste Integração","email":"teste_integracao@example.com"}'

# Testar API de contatos
test_endpoint "$BASE_URL/api/contacts" "POST" 200 '{"name":"Teste Integração","email":"teste_integracao@example.com","message":"Teste de integração"}'

# Teste de rota para cadastro (deve existir)
test_endpoint "$BASE_URL/registro" "GET" 200

# Teste de rota para login (deve existir)
test_endpoint "$BASE_URL/login" "GET" 200

# 8. Verificar rotas do Webhook
print_header "8. Verificação de Rotas de Webhook"

if curl -s -o /dev/null -I -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$BASE_URL/api/stripe-webhook" | grep -q "400\|401"; then
  echo -e "\033[1;32m✅ Rota do webhook do Stripe está respondendo corretamente (requer assinatura)\033[0m"
else
  echo -e "\033[1;31m❌ Rota do webhook do Stripe não está configurada corretamente\033[0m"
fi

# 9. Testes de checkout (apenas simulação)
print_header "9. Simulação de Teste de Checkout"

echo -e "\033[1;33m⚠️ Testes reais de checkout requerem interação do usuário no browser\033[0m"
echo -e "\033[1;33m⚠️ Para testar o fluxo completo, acesse manualmente:\033[0m"
echo -e "\033[1;33m   - $BASE_URL no navegador\033[0m"
echo -e "\033[1;33m   - Escolha um plano\033[0m"
echo -e "\033[1;33m   - Complete o checkout usando cartão de teste do Stripe\033[0m"
echo -e "\033[1;33m   - Verifique se o webhook é recebido (logs do servidor)\033[0m"
echo -e "\033[1;33m   - Verifique se o email é enviado\033[0m"

# 10. Resumo dos testes
print_header "10. Resumo dos Testes de Integração"

# Aqui você pode adicionar um resumo baseado em contadores de sucesso/falha
# que você manteve ao longo do script

echo -e "\n===================================================="
echo -e "🧪 Testes de integração concluídos!"
echo -e "===================================================="

# Se o servidor foi iniciado por este script, pergunte se deseja encerrar
if [ -n "$server_pid" ] && ps -p $server_pid > /dev/null; then
  read -p "Deseja encerrar o servidor de teste (PID: $server_pid)? (s/N) " shutdown
  if [[ $shutdown =~ ^[Ss]$ ]]; then
    kill $server_pid
    echo "Servidor encerrado."
  else
    echo "Servidor continuará em execução (PID: $server_pid)."
  fi
fi