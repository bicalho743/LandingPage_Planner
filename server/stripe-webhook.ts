import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { pool } from './db';
import { addContactToBrevo, sendTransactionalEmail } from './brevo';

// Inicializando o Stripe
const stripeKey = process.env.NODE_ENV === 'production' 
  ? process.env.STRIPE_SECRET_KEY 
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurado');
}

const stripe = new Stripe(stripeKey);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const router = express.Router();

// Esta rota deve ser configurada com o express.raw middleware
router.post('/api/stripe-webhook', async (req: Request, res: Response) => {
  let event;
  const sig = req.headers['stripe-signature'];

  if (!sig || !endpointSecret) {
    return res.status(400).send('Webhook Error: Faltando assinatura ou chave secreta');
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err: any) {
    console.error(`❌ Erro ao verificar webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`✅ Evento do Stripe recebido: ${event.type}`);

  try {
    // Manipular diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Evento não manipulado: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(`❌ Erro ao processar webhook ${event.type}:`, error);
    return res.status(500).send('Erro ao processar webhook');
  }
});

// Função para processar um checkout concluído
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`⏳ Processando checkout.session.completed: ${session.id}`);
  
  if (!session.customer_email) {
    console.log('⚠️ E-mail do cliente não encontrado na sessão');
    return;
  }

  const email = session.customer_email;
  const userId = session.client_reference_id;
  
  try {
    // 1. Atualizando status do lead para 'pago'
    try {
      await pool.query(
        'UPDATE leads SET status = $1 WHERE email = $2',
        ['pago', email]
      );
      console.log(`✅ Status de lead atualizado para ${email}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar status do lead:', error);
      // Continuar mesmo com erro, pois o usuário é mais importante
    }

    // 2. Se temos referência do usuário, atualizar status da assinatura
    if (userId) {
      try {
        // Atualizar status da assinatura para ativo
        await storage.updateSubscriptionStatus(Number(userId), 'active');
        console.log(`✅ Status de assinatura atualizado para usuário ${userId}`);
      } catch (error) {
        console.error('❌ Erro ao atualizar status da assinatura:', error);
      }
    }

    // 3. Enviar e-mail de boas-vindas via Brevo
    try {
      const htmlContent = `
        <h1>Bem-vindo ao PlannerPro Organizer!</h1>
        <p>Olá,</p>
        <p>Obrigado por se cadastrar na nossa plataforma. Seu pagamento foi confirmado com sucesso!</p>
        <p>Você pode acessar sua conta a qualquer momento usando seu e-mail e senha.</p>
        <p>Atenciosamente,<br>Equipe PlannerPro</p>
      `;

      await sendTransactionalEmail(
        email,
        'Bem-vindo ao PlannerPro Organizer!',
        htmlContent,
        'Obrigado por se cadastrar. Seu pagamento foi confirmado com sucesso!'
      );
      
      console.log(`✅ E-mail de boas-vindas enviado para ${email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de boas-vindas:', error);
    }

    // 4. Adicionar contato à lista do Brevo para e-mail marketing
    try {
      const name = email.split('@')[0]; // Nome provisório baseado no email
      await addContactToBrevo(name, email);
      console.log(`✅ Contato adicionado ao Brevo para email marketing: ${email}`);
    } catch (error) {
      console.error('❌ Erro ao adicionar contato ao Brevo:', error);
    }

    console.log(`✅ Pagamento confirmado processado com sucesso para: ${email}`);
  } catch (error) {
    console.error('❌ Erro geral ao processar pagamento confirmado:', error);
    throw error;
  }
}

// Função para processar uma fatura paga
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`⏳ Processando invoice.paid: ${invoice.id}`);
  
  if (!invoice.customer_email) {
    console.log('⚠️ E-mail do cliente não encontrado na fatura');
    return;
  }
  
  try {
    // Aqui podemos registrar o pagamento recorrente da assinatura
    // ou enviar e-mail de agradecimento pelo pagamento recorrente
    console.log(`✅ Pagamento de fatura processado para: ${invoice.customer_email}`);
  } catch (error) {
    console.error('❌ Erro ao processar fatura paga:', error);
    throw error;
  }
}

// Função para processar uma assinatura criada
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`⏳ Processando customer.subscription.created: ${subscription.id}`);
  
  // A lógica principal já é tratada no checkout.session.completed,
  // mas podemos atualizar metadados adicionais aqui se necessário
  
  console.log(`✅ Nova assinatura processada: ${subscription.id}`);
}

// Função para processar uma assinatura atualizada
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`⏳ Processando customer.subscription.updated: ${subscription.id}`);
  
  const status = subscription.status;
  const customerId = subscription.customer as string;
  
  try {
    // Obter informações do cliente
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.log('⚠️ Cliente foi excluído');
      return;
    }
    
    const email = customer.email;
    if (!email) {
      console.log('⚠️ E-mail do cliente não encontrado');
      return;
    }
    
    // Atualizar status da assinatura no banco de dados
    // Precisamos primeiro encontrar o usuário pelo e-mail
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`⚠️ Usuário não encontrado para e-mail: ${email}`);
      return;
    }
    
    // Atualizar status da assinatura
    await storage.updateSubscriptionStatus(user.id, status as any);
    console.log(`✅ Status da assinatura atualizado para ${status} do usuário ${user.id}`);
  } catch (error) {
    console.error('❌ Erro ao processar atualização de assinatura:', error);
    throw error;
  }
}

// Função para processar uma assinatura cancelada/excluída
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`⏳ Processando customer.subscription.deleted: ${subscription.id}`);
  
  const customerId = subscription.customer as string;
  
  try {
    // Obter informações do cliente
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.log('⚠️ Cliente foi excluído');
      return;
    }
    
    const email = customer.email;
    if (!email) {
      console.log('⚠️ E-mail do cliente não encontrado');
      return;
    }
    
    // Atualizar status da assinatura para cancelada
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`⚠️ Usuário não encontrado para e-mail: ${email}`);
      return;
    }
    
    await storage.updateSubscriptionStatus(user.id, 'canceled');
    console.log(`✅ Assinatura marcada como cancelada para usuário ${user.id}`);
    
    // Enviar e-mail de despedida/feedback
    try {
      const htmlContent = `
        <h2>Cancelamento de Assinatura</h2>
        <p>Olá,</p>
        <p>Notamos que você cancelou sua assinatura do PlannerPro Organizer.</p>
        <p>Agradecemos por ter sido nosso cliente e gostaríamos de saber se há algo que poderíamos ter feito melhor.</p>
        <p>Você pode responder a este e-mail com seu feedback, ficaremos gratos em ouvir sua opinião.</p>
        <p>Atenciosamente,<br>Equipe PlannerPro</p>
      `;
      
      await sendTransactionalEmail(
        email,
        'Sobre seu cancelamento do PlannerPro Organizer',
        htmlContent,
        'Agradecemos por ter sido nosso cliente. Ficaríamos gratos em receber seu feedback.'
      );
      
      console.log(`✅ E-mail de cancelamento enviado para ${email}`);
    } catch (emailError) {
      console.error('❌ Erro ao enviar e-mail de cancelamento:', emailError);
    }
  } catch (error) {
    console.error('❌ Erro ao processar cancelamento de assinatura:', error);
    throw error;
  }
}

export default router;