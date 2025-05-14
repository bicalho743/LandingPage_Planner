#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente necessárias 
 * estão configuradas para o ambiente de produção.
 * 
 * Uso: node verificar-env.js
 */

// Cores para o console
const reset = '\x1b[0m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const magenta = '\x1b[35m';

console.log(`${blue}=== Verificador de Variáveis de Ambiente para PlannerPro ===${reset}\n`);

// Função para verificar uma variável de ambiente
function checkEnv(name, pattern = null, required = true) {
  const value = process.env[name];
  const exists = !!value;
  
  const isPatternValid = pattern ? pattern.test(value) : true;
  const isValid = exists && isPatternValid;
  
  if (isValid) {
    console.log(`${green}✓${reset} ${name}: ${green}Configurado corretamente${reset}`);
    return true;
  } else if (!required && !exists) {
    console.log(`${yellow}?${reset} ${name}: ${yellow}Não configurado (opcional)${reset}`);
    return true;
  } else if (!exists) {
    console.log(`${red}✗${reset} ${name}: ${red}Não configurado${reset}`);
    return false;
  } else {
    console.log(`${red}✗${reset} ${name}: ${red}Configurado incorretamente${reset}`);
    return false;
  }
}

// Verificar NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Ambiente atual: ${isProduction ? magenta + 'PRODUÇÃO' + reset : blue + 'DESENVOLVIMENTO' + reset}\n`);

if (!isProduction) {
  console.log(`${yellow}Aviso: Você está em ambiente de desenvolvimento.${reset}`);
  console.log(`${yellow}Para verificar as variáveis de produção, defina NODE_ENV=production${reset}\n`);
}

// Categorias de variáveis
console.log(`${blue}=== Configurações do Stripe ===${reset}`);
const stripeValid = [
  checkEnv('STRIPE_SECRET_KEY', isProduction ? /^sk_live_/ : /^sk_/),
  checkEnv('STRIPE_PUBLIC_KEY', isProduction ? /^pk_live_/ : /^pk_/),
  checkEnv('STRIPE_WEBHOOK_SECRET', /^whsec_/),
  checkEnv('STRIPE_PRICE_MONTHLY', /^price_/),
  checkEnv('STRIPE_PRICE_ANNUAL', /^price_/),
  checkEnv('STRIPE_PRICE_LIFETIME', /^price_/),
  checkEnv('STRIPE_TEST_SECRET_KEY', /^sk_test_/, !isProduction),
  checkEnv('STRIPE_PRICE_MONTHLY_TEST', /^price_/, !isProduction),
  checkEnv('STRIPE_PRICE_ANNUAL_TEST', /^price_/, !isProduction),
  checkEnv('STRIPE_PRICE_LIFETIME_TEST', /^price_/, !isProduction)
].every(Boolean);

console.log(`\n${blue}=== Configurações do Firebase ===${reset}`);
const firebaseValid = [
  checkEnv('VITE_FIREBASE_API_KEY'),
  checkEnv('VITE_FIREBASE_PROJECT_ID'),
  checkEnv('VITE_FIREBASE_APP_ID'),
  checkEnv('FIREBASE_ADMIN_CREDENTIALS', /^\{.*\}$/)
].every(Boolean);

console.log(`\n${blue}=== Configurações do Brevo (Email Marketing) ===${reset}`);
const brevoValid = [
  checkEnv('BREVO_API_KEY')
].every(Boolean);

console.log(`\n${blue}=== Banco de Dados ===${reset}`);
const dbValid = [
  checkEnv('DATABASE_URL', /^postgres/)
].every(Boolean);

// Resumo
console.log(`\n${blue}=== Resumo ===${reset}`);
const allValid = stripeValid && firebaseValid && brevoValid && dbValid;

if (allValid) {
  console.log(`${green}✓ Todas as variáveis de ambiente estão configuradas corretamente!${reset}`);
  console.log(`  Você está pronto para ${isProduction ? 'executar em produção.' : 'iniciar o desenvolvimento.'}`);
} else {
  console.log(`${red}✗ Há variáveis de ambiente faltando ou configuradas incorretamente.${reset}`);
  console.log('  Por favor, corrija os erros acima antes de continuar.');
  
  if (!isProduction) {
    console.log(`\n${yellow}Nota: Algumas variáveis podem não ser necessárias para desenvolvimento.${reset}`);
  }
}

// Se estiver em produção, verifique as variáveis de teste
if (isProduction) {
  console.log(`\n${blue}=== Verificação Adicional de Segurança para Produção ===${reset}`);
  
  if (process.env.STRIPE_TEST_SECRET_KEY) {
    console.log(`${yellow}! STRIPE_TEST_SECRET_KEY: Está configurado, mas não é necessário em produção${reset}`);
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${red}✗ NODE_ENV: Não está configurado como 'production'${reset}`);
  }
}

// Chaves de produção em ambiente de desenvolvimento
if (!isProduction) {
  console.log(`\n${blue}=== Verificação de Segurança para Desenvolvimento ===${reset}`);
  
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.log(`${red}! STRIPE_SECRET_KEY: Você está usando uma chave de PRODUÇÃO em ambiente de DESENVOLVIMENTO${reset}`);
  }
}

console.log(`\n${blue}=== Fim da verificação ===${reset}`);

// Sair com código de erro se não for válido
process.exit(allValid ? 0 : 1);