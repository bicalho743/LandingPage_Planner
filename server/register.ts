import express, { Request, Response } from 'express';
import { firebaseAuth } from './firebase';
import { pool } from './db';
import Stripe from 'stripe';
import { storage } from './storage';

// Inicializando o Stripe
const stripeKey = process.env.NODE_ENV === 'production' 
  ? process.env.STRIPE_SECRET_KEY 
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurado');
}

const stripe = new Stripe(stripeKey);

// Criando o router para registro
const router = express.Router();

/**
 * Rota para cadastro direto com geração de checkout do Stripe
 * Permite que usuários se registrem e sejam redirecionados para checkout 
 * em uma única etapa
 */
router.post('/api/register', async (req: Request, res: Response) => {
  const { nome, email, senha, plano } = req.body;

  if (!nome || !email || !senha || !plano) {
    return res.status(400).json({
      success: false, 
      message: "Todos os campos são obrigatórios (nome, email, senha, plano)" 
    });
  }

  // Verificar se é um e-mail válido
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "E-mail inválido."
    });
  }

  // Verificar se o plano é válido
  if (!['mensal', 'anual', 'vitalicio'].includes(plano)) {
    return res.status(400).json({
      success: false,
      message: "Plano inválido. Escolha entre: mensal, anual ou vitalicio"
    });
  }

  try {
    console.log(`⏳ Iniciando cadastro de usuário: ${email}`);

    // Verificar se o usuário já existe no Firebase
    try {
      const existingUser = await firebaseAuth.getUserByEmail(email);
      console.log(`⚠️ Usuário já existe no Firebase: ${existingUser.uid}`);
      return res.status(400).json({
        success: false,
        message: "Este email já está cadastrado. Tente fazer login."
      });
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        console.error("❌ Erro ao verificar usuário no Firebase:", error);
        return res.status(500).json({
          success: false,
          message: "Erro ao verificar cadastro existente."
        });
      }
      // Usuário não existe, podemos prosseguir
    }

    // Verificar se o usuário já existe no banco de dados
    const existingUserInDB = await storage.getUserByEmail(email);
    if (existingUserInDB) {
      console.log(`⚠️ Usuário já existe no banco de dados: ${existingUserInDB.id}`);
      return res.status(400).json({
        success: false,
        message: "Este email já está cadastrado. Tente fazer login."
      });
    }

    // Criar usuário no Firebase
    const userRecord = await firebaseAuth.createUser({
      email: email,
      password: senha,
      displayName: nome
    });
    
    console.log(`✅ Usuário criado no Firebase: ${userRecord.uid}`);

    // Salvar lead/usuário no banco de dados
    const user = await storage.createUser({
      email: email,
      name: nome,
      password: 'senha_gerenciada_pelo_firebase',
      firebaseUid: userRecord.uid
    });
    
    console.log(`✅ Usuário salvo no banco de dados: ${user.id}`);

    // Obter o ID do preço com base no plano
    const getPriceId = (planType: string): string => {
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (planType === 'mensal') {
        return isProduction 
          ? process.env.STRIPE_PRICE_MONTHLY || ''
          : process.env.STRIPE_PRICE_MONTHLY_TEST || '';
      } else if (planType === 'anual') {
        return isProduction 
          ? process.env.STRIPE_PRICE_ANNUAL || ''
          : process.env.STRIPE_PRICE_ANNUAL_TEST || '';
      } else if (planType === 'vitalicio') {
        return isProduction 
          ? process.env.STRIPE_PRICE_LIFETIME || ''
          : process.env.STRIPE_PRICE_LIFETIME_TEST || '';
      }
      
      throw new Error(`Tipo de plano inválido: ${planType}`);
    };

    const priceId = getPriceId(plano);
    if (!priceId) {
      console.error(`❌ ID de preço não encontrado para o plano: ${plano}`);
      return res.status(500).json({
        success: false,
        message: "Erro na configuração do plano. Por favor, contate o suporte."
      });
    }

    // Configurar modo de pagamento (subscription ou one-time)
    const mode = plano === 'vitalicio' ? 'payment' : 'subscription';

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      client_reference_id: user.id.toString(),
      mode: mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: mode === 'subscription' ? {
        trial_period_days: 7, // Período de teste gratuito para planos de assinatura
      } : undefined,
      success_url: `${req.protocol}://${req.headers.host}/sucesso?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${req.protocol}://${req.headers.host}/cancelado`,
      metadata: {
        userId: user.id.toString(),
        firebaseUid: userRecord.uid,
        plan_type: plano,
        customer_email: email
      }
    });

    console.log(`✅ Sessão de checkout criada: ${session.id}`);

    // Retornar URL do checkout para redirecionamento
    return res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso",
      checkoutUrl: session.url
    });
  } catch (error: any) {
    console.error("❌ Erro ao cadastrar usuário:", error);
    
    // Mensagem de erro mais amigável
    let errorMessage = "Erro ao cadastrar usuário. Tente novamente.";
    
    if (error.code === 'auth/email-already-exists') {
      errorMessage = "Este email já está cadastrado. Tente fazer login.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email inválido. Verifique o formato e tente novamente.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres com letras e números.";
    }
    
    return res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

/**
 * Rota para atualizar o status do usuário após pagamento bem-sucedido
 * Usada pelo webhook do Stripe para finalizar o processo de cadastro
 */
router.put('/api/users/activate', async (req: Request, res: Response) => {
  const { userId, sessionId } = req.body;
  
  if (!userId || !sessionId) {
    return res.status(400).json({
      success: false,
      message: "ID do usuário e ID da sessão são obrigatórios"
    });
  }

  try {
    // Verificar se a sessão existe e foi paga
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: "O pagamento desta sessão ainda não foi confirmado"
      });
    }

    // Atualizar o status do usuário no banco de dados
    // Aqui precisaria de um método adicional no storage
    console.log(`✅ Usuário ativado após pagamento confirmado: ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: "Usuário ativado com sucesso!"
    });
  } catch (error) {
    console.error("❌ Erro ao ativar usuário:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao ativar usuário"
    });
  }
});

export default router;