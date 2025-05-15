import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { pool } from './db';
import { addContactToBrevo, sendTransactionalEmail } from './brevo';
import { firebaseAuth, generatePasswordResetLink } from './firebase';
import { handleTrialCheckoutCompleted, handleTrialEndPaymentFailed } from './stripe-webhook-trial';

// Inicializando o Stripe
const stripeKey = process.env.NODE_ENV === 'production' 
  ? process.env.STRIPE_SECRET_KEY 
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurado');
}

const stripe = new Stripe(stripeKey);
// Defina a webhook secret (específica para este endpoint - elegant-rhythm)
// whsec_GXJLDCh03QNkhQOYRANC2vlneLItCfZ8
const endpointSecret = 'whsec_GXJLDCh03QNkhQOYRANC2vlneLItCfZ8';

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
        
        // Verificar se é uma sessão com trial
        const hasTrialPeriod = (session.metadata && session.metadata.trial === 'true');
                             
        if (hasTrialPeriod) {
          // Para sessões com trial, criar usuário no Firebase imediatamente
          console.log('🔄 Sessão de checkout com trial completada, criando usuário imediatamente');
          // Função que será implementada mais abaixo
          await handleTrialCheckoutCompleted(session);
        } else {
          // Para sessões normais, seguir o fluxo padrão
          await handleCheckoutSessionCompleted(session);
        }
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
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Verificar se é a primeira fatura após o período de trial
        const isPostTrialInvoice = invoice.billing_reason === 'subscription_cycle';
                                 
        if (isPostTrialInvoice) {
          // Falha no pagamento após período de trial
          console.log(`❌ Falha no pagamento após período de trial`);
          await handleTrialEndPaymentFailed(invoice);
        } else {
          // Falha de pagamento normal
          console.log(`⚠️ Falha no pagamento da fatura`);
        }
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
  const userId = session.client_reference_id ? parseInt(session.client_reference_id) : undefined;
  let planType = session.metadata?.plan_type || 'mensal';
  
  // Para obter a senha que enviamos nos metadados
  let password;
  
  try {
    // Verificar se o usuário existe no banco e obter a senha armazenada
    const user = await storage.getUserByEmail(email);
    if (user && user.senha_hash) {
      // Usar a senha armazenada no campo senha_hash
      password = user.senha_hash;
      console.log('✅ Senha recuperada do banco de dados');
    } else {
      // Verificar se tem no metadata da sessão
      const encodedPassword = session.metadata?.senha;
      if (encodedPassword) {
        // Decodificar a senha
        password = Buffer.from(encodedPassword, 'base64').toString();
        console.log('✅ Senha recuperada dos metadados da sessão');
      } else {
        // Gerar senha aleatória caso não tenha sido enviada
        password = Math.random().toString(36).slice(-10) + 
                 Math.random().toString(36).toUpperCase().slice(-2) + 
                 Math.floor(Math.random() * 10) + 
                 '!';
        console.log('⚠️ Senha não encontrada, gerando senha aleatória');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao recuperar senha:', error);
    // Gerar senha aleatória em caso de erro
    password = Math.random().toString(36).slice(-10) + 
             Math.random().toString(36).toUpperCase().slice(-2) + 
             Math.floor(Math.random() * 10) + 
             '!';
    console.log('⚠️ Erro ao obter senha, gerando senha aleatória');
  }
  
  try {
    // 1. Verificar se o usuário existe no banco de dados
    let dbUser;
    if (userId) {
      dbUser = await storage.getUser(userId);
    }
    if (!dbUser) {
      dbUser = await storage.getUserByEmail(email);
    }
    if (!dbUser) {
      console.log(`❌ Usuário não encontrado no banco de dados: ${email}`);
      return;
    }
    
    // 2. Verificar se o usuário já existe no Firebase
    let userRecord: any = null;
    let isNewUser = false;
    
    try {
      // Tentar obter pelo email
      userRecord = await firebaseAuth.getUserByEmail(email);
      console.log(`⚠️ Usuário já existe no Firebase: ${userRecord.uid}`);
      // Usuário já existe (caso raro, mas possível)
      
      // Atualizar o status do usuário para ativo no banco de dados
      await storage.updateUserStatus(dbUser.id, undefined, 'ativo');
    } catch (firebaseError: any) {
      // Se o usuário não existir no Firebase, criamos um novo
      if (firebaseError.code === 'auth/user-not-found') {
        console.log(`✅ Usuário não encontrado no Firebase, criando novo...`);
        
        try {
          // Criar usuário no Firebase SOMENTE AGORA, após o pagamento confirmado
          userRecord = await firebaseAuth.createUser({
            email: email,
            password: password,
            displayName: dbUser.name
          });
          
          isNewUser = true;
          console.log(`✅ Novo usuário criado no Firebase: ${userRecord.uid}`);
          
          // Atualizar o usuário no banco de dados com o firebaseUid e status ativo
          await storage.updateFirebaseUid(dbUser.id, userRecord.uid);
          
          // Enviar email de boas-vindas com instruções (opcional)
          // Não enviamos email aqui para evitar múltiplos emails
          console.log(`ℹ️ Email de configuração de senha não será enviado (será enviado apenas um email de boas-vindas no final)`);
          // O email de boas-vindas será enviado mais abaixo no código
        } catch (createError) {
          console.error('❌ Erro ao criar usuário no Firebase:', createError);
        }
      } else {
        console.error('❌ Erro no Firebase:', firebaseError);
      }
    }

    // 2. Atualizar ou criar usuário no banco de dados
    let user;
    try {
      // Verificar se já existe no banco
      user = await storage.getUserByEmail(email);
      
      if (user) {
        console.log(`✅ Usuário encontrado no banco de dados: ${user.id}`);
        
        // Atualizar o firebaseUid se necessário
        if (userRecord && (!user.firebaseUid || user.firebaseUid !== userRecord.uid)) {
          user = await storage.updateFirebaseUid(user.id, userRecord.uid);
          console.log(`✅ Firebase UID atualizado para usuário: ${user.id}`);
        }
      } else {
        // Criar usuário no banco se não existe
        user = await storage.createUser({
          email,
          name: userRecord?.displayName || email.split('@')[0],
          password: 'senha_gerenciada_pelo_firebase',
          firebaseUid: userRecord?.uid || ''
        });
        
        console.log(`✅ Novo usuário criado no banco de dados: ${user.id}`);
      }
    } catch (dbError) {
      console.error('❌ Erro ao gerenciar usuário no banco de dados:', dbError);
    }

    // 3. Atualizar status do lead para 'pago'
    try {
      await pool.query(
        'UPDATE leads SET status = $1, converted_to_user = $2 WHERE email = $3',
        ['pago', true, email]
      );
      console.log(`✅ Status de lead atualizado para ${email}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar status do lead:', error);
    }

    // 4. Criar ou atualizar assinatura
    try {
      if (user) {
        // Verificar se já existe assinatura
        const existingSubscription = await storage.getSubscriptionByUserId(user.id);
        
        if (existingSubscription) {
          // Atualizar status da assinatura existente
          await storage.updateSubscriptionStatus(user.id, 'active');
          console.log(`✅ Status de assinatura atualizado para usuário ${user.id}`);
        } else {
          // Determinar o tipo de plano com base nos metadados ou preço
          if (session.metadata && session.metadata.planType) {
            planType = session.metadata.planType;
          } else if (session.amount_total) {
            // Lógica baseada no valor (aproximada)
            if (session.amount_total >= 10000) {
              planType = 'lifetime';
            } else if (session.amount_total >= 1000) {
              planType = 'annual';
            }
          }
          
          // Criar nova assinatura
          await storage.createSubscription(user.id, planType as any);
          console.log(`✅ Nova assinatura criada para usuário ${user.id} com plano ${planType}`);
          
          // Atualizar datas de trial se necessário
          try {
            await storage.updateUserTrialDates(user.id);
            console.log(`✅ Datas de trial atualizadas para usuário com nova assinatura: ${user.id}`);
          } catch (trialDatesError) {
            console.error(`❌ Erro ao atualizar datas de trial para nova assinatura:`, trialDatesError);
          }
        }
      }
    } catch (subscriptionError) {
      console.error('❌ Erro ao gerenciar assinatura:', subscriptionError);
    }

    // 5. Enviar e-mail de boas-vindas via Brevo (versão com design melhorado)
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="Planner Organizer">
    <title>Bem-vindo ao Planner Organizer!</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
        .header { background-image: url('https://plannerorganiza.com.br/path/to/your/image.png'); background-size: cover; color: #ffffff; padding: 15px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; line-height: 1.6; color: #333333; }
        .cta-button { display: inline-block; padding: 12px 20px; background-color: #1A73E8; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { font-size: 12px; text-align: center; color: #888888; margin-top: 20px; }
        .header img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- Logo em base64 -->
                      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA1LTAxVDEwOjI3OjQxKzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wNS0wMVQxMDoyODozMCswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNS0wMVQxMDoyODozMCswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMzYxN2U1ZC1jZWI3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" alt="PlannerPro Organizer Logo" style="width: 100px; height: auto; margin-bottom: 15px;">
                      <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo ao PlannerPro Organizer!</h1>
        </div>
        <div class="content">
            <p>Olá,</p>
            <p>Estamos felizes em ter você conosco! Agora você tem acesso a uma plataforma completa para organizar seus clientes, criar propostas profissionais e gerenciar seu negócio com facilidade.</p>
            <p>Acesse sua conta e comece a explorar todas as funcionalidades:</p>
            <p><a href="https://plannerorganiza.com.br/" class="cta-button">Acessar Minha Conta</a></p>
        </div>
        <div class="footer">
            <p>Planner Organizer - Simplificando sua rotina e impulsionando seu sucesso.</p>
        </div>
    </div>
</body>
</html>
      `;

      // Versão texto simples para clientes que não suportam HTML
      const textContent = `
        Bem-vindo ao Planner Organizer!
        
        Olá,
        
        Estamos felizes em ter você conosco! Agora você tem acesso a uma plataforma completa para organizar seus clientes, criar propostas profissionais e gerenciar seu negócio com facilidade.
        
        Acesse sua conta e comece a explorar todas as funcionalidades: https://plannerorganiza.com.br/
        
        Planner Organizer - Simplificando sua rotina e impulsionando seu sucesso.
      `;

      await sendTransactionalEmail(
        email,
        'Bem-vindo ao PlannerPro Organizer!',
        htmlContent,
        textContent
      );
      
      console.log(`✅ E-mail de boas-vindas enviado para ${email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de boas-vindas:', error);
    }

    // 6. Adicionar contato à lista do Brevo para e-mail marketing
    try {
      const name = userRecord?.displayName || email.split('@')[0]; 
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
    if ('deleted' in customer && customer.deleted) {
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
    if ('deleted' in customer && customer.deleted) {
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
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="Planner Organizer">
    <title>Cancelamento de Assinatura</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
        .header { background-image: url('https://plannerorganiza.com.br/path/to/your/image.png'); background-size: cover; color: #ffffff; padding: 15px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; line-height: 1.6; color: #333333; }
        .cta-button { display: inline-block; padding: 12px 20px; background-color: #1A73E8; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { font-size: 12px; text-align: center; color: #888888; margin-top: 20px; }
        .header img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA1LTAxVDEwOjI3OjQxKzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wNS0wMVQxMDoyODozMCswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNS0wMVQxMDoyODozMCswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMzYxN2U1ZC1jZWI3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" alt="Planner Organizer Logo">
            <h1 style="color: white; margin: 0; font-size: 28px;">Cancelamento de Assinatura</h1>
        </div>
        <div class="content">
            <p>Olá,</p>
            <p>Notamos que você cancelou sua assinatura do Planner Organizer.</p>
            <p>Agradecemos por ter sido nosso cliente e gostaríamos de saber se há algo que poderíamos ter feito melhor.</p>
            <p>Você pode responder a este e-mail com seu feedback, ficaremos gratos em ouvir sua opinião.</p>
        </div>
        <div class="footer">
            <p>Planner Organizer - Simplificando sua rotina e impulsionando seu sucesso.</p>
        </div>
    </div>
</body>
</html>
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