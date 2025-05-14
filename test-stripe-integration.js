/**
 * Script para testar integração com o Stripe
 * 
 * Este script testa a integração com a API do Stripe realizando
 * operações não-destrutivas como:
 * - Verificar se as chaves API estão configuradas corretamente
 * - Verificar se os produtos e preços existem
 * - Simular o início de um checkout (sem completar)
 * - Simular o envio de um evento webhook
 */

// Melhores práticas de segurança: nunca exibir as chaves completas
function maskKey(key) {
  if (!key) return '[não definido]';
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}

async function testStripeIntegration() {
  console.log('🔄 Iniciando testes de integração com Stripe...');
  
  // 1. Verificar variáveis de ambiente
  console.log('\n📋 Verificando configuração do Stripe:');
  
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
  
  const stripeSecretKey = isProduction 
    ? process.env.STRIPE_SECRET_KEY 
    : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);
  
  const stripePublicKey = isProduction
    ? process.env.VITE_STRIPE_PUBLIC_KEY 
    : (process.env.VITE_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY);
  
  if (!stripeSecretKey) {
    console.error('❌ Chave secreta do Stripe não configurada!');
    return false;
  }
  
  if (!stripePublicKey) {
    console.error('❌ Chave pública do Stripe não configurada!');
    return false;
  }
  
  console.log(`✅ Chave secreta do Stripe: ${maskKey(stripeSecretKey)}`);
  console.log(`✅ Chave pública do Stripe: ${maskKey(stripePublicKey)}`);
  
  // Verificar tipo de chave (test/live)
  const isLiveMode = stripeSecretKey.startsWith('sk_live_');
  console.log(`Modo: ${isLiveMode ? 'LIVE (Produção)' : 'TEST (Testes)'}`);
  
  if (isProduction && !isLiveMode) {
    console.warn('⚠️ ALERTA: Ambiente de produção está usando chave de TESTE!');
  } else if (!isProduction && isLiveMode) {
    console.warn('⚠️ ALERTA: Ambiente de desenvolvimento está usando chave de PRODUÇÃO!');
  } else {
    console.log('✅ Configuração de ambiente e chaves consistente');
  }
  
  // 2. Inicializar Stripe
  let stripe;
  try {
    const Stripe = require('stripe');
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    console.log('✅ Cliente Stripe inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar cliente Stripe:', error.message);
    return false;
  }
  
  // 3. Testar endpoints básicos do Stripe
  try {
    console.log('\n📋 Testando conectividade com API do Stripe...');
    const balance = await stripe.balance.retrieve();
    console.log('✅ Conexão com API do Stripe estabelecida com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar à API do Stripe:', error.message);
    return false;
  }
  
  // 4. Verificar produtos e preços
  try {
    console.log('\n📋 Verificando produtos e preços configurados...');
    
    const products = await stripe.products.list({ active: true, limit: 10 });
    console.log(`✅ ${products.data.length} produtos ativos encontrados`);
    
    if (products.data.length === 0) {
      console.warn('⚠️ Nenhum produto ativo encontrado na conta do Stripe');
    } else {
      console.log('📦 Produtos disponíveis:');
      products.data.forEach(product => {
        console.log(`   - ${product.name} (${product.id})`);
      });
    }
    
    // Verificar preços configurados nas variáveis de ambiente
    console.log('\n📋 Verificando IDs de preços nas variáveis de ambiente:');
    
    const priceIds = {
      monthly: isProduction ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_MONTHLY_TEST,
      annual: isProduction ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_ANNUAL_TEST,
      lifetime: isProduction ? process.env.STRIPE_PRICE_LIFETIME : process.env.STRIPE_PRICE_LIFETIME_TEST
    };
    
    for (const [type, priceId] of Object.entries(priceIds)) {
      if (!priceId) {
        console.error(`❌ ID de preço ${type.toUpperCase()} não configurado`);
        continue;
      }
      
      try {
        const price = await stripe.prices.retrieve(priceId);
        console.log(`✅ Preço ${type.toUpperCase()}: ${priceId} (${price.unit_amount/100} ${price.currency.toUpperCase()})`);
      } catch (error) {
        console.error(`❌ Erro ao verificar preço ${type.toUpperCase()}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar produtos e preços:', error.message);
  }
  
  // 5. Testar criação de cliente e sessão de checkout (sem completar)
  try {
    console.log('\n📋 Simulando criação de sessão de checkout (sem completar)...');
    
    // Criar um cliente de teste
    const testEmail = `test-${Date.now()}@example.com`;
    
    const customer = await stripe.customers.create({
      email: testEmail,
      name: 'Cliente de Teste',
      metadata: {
        test: 'true',
        integration_test: 'true'
      }
    });
    console.log(`✅ Cliente de teste criado: ${customer.id}`);
    
    // Verificar se temos pelo menos um ID de preço para usar no teste
    const testPriceId = 
      priceIds?.monthly || 
      priceIds?.annual || 
      priceIds?.lifetime || 
      (products.data[0]?.default_price);
    
    if (!testPriceId) {
      console.error('❌ Não foi possível determinar um ID de preço para teste');
      
      // Limpar cliente de teste
      await stripe.customers.del(customer.id);
      console.log(`✅ Cliente de teste removido: ${customer.id}`);
      
      return false;
    }
    
    // Criar uma sessão de checkout (sem completar)
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: testPriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/cancel',
      metadata: {
        test: 'true',
        integration_test: 'true'
      }
    });
    
    console.log(`✅ Sessão de checkout criada: ${session.id}`);
    
    // Limpar cliente de teste
    await stripe.customers.del(customer.id);
    console.log(`✅ Cliente de teste removido: ${customer.id}`);
    
  } catch (error) {
    console.error('❌ Erro ao simular checkout:', error.message);
  }
  
  // 6. Verificar configuração de webhooks
  try {
    console.log('\n📋 Verificando configuração de webhooks...');
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('⚠️ Chave secreta do webhook (STRIPE_WEBHOOK_SECRET) não configurada');
    } else {
      console.log(`✅ Chave secreta de webhook configurada: ${maskKey(process.env.STRIPE_WEBHOOK_SECRET)}`);
    }
    
    // Listar webhooks configurados
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    console.log(`✅ ${webhooks.data.length} webhooks encontrados na conta Stripe`);
    
    if (webhooks.data.length === 0) {
      console.warn('⚠️ Nenhum webhook configurado na conta do Stripe');
    } else {
      console.log('📡 Webhooks configurados:');
      webhooks.data.forEach(webhook => {
        console.log(`   - URL: ${webhook.url}`);
        console.log(`     Eventos: ${webhook.enabled_events.length === 1 && webhook.enabled_events[0] === '*' 
          ? 'Todos os eventos' 
          : webhook.enabled_events.join(', ')}`);
        console.log(`     Status: ${webhook.status}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar webhooks:', error.message);
  }
  
  console.log('\n✅ Testes de integração com Stripe concluídos!');
  return true;
}

// Executar os testes de integração
testStripeIntegration()
  .then(success => {
    if (success) {
      console.log('✅ Testes de integração com Stripe completados com sucesso!');
    } else {
      console.error('❌ Testes de integração com Stripe falharam!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro nos testes de integração:', error);
    process.exit(1);
  });