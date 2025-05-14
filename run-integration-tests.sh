#!/bin/bash

# Script para executar todos os testes de integração em sequência

echo "🚀 Iniciando testes de integração completos para PlannerPro"
echo "==========================================================="
echo

# Verificar se estamos em um ambiente de produção
if [[ "$NODE_ENV" != "production" ]]; then
  echo "⚠️ Estes testes estão sendo executados em ambiente de DESENVOLVIMENTO"
  echo "   Para executar em ambiente de produção, defina NODE_ENV=production"
  echo
  read -p "Continuar com os testes em ambiente de desenvolvimento? (s/N) " confirm
  if [[ ! "$confirm" =~ ^[sS]$ ]]; then
    echo "Testes cancelados pelo usuário."
    exit 1
  fi
else
  echo "✅ Testes sendo executados em ambiente de PRODUÇÃO"
fi

echo
echo "📋 Opções de Teste:"
echo "   1. Executar todos os testes"
echo "   2. Testar apenas Stripe"
echo "   3. Testar apenas Firebase"
echo "   4. Testar apenas Brevo (Email)"
echo "   5. Testar apenas banco de dados e APIs"
echo
read -p "Escolha uma opção (1-5): " test_option

# Funções para colorir saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Função para executar teste e reportar resultado
function run_test() {
  local test_name="$1"
  local test_command="$2"
  
  echo -e "\n\n${YELLOW}===================================================${NC}"
  echo -e "${YELLOW}🧪 Executando teste: $test_name${NC}"
  echo -e "${YELLOW}===================================================${NC}\n"
  
  eval "$test_command"
  
  if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Teste '$test_name' concluído com sucesso${NC}\n"
    return 0
  else
    echo -e "\n${RED}❌ Teste '$test_name' falhou${NC}\n"
    return 1
  fi
}

# Inicializar contadores
tests_run=0
tests_passed=0
tests_failed=0

# Armazenar resultados de testes
test_results=()

# Definir os testes disponíveis
function test_all_systems() {
  echo -e "${YELLOW}🧪 Executando testes gerais do sistema...${NC}"
  ./integration-tests.sh
  return $?
}

function test_stripe() {
  echo -e "${YELLOW}🧪 Executando testes de integração com Stripe...${NC}"
  NODE_ENV=$NODE_ENV node test-stripe-integration.js
  return $?
}

function test_firebase() {
  echo -e "${YELLOW}🧪 Executando testes de integração com Firebase...${NC}"
  NODE_ENV=$NODE_ENV node test-firebase-integration.js
  return $?
}

function test_brevo() {
  echo -e "${YELLOW}🧪 Executando testes de integração com Brevo (Email)...${NC}"
  NODE_ENV=$NODE_ENV node test-brevo-integration.js
  return $?
}

function test_database() {
  echo -e "${YELLOW}🧪 Executando testes de banco de dados e APIs...${NC}"
  
  # Verificar conexão com banco de dados
  echo "Testando conexão com banco de dados..."
  node -e "const { pool } = require('./dist/db.js'); async function testDb() { try { const client = await pool.connect(); await client.query('SELECT NOW()'); console.log('✅ Conexão com o banco de dados estabelecida com sucesso!'); client.release(); process.exit(0); } catch (err) { console.error('❌ Erro ao conectar ao banco de dados:', err.message); process.exit(1); } } testDb();"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Teste de banco de dados concluído com sucesso${NC}"
    return 0
  else
    echo -e "${RED}❌ Teste de banco de dados falhou${NC}"
    return 1
  fi
}

# Executar os testes com base na opção selecionada
case $test_option in
  1)
    # Executar todos os testes
    if run_test "Sistema Geral" test_all_systems; then
      ((tests_passed++))
      test_results+=("Sistema Geral: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Sistema Geral: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    
    if run_test "Stripe" test_stripe; then
      ((tests_passed++))
      test_results+=("Stripe: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Stripe: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    
    if run_test "Firebase" test_firebase; then
      ((tests_passed++))
      test_results+=("Firebase: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Firebase: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    
    if run_test "Brevo" test_brevo; then
      ((tests_passed++))
      test_results+=("Brevo: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Brevo: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    
    if run_test "Banco de Dados" test_database; then
      ((tests_passed++))
      test_results+=("Banco de Dados: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Banco de Dados: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    ;;
    
  2)
    # Testar apenas Stripe
    if run_test "Stripe" test_stripe; then
      ((tests_passed++))
      test_results+=("Stripe: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Stripe: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    ;;
    
  3)
    # Testar apenas Firebase
    if run_test "Firebase" test_firebase; then
      ((tests_passed++))
      test_results+=("Firebase: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Firebase: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    ;;
    
  4)
    # Testar apenas Brevo
    if run_test "Brevo" test_brevo; then
      ((tests_passed++))
      test_results+=("Brevo: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Brevo: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    ;;
    
  5)
    # Testar apenas banco de dados e APIs
    if run_test "Banco de Dados" test_database; then
      ((tests_passed++))
      test_results+=("Banco de Dados: ${GREEN}PASSOU${NC}")
    else
      ((tests_failed++))
      test_results+=("Banco de Dados: ${RED}FALHOU${NC}")
    fi
    ((tests_run++))
    ;;
    
  *)
    echo "Opção inválida. Saindo."
    exit 1
    ;;
esac

# Exibir resumo dos testes
echo -e "\n\n${YELLOW}===================================================${NC}"
echo -e "${YELLOW}📊 RESUMO DOS TESTES DE INTEGRAÇÃO${NC}"
echo -e "${YELLOW}===================================================${NC}\n"

echo -e "Total de testes executados: $tests_run"
echo -e "Testes bem-sucedidos: ${GREEN}$tests_passed${NC}"
echo -e "Testes falhos: ${RED}$tests_failed${NC}"

echo -e "\nResultados por teste:"
for result in "${test_results[@]}"; do
  echo -e "  - $result"
done

echo -e "\n${YELLOW}==================================================${NC}"

# Retornar código de status baseado nos resultados
if [ $tests_failed -eq 0 ]; then
  echo -e "\n${GREEN}✅ TODOS OS TESTES DE INTEGRAÇÃO FORAM BEM-SUCEDIDOS!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ FALHAS DETECTADAS NOS TESTES DE INTEGRAÇÃO!${NC}"
  echo -e "${RED}   Verifique os logs acima para mais detalhes.${NC}"
  exit 1
fi