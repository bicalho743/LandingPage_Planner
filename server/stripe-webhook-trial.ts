import { storage } from './storage';
import { firebaseAuth } from './firebase';
import Stripe from 'stripe';
import { addContactToBrevo, sendTransactionalEmail } from './brevo';

const isProduction = process.env.NODE_ENV === 'production';
const hasTestPricesTrial = !!(process.env.STRIPE_PRICE_MONTHLY_TEST || process.env.STRIPE_PRICE_ANNUAL_TEST || process.env.STRIPE_PRICE_LIFETIME_TEST);

const stripeKey = isProduction 
  ? process.env.STRIPE_SECRET_KEY 
  : (hasTestPricesTrial && process.env.STRIPE_TEST_SECRET_KEY) 
    ? process.env.STRIPE_TEST_SECRET_KEY 
    : process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurado');
}

const stripe = new Stripe(stripeKey);

// Função para processar checkout com trial - cria o usuário no Firebase imediatamente
export async function handleTrialCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`⏳ Processando checkout com trial: ${session.id}`);
  
  if (!session.customer_email) {
    console.log('⚠️ E-mail do cliente não encontrado na sessão com trial');
    return;
  }

  const email = session.customer_email;
  const userId = session.client_reference_id ? parseInt(session.client_reference_id) : undefined;
  const planType = session.metadata?.planType || 'mensal';
  
  // Para obter a senha que enviamos nos metadados
  let password;
  
  try {
    // Verificar se o usuário existe no banco e obter a senha armazenada
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`❌ Usuário não encontrado no banco para checkout com trial: ${email}`);
      return;
    }
    
    if (user.senha_hash) {
      // Usar a senha armazenada no campo senha_hash
      password = user.senha_hash;
      console.log('✅ Senha recuperada do banco de dados para trial');
    } else {
      // Verificar se tem no metadata da sessão
      const encodedPassword = session.metadata?.senha;
      if (encodedPassword) {
        // Decodificar a senha
        password = Buffer.from(encodedPassword, 'base64').toString();
        console.log('✅ Senha recuperada dos metadados da sessão de trial');
      } else {
        // Gerar senha aleatória caso não tenha sido enviada
        password = Math.random().toString(36).slice(-10) + 
                 Math.random().toString(36).toUpperCase().slice(-2) + 
                 Math.floor(Math.random() * 10) + 
                 '!';
        console.log('⚠️ Senha não encontrada para trial, gerando senha aleatória');
      }
    }
    
    // 2. Verificar se o usuário já existe no Firebase
    let userRecord: any = null;
    let isNewUser = false;
    
    try {
      // Tentar obter pelo email
      userRecord = await firebaseAuth.getUserByEmail(email);
      console.log(`⚠️ Usuário já existe no Firebase para trial: ${userRecord.uid}`);
      
      // Atualizar o status do usuário para ativo no banco de dados
      await storage.updateUserStatus(user.id, undefined, 'ativo');
    } catch (firebaseError: any) {
      // Se o usuário não existir no Firebase, criamos um novo
      if (firebaseError.code === 'auth/user-not-found') {
        console.log(`✅ Usuário não encontrado no Firebase para trial, criando novo...`);
        
        try {
          // Criar usuário no Firebase IMEDIATAMENTE para trial
          userRecord = await firebaseAuth.createUser({
            email: email,
            password: password,
            displayName: user.name
          });
          
          isNewUser = true;
          console.log(`✅ Novo usuário criado no Firebase para trial: ${userRecord.uid}`);
          
          // Atualizar o usuário no banco de dados com o firebaseUid e status ativo
          await storage.updateFirebaseUid(user.id, userRecord.uid);
          
          // Atualizar as datas de trial do usuário
          try {
            await storage.updateUserTrialDates(user.id);
            console.log(`✅ Datas de trial atualizadas para usuário: ${user.id}`);
          } catch (trialDatesError) {
            console.error(`❌ Erro ao atualizar datas de trial:`, trialDatesError);
          }
          
          // Criar assinatura no banco de dados
          try {
            await storage.createSubscription(user.id, planType);
            console.log(`✅ Assinatura criada para usuário com trial: ${user.id}`);
          } catch (subscriptionError) {
            console.error(`❌ Erro ao criar assinatura para trial:`, subscriptionError);
          }
          
          // Enviar email de boas-vindas informando sobre o trial
          try {
            await sendTrialWelcomeEmail(email);
            console.log(`✅ Email de boas-vindas para trial enviado`);
          } catch (emailError) {
            console.error(`❌ Erro ao enviar email de trial:`, emailError);
          }
        } catch (createError) {
          console.error(`❌ Erro ao criar usuário no Firebase para trial:`, createError);
          throw createError;
        }
      } else {
        console.error(`❌ Erro ao verificar usuário no Firebase para trial:`, firebaseError);
        throw firebaseError;
      }
    }
    
    console.log(`✅ Processamento de checkout com trial concluído para: ${email}`);
  } catch (error) {
    console.error(`❌ Erro ao processar checkout com trial:`, error);
    throw error;
  }
}

