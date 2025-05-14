import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { pool } from './db';
import { addContactToBrevo, sendTransactionalEmail } from './brevo';
import { firebaseAuth, generatePasswordResetLink } from './firebase';

const router = express.Router();

// Inicializando o Stripe
const isProduction = process.env.NODE_ENV === 'production';
const stripeKey = isProduction 
  ? process.env.STRIPE_SECRET_KEY 
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurado');
}

const stripe = new Stripe(stripeKey);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Rota do webhook do Stripe
router.post('/api/stripe-webhook-new', async (req: Request, res: Response) => {
  console.log('⏳ Webhook recebido em /api/stripe-webhook-new');
  
  // Verificar se o corpo da requisição é um buffer (para verificação de assinatura)
  // ou se é um objeto (para testes diretos)
  let event: Stripe.Event;
  
  if (Buffer.isBuffer(req.body)) {
    // Modo de produção - verificar assinatura
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      console.error('❌ Assinatura do Stripe não encontrada no cabeçalho');
      return res.status(400).send('Webhook Error: No signature provided');
    }
    
    if (!endpointSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET não está configurado no ambiente');
      return res.status(500).send('Server Error: Webhook secret not configured');
    }

    try {
      // Verificar a assinatura do webhook
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
    } catch (err: any) {
      console.error(`❌ Erro ao verificar webhook: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Modo de desenvolvimento/teste - aceitar objeto diretamente
    console.log('⚠️ Modo de teste detectado - executando webhook sem verificação de assinatura');
    
    // Usar o payload diretamente
    try {
      // Para testes, usamos o corpo da requisição diretamente
      event = req.body as Stripe.Event;
    } catch (err: any) {
      console.error(`❌ Erro ao processar webhook de teste: ${err.message}`);
      return res.status(400).send(`Webhook Test Error: ${err.message}`);
    }
  }

  console.log(`✅ Evento do Stripe recebido: ${event.type}`);

  try {
    // Manipular diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout concluído:', session.id);
        await handleCheckoutCompleted(session);
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('✅ Fatura paga:', invoice.id);
        await handleInvoicePaid(invoice);
        break;
      }

      // Adicione outros handlers de eventos conforme necessário
    }

    // Responder imediatamente ao Stripe com status 200
    return res.status(200).send();
  } catch (error) {
    console.error('❌ Erro ao processar evento Stripe:', error);
    return res.status(500).send('Error processing webhook');
  }
});

// Função para lidar com checkout concluído
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userEmail = session.customer_email;
  
  if (!userEmail) {
    console.error('❌ Email não encontrado na sessão de checkout');
    return;
  }
  
  console.log(`⏳ Processando checkout para ${userEmail}`);
  
  try {
    // 1. Obter dados dos metadados
    const metadata = session.metadata || {};
    const userName = metadata.name || userEmail.split('@')[0];
    const userId = metadata.userId;
    const encodedPassword = metadata.senha;
    const planType = metadata.planType || 'monthly';
    const isTrial = metadata.trial === 'true';
    
    // 2. Obter ou decodificar a senha
    let userPassword: string;
    
    if (encodedPassword) {
      userPassword = Buffer.from(encodedPassword, 'base64').toString('utf-8');
      console.log('✅ Senha recuperada dos metadados da sessão');
    } else {
      // Buscar a senha do banco
      const dbUser = await storage.getUserByEmail(userEmail);
      if (dbUser && dbUser.senha_hash) {
        userPassword = dbUser.senha_hash;
        console.log('✅ Senha recuperada do banco de dados');
      } else {
        // Gerar senha aleatória como último recurso
        userPassword = generateRandomPassword();
        console.log('⚠️ Senha não encontrada, gerando senha aleatória');
      }
    }
    
    // 3. Buscar usuário no banco
    let user = await storage.getUserByEmail(userEmail);
    
    if (!user) {
      console.error(`❌ Usuário não encontrado no banco: ${userEmail}`);
      return;
    }
    
    // 4. Verificar se o usuário já existe no Firebase
    try {
      // Tentar obter pelo email
      const userRecord = await firebaseAuth.getUserByEmail(userEmail);
      console.log(`⚠️ Usuário já existe no Firebase: ${userRecord.uid}`);
      
      // Atualizar Firebase UID e status no banco se necessário
      if (!user.firebaseUid || user.firebaseUid !== userRecord.uid) {
        await storage.updateFirebaseUid(user.id, userRecord.uid);
        console.log(`✅ Firebase UID atualizado no banco: ${userRecord.uid}`);
      }
      
      // Atualizar status para ativo
      await storage.updateUserStatus(user.id, undefined, 'ativo');
      console.log(`✅ Status do usuário atualizado para 'ativo'`);
    } catch (firebaseError: any) {
      // Se o usuário não existir no Firebase, criar um novo
      if (firebaseError.code === 'auth/user-not-found') {
        console.log(`✅ Usuário não encontrado no Firebase, criando novo...`);
        
        try {
          // Criar usuário no Firebase
          const userRecord = await firebaseAuth.createUser({
            email: userEmail,
            password: userPassword,
            displayName: userName
          });
          
          console.log(`✅ Usuário criado no Firebase com UID: ${userRecord.uid}`);
          
          // Atualizar o usuário no banco com o firebaseUid e status ativo
          await storage.updateFirebaseUid(user.id, userRecord.uid);
          
          // Se for trial, atualizar datas de trial
          if (isTrial) {
            const now = new Date();
            const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 dias
            
            await pool.query(
              `UPDATE users SET trial_start = $1, trial_end = $2 WHERE id = $3`,
              [now, trialEnd, user.id]
            );
            
            console.log(`✅ Período de trial definido: início=${now.toISOString()}, fim=${trialEnd.toISOString()}`);
          }
          
          // Criar assinatura no banco
          await storage.createSubscription(user.id, planType);
          console.log(`✅ Assinatura criada com plano: ${planType}`);
          
          // Enviar email de boas-vindas
          await sendWelcomeEmail(userEmail);
          console.log(`✅ Email de boas-vindas enviado para: ${userEmail}`);
        } catch (createError) {
          console.error(`❌ Erro ao criar usuário no Firebase:`, createError);
          throw createError;
        }
      } else {
        console.error(`❌ Erro ao verificar usuário no Firebase:`, firebaseError);
        throw firebaseError;
      }
    }
    
    console.log(`✅ Checkout processado com sucesso para: ${userEmail}`);
  } catch (error) {
    console.error(`❌ Erro ao processar checkout:`, error);
    throw error;
  }
}

// Função para lidar com fatura paga
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`⏳ Processando fatura paga: ${invoice.id}`);
  
  // Implementação simplificada
  const customerEmail = invoice.customer_email;
  
  if (!customerEmail) {
    console.error('❌ Email não encontrado na fatura');
    return;
  }
  
  try {
    // Buscar usuário
    const user = await storage.getUserByEmail(customerEmail);
    
    if (user) {
      // Atualizar status da assinatura
      await storage.updateSubscriptionStatus(user.id, 'active');
      console.log(`✅ Status da assinatura atualizado para 'active' para usuário: ${user.id}`);
    } else {
      console.log(`⚠️ Usuário não encontrado para fatura: ${customerEmail}`);
    }
    
    console.log(`✅ Fatura processada com sucesso para: ${customerEmail}`);
  } catch (error) {
    console.error(`❌ Erro ao processar fatura:`, error);
  }
}

// Funções auxiliares
async function sendWelcomeEmail(email: string) {
  try {
    // Gerar link de redefinição de senha
    const resetLink = await generatePasswordResetLink(email);
    
    const htmlContent = `
      <h1>Bem-vindo ao PlannerPro Organizer!</h1>
      <p>Olá,</p>
      <p>Seu pagamento foi confirmado com sucesso e sua conta está pronta para uso.</p>
      <p>Para definir sua senha permanente, clique no link abaixo:</p>
      <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Definir minha senha</a></p>
      <p>Este link irá expirar em 24 horas.</p>
      <p>Atenciosamente,<br>Equipe PlannerPro</p>
    `;
    
    const textContent = `
      Bem-vindo ao PlannerPro Organizer!
      
      Olá,
      
      Seu pagamento foi confirmado com sucesso e sua conta está pronta para uso.
      
      Para definir sua senha permanente, acesse o link enviado.
      
      Atenciosamente,
      Equipe PlannerPro
    `;
    
    await sendTransactionalEmail(
      email,
      "Bem-vindo ao PlannerPro - Sua conta está pronta!",
      htmlContent,
      textContent
    );
    
    // Adicionar ao Brevo para marketing
    await addContactToBrevo(email.split('@')[0], email);
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email de boas-vindas:`, error);
    return false;
  }
}

function generateRandomPassword(): string {
  return (
    Math.random().toString(36).slice(-10) + 
    Math.random().toString(36).toUpperCase().slice(-2) + 
    Math.floor(Math.random() * 10) + 
    '!'
  );
}

export default router;