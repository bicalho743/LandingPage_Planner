import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { pool } from './db';
import { addContactToBrevo, sendTransactionalEmail } from './brevo';
import { firebaseAuth, generatePasswordResetLink } from './firebase';

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
  const firebaseUid = session.metadata?.firebaseUid;
  const planType = session.metadata?.plan_type || 'mensal';
  
  try {
    // 1. Verificar se o usuário já existe no Firebase
    let userRecord;
    try {
      // Verificar se já temos o usuário no Firebase
      if (firebaseUid) {
        userRecord = await firebaseAuth.getUser(firebaseUid);
        console.log(`✅ Usuário encontrado no Firebase com UID: ${firebaseUid}`);
      } else {
        // Tentar obter pelo email
        userRecord = await firebaseAuth.getUserByEmail(email);
        console.log(`✅ Usuário encontrado no Firebase pelo email: ${email}`);
      }
    } catch (firebaseError: any) {
      console.log(`⚠️ Usuário não encontrado no Firebase: ${firebaseError.message}`);
      
      // Se não existe no Firebase, criar com senha aleatória
      try {
        // Gerar senha aleatória segura
        const randomPassword = Math.random().toString(36).slice(-10) + 
                             Math.random().toString(36).toUpperCase().slice(-2) + 
                             Math.floor(Math.random() * 10) + 
                             '!';
        
        userRecord = await firebaseAuth.createUser({
          email: email,
          password: randomPassword,
          displayName: email.split('@')[0] // Nome provisório baseado no email
        });
        
        console.log(`✅ Novo usuário criado no Firebase: ${userRecord.uid}`);
        
        // Enviar email com instruções para definir senha
        try {
          const resetLink = await generatePasswordResetLink(email);
          
          const htmlContent = `
            <h1>Bem-vindo ao PlannerPro Organizer!</h1>
            <p>Olá,</p>
            <p>Seu pagamento foi confirmado com sucesso e criamos uma conta para você.</p>
            <p>Para definir sua senha, clique no link abaixo:</p>
            <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Definir minha senha</a></p>
            <p>Este link irá expirar em 24 horas.</p>
            <p>Atenciosamente,<br>Equipe PlannerPro</p>
          `;
          
          await sendTransactionalEmail(
            email,
            'Bem-vindo ao PlannerPro - Configure sua senha',
            htmlContent,
            'Seu pagamento foi confirmado e sua conta foi criada. Clique no link para definir sua senha.'
          );
          
          console.log(`✅ Email com link para definir senha enviado para: ${email}`);
        } catch (emailError) {
          console.error('❌ Erro ao enviar email com link para definir senha:', emailError);
        }
      } catch (createError) {
        console.error('❌ Erro ao criar usuário no Firebase:', createError);
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
          // Criar nova assinatura
          await storage.createSubscription(user.id, planType as any);
          console.log(`✅ Nova assinatura criada para usuário ${user.id} com plano ${planType}`);
        }
      }
    } catch (subscriptionError) {
      console.error('❌ Erro ao gerenciar assinatura:', subscriptionError);
    }

    // 5. Enviar e-mail de boas-vindas via Brevo
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