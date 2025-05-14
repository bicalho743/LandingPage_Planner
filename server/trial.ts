import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { addContactToBrevo } from './brevo';

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

// Obter ID do preço com base no tipo de plano em teste ou produção
function getPriceId(planType: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  switch (planType) {
    case 'monthly':
      return isProduction 
        ? (process.env.STRIPE_PRICE_MONTHLY || '')
        : (process.env.STRIPE_PRICE_MONTHLY_TEST || '');
    case 'annual':
      return isProduction 
        ? (process.env.STRIPE_PRICE_ANNUAL || '') 
        : (process.env.STRIPE_PRICE_ANNUAL_TEST || '');
    case 'lifetime':
      return isProduction 
        ? (process.env.STRIPE_PRICE_LIFETIME || '') 
        : (process.env.STRIPE_PRICE_LIFETIME_TEST || '');
    default:
      return isProduction 
        ? (process.env.STRIPE_PRICE_MONTHLY || '')
        : (process.env.STRIPE_PRICE_MONTHLY_TEST || '');
  }
}

/**
 * Endpoint para criar uma sessão de checkout com período de trial de 7 dias
 * Permite que usuários acessem o sistema imediatamente após a confirmação do checkout
 * sem esperar pelo pagamento da primeira fatura
 */
router.post('/api/trial-checkout', express.json(), async (req: Request, res: Response) => {
  try {
    const { name, email, password, planType = 'monthly' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }
    
    console.log(`⏳ Iniciando checkout com período de trial para: ${email}`);
    
    // 1. Verificar se o usuário já existe no banco de dados
    let user = await storage.getUserByEmail(email);
    
    // 2. Se não existir, criar um novo usuário com status 'pendente'
    if (!user) {
      try {
        user = await storage.createUser({
          name,
          email,
          status: 'pendente',
          senha_hash: password, // Armazenar a senha temporariamente até criar o usuário no Firebase
          firebase_uid: '', // Será preenchido após o pagamento
          trial: true // Marcar como usuário em trial
        });
        console.log(`✅ Usuário pendente criado no banco: ${user.id}`);
      } catch (dbError) {
        console.error('❌ Erro ao criar usuário no banco de dados:', dbError);
        return res.status(500).json({ error: 'Erro ao criar usuário no banco de dados' });
      }
    } else {
      console.log(`⚠️ Usuário já existe no banco: ${user.id}`);
      
      // Usuário já existe, verificar status
      if (user.status === 'ativo') {
        return res.status(400).json({ 
          error: 'Usuário já cadastrado e ativo', 
          message: 'Você já possui uma conta ativa. Faça login para continuar.'
        });
      }
      
      // Atualizar a senha armazenada no banco se necessário
      if (!user.senha_hash) {
        try {
          await storage.updateUserPassword(user.id, password);
          console.log(`✅ Senha atualizada para usuário existente: ${user.id}`);
        } catch (updateError) {
          console.error('❌ Erro ao atualizar senha do usuário:', updateError);
        }
      }
    }
    
    // 3. Adicionar contato ao Brevo para email marketing
    try {
      await addContactToBrevo(name, email);
      console.log(`✅ Contato adicionado ao Brevo: ${email}`);
    } catch (brevoError) {
      console.error('⚠️ Erro ao adicionar contato ao Brevo:', brevoError);
      // Continuamos o fluxo mesmo com erro no Brevo
    }
    
    // 4. Obter o preço correto com base no tipo de plano
    const priceId = getPriceId(planType);
    
    if (!priceId) {
      console.error(`❌ ID de preço não configurado para o plano: ${planType}`);
      return res.status(500).json({ error: 'Erro na configuração de preços' });
    }
    
    // Codificar a senha em base64 para enviar nos metadados
    const encodedPassword = Buffer.from(password).toString('base64');
    
    // 5. Criar sessão de checkout do Stripe com trial de 7 dias
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      customer_email: email,
      client_reference_id: user.id.toString(),
      success_url: `${req.headers.origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/planos`,
      metadata: {
        userId: user.id.toString(),
        name: name,
        email: email,
        planType: planType,
        senha: encodedPassword,
        trial: 'true' // Marcador para indicar que é uma sessão com trial
      }
    });
    
    console.log(`✅ Sessão de checkout com trial criada: ${session.id}`);
    
    // 6. Enviar URL da sessão para o frontend
    res.json({ 
      checkoutUrl: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar sessão de checkout com trial:', error);
    res.status(500).json({ 
      error: 'Erro ao processar sua solicitação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;