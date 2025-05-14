import express, { Request, Response } from 'express';
import { storage } from './storage';
import Stripe from 'stripe';
import { firebaseAuth } from './firebase';
import { pool } from './db';

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

/**
 * Endpoint para criar uma sessão de checkout com período de trial de 7 dias
 * Permite que usuários acessem o sistema imediatamente após a confirmação do checkout
 * sem esperar pelo pagamento da primeira fatura
 */
router.post('/api/trial-checkout', express.json(), async (req: Request, res: Response) => {
  try {
    const { email, nome, senha, planType } = req.body;
    
    if (!email || !nome || !senha || !planType) {
      return res.status(400).json({ 
        success: false, 
        message: "Todos os campos são obrigatórios (email, nome, senha, planType)" 
      });
    }
    
    console.log(`⏳ Iniciando checkout com trial para: ${email}`);

    // Verificar se o usuário já existe
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      // Se o usuário já existe mas não tem Firebase UID, permite prosseguir
      // para que o usuário seja sincronizado após o checkout
      if (existingUser.firebaseUid) {
        return res.status(400).json({
          success: false,
          message: "Este email já está cadastrado. Por favor, faça login."
        });
      }
    }
    
    // Obter o preço correto baseado no plano selecionado
    let priceId: string;
    if (planType === 'mensal') {
      priceId = isProduction 
        ? process.env.STRIPE_PRICE_MONTHLY || ''
        : process.env.STRIPE_PRICE_MONTHLY_TEST || '';
    } else if (planType === 'anual') {
      priceId = isProduction 
        ? process.env.STRIPE_PRICE_ANNUAL || ''
        : process.env.STRIPE_PRICE_ANNUAL_TEST || '';
    } else {
      return res.status(400).json({
        success: false,
        message: "Tipo de plano inválido. Use 'mensal' ou 'anual' para trial."
      });
    }
    
    // Criar ou atualizar usuário no banco de dados
    let userId: number;
    if (existingUser) {
      userId = existingUser.id;
      
      // Atualizar a senha armazenada para uso posterior
      await pool.query(
        'UPDATE users SET senha_hash = $1, updated_at = $2 WHERE id = $3',
        [senha, new Date(), userId]
      );
    } else {
      // Criar novo usuário no banco de dados (sem Firebase UID ainda)
      const newUser = await storage.createUser({
        email,
        name: nome,
        password: 'senha_gerenciada_pelo_firebase',
        status: 'pendente',
        senha_hash: senha
      });
      userId = newUser.id;
    }
    
    // Criar sessão de checkout com trial de 7 dias
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 7
      },
      customer_email: email,
      client_reference_id: userId.toString(),
      metadata: {
        userId: userId.toString(),
        nome,
        email,
        senha: Buffer.from(senha).toString('base64'), // Codificar senha para segurança
        planType
      },
      success_url: `${req.protocol}://${req.get('host')}/sucesso?email=${email}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancelado`,
    });
    
    console.log(`✅ Sessão de checkout com trial criada para: ${email}`);
    
    // Retornar URL da sessão de checkout
    return res.status(200).json({
      success: true,
      checkoutUrl: session.url
    });
  } catch (error) {
    console.error('❌ Erro ao criar sessão de checkout com trial:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao processar checkout com período de trial."
    });
  }
});

export default router;