// Função para processar falha de pagamento após trial
export async function handleTrialEndPaymentFailed(invoice: Stripe.Invoice) {
  console.log(`⏳ Processando falha de pagamento após trial`);
  
  try {
    // Obter email do cliente
    const customer = invoice.customer as string;
    if (!customer) {
      console.log('⚠️ ID do cliente não encontrado na fatura após trial');
      return;
    }
    
    // Obter detalhes do cliente para conseguir o email
    const customerDetails = await stripe.customers.retrieve(customer);
    if (!customerDetails || customerDetails.deleted === true) {
      console.log('⚠️ Cliente não encontrado ou deletado após trial');
      return;
    }
    
    const email = customerDetails.email;
    if (!email) {
      console.log('⚠️ Email do cliente não encontrado após trial');
      return;
    }
    
    console.log(`⏳ Verificando usuário após falha no pagamento pós-trial: ${email}`);
    
    // Buscar usuário no banco de dados
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`⚠️ Usuário não encontrado no banco após trial: ${email}`);
      return;
    }
    
    // Usuário encontrado, atualizar status para 'bloqueado'
    await storage.updateUserStatus(user.id, undefined, 'bloqueado');
    console.log(`✅ Usuário ${email} bloqueado após falha no pagamento pós-trial`);
    
    // Atualizar status da assinatura
    await storage.updateSubscriptionStatus(user.id, 'unpaid');
    console.log(`✅ Assinatura atualizada para 'unpaid' após trial`);
    
    // Opcional: Enviar email informando sobre a falha no pagamento
    try {
      // Implementar envio de email informativo aqui se necessário
      console.log(`⚠️ Email de aviso de falha de pagamento pós-trial seria enviado para: ${email}`);
    } catch (emailError) {
      console.error(`❌ Erro ao enviar email pós-trial:`, emailError);
    }
    
  } catch (error) {
    console.error(`❌ Erro ao processar falha de pagamento pós-trial:`, error);
    throw error;
  }
}

// Enviar email de boas-vindas específico para trial
export async function sendTrialWelcomeEmail(email: string) {
  try {
    console.log(`⏳ Enviando email de boas-vindas para trial: ${email}`);
    
    const htmlContent = `
      <h1>Bem-vindo ao PlannerPro Organizer!</h1>
      <p>Seu período de trial de 7 dias começou!</p>
      <p>Você já pode acessar todas as funcionalidades premium do PlannerPro durante os próximos 7 dias.</p>
      <p>Após este período, sua forma de pagamento será cobrada automaticamente para continuar seu acesso.</p>
      <p>Se você não deseja continuar após o período de trial, você pode cancelar a qualquer momento através do painel.</p>
      <p>Agradecemos por escolher o PlannerPro Organizer!</p>
    `;
    
    const textContent = `
      Bem-vindo ao PlannerPro Organizer!
      
      Seu período de trial de 7 dias começou!
      
      Você já pode acessar todas as funcionalidades premium do PlannerPro durante os próximos 7 dias.
      Após este período, sua forma de pagamento será cobrada automaticamente para continuar seu acesso.
      
      Se você não deseja continuar após o período de trial, você pode cancelar a qualquer momento através do painel.
      
      Agradecemos por escolher o PlannerPro Organizer!
    `;
    
    // Em produção, aqui entraria o código para enviar o email real
    // Em desenvolvimento, apenas simulamos o envio
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 SIMULAÇÃO: Email de boas-vindas para trial enviado para:', email);
      console.log('📧 Assunto: Bem-vindo ao PlannerPro - Seu período trial de 7 dias começou!');
      return true;
    }
    
    // Envio real do email
    await sendTransactionalEmail(
      email,
      "Bem-vindo ao PlannerPro - Seu período trial de 7 dias começou!",
      htmlContent,
      textContent
    );
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email de boas-vindas para trial:`, error);
    return false;
  }
}