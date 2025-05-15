/**
 * Script para configurar webhooks do Stripe
 * 
 * Este script adiciona o endpoint /api/webhook-direto à configuração
 * de webhooks do Stripe, mantendo os endpoints existentes.
 * 
 * Uso: NODE_ENV=production node configure-webhook-endpoints.js
 */

// Importações
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Determinar ambiente
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);

// Selecionar a chave API correta com base no ambiente
const stripeKey = isProduction 
  ? process.env.STRIPE_SECRET_KEY 
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

if (!stripeKey) {
  console.error('❌ Chave API do Stripe não configurada!');
  process.exit(1);
}

// Inicializar cliente do Stripe
const stripe = new Stripe(stripeKey);

// Eventos que queremos monitorar
const events = [
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_succeeded',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.created'
];

// Função principal
async function configureWebhooks() {
  console.log('🔄 Iniciando configuração de webhooks do Stripe...');
  
  try {
    // Listar webhooks existentes
    const webhooks = await stripe.webhookEndpoints.list();
    console.log(`📋 Encontrados ${webhooks.data.length} webhooks configurados`);
    
    // URL base do site
    const baseUrl = isProduction 
      ? 'https://landing-leap-solanobicalho.replit.app'
      : process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';
    
    console.log(`📋 URL base: ${baseUrl}`);
    
    // Verificar se já existe um webhook para /api/webhook-direto
    const webhookDireto = webhooks.data.find(webhook => 
      webhook.url.includes('/api/webhook-direto'));
    
    if (webhookDireto) {
      console.log(`✅ Webhook para /api/webhook-direto já existe: ${webhookDireto.url}`);
      console.log(`   Status: ${webhookDireto.status}`);
      console.log(`   Eventos: ${webhookDireto.enabled_events.join(', ')}`);
      
      // Verificar se todos os eventos estão habilitados
      const missingEvents = events.filter(event => 
        !webhookDireto.enabled_events.includes(event) && 
        webhookDireto.enabled_events[0] !== '*');
      
      if (missingEvents.length > 0) {
        console.log(`⚠️ Eventos faltando no webhook: ${missingEvents.join(', ')}`);
        console.log('⏳ Atualizando configuração do webhook...');
        
        // Atualizar webhook para incluir todos os eventos
        await stripe.webhookEndpoints.update(webhookDireto.id, {
          enabled_events: webhookDireto.enabled_events.concat(missingEvents)
        });
        
        console.log('✅ Webhook atualizado com os eventos adicionais');
      } else {
        console.log('✅ Todos os eventos necessários já estão configurados');
      }
    } else {
      console.log('⚠️ Webhook para /api/webhook-direto não encontrado');
      console.log('⏳ Criando novo webhook...');
      
      // Criar novo webhook
      const newWebhook = await stripe.webhookEndpoints.create({
        url: `${baseUrl}/api/webhook-direto`,
        enabled_events: events,
        description: 'Endpoint direto para processamento de eventos do Stripe'
      });
      
      console.log(`✅ Novo webhook criado com ID: ${newWebhook.id}`);
      console.log(`⚠️ IMPORTANTE: Anote a chave de assinatura do webhook para usar nas variáveis de ambiente:`);
      console.log(`📋 Secret: ${newWebhook.secret}`);
      console.log(`⚠️ Se já existir um STRIPE_WEBHOOK_SECRET configurado, você pode continuar usando-o`);
    }
    
    // Verificar webhook principal
    const mainWebhook = webhooks.data.find(webhook => 
      webhook.url.includes('/api/stripe-webhook'));
    
    if (mainWebhook) {
      console.log(`✅ Webhook principal encontrado: ${mainWebhook.url}`);
      console.log(`   Status: ${mainWebhook.status}`);
      console.log(`   Eventos: ${mainWebhook.enabled_events.join(', ')}`);
      
      // Verificar se todos os eventos estão habilitados
      const missingEvents = events.filter(event => 
        !mainWebhook.enabled_events.includes(event) && 
        mainWebhook.enabled_events[0] !== '*');
      
      if (missingEvents.length > 0) {
        console.log(`⚠️ Eventos faltando no webhook principal: ${missingEvents.join(', ')}`);
        console.log('⏳ Atualizando configuração do webhook principal...');
        
        // Atualizar webhook para incluir todos os eventos
        await stripe.webhookEndpoints.update(mainWebhook.id, {
          enabled_events: mainWebhook.enabled_events.concat(missingEvents)
        });
        
        console.log('✅ Webhook principal atualizado com os eventos adicionais');
      } else {
        console.log('✅ Todos os eventos necessários já estão configurados no webhook principal');
      }
    } else {
      console.log('⚠️ Webhook principal não encontrado');
    }
    
    console.log('\n✅ Configuração de webhooks concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar webhooks:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('❌ Erro de autenticação. Verifique se a chave API do Stripe está correta.');
    }
  }
}

// Executar função principal
configureWebhooks().then(() => {
  console.log('✅ Script finalizado');
});