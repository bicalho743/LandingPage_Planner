import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import express from "express";
import { createFirebaseUser, generatePasswordResetLink } from "./firebase";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const isProduction = process.env.NODE_ENV === 'production';
const stripeKey = isProduction 
  ? process.env.STRIPE_SECRET_KEY 
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

console.log(`Iniciando Stripe no modo ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log(`Usando chave ${isProduction ? 'de produção' : 'de teste'}`);

const stripe = new Stripe(stripeKey);

// Obter o ID do preço com base no tipo de plano e ambiente
function getPriceId(planType: string): string {
  // Usar os IDs de preço do ambiente de teste ou produção com base no modo atual
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
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint para obter informações do usuário atual
  app.get('/api/user/subscription', async (req: Request, res: Response) => {
    try {
      // Em uma implementação real, verificaríamos a autenticação do usuário
      // e buscaríamos as informações com base no ID do usuário autenticado
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email não fornecido'
        });
      }
      
      // Buscar o usuário pelo email
      const user = await storage.getUserByEmail(email as string);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Buscar informações da assinatura
      const subscription = await storage.getSubscriptionByUserId(user.id);
      
      if (!subscription) {
        return res.status(200).json({
          success: true,
          hasSubscription: false,
          message: 'Usuário não possui assinatura'
        });
      }
      
      return res.status(200).json({
        success: true,
        hasSubscription: true,
        subscription: {
          planType: subscription.planType,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          isActive: subscription.status === 'active'
        }
      });
    } catch (error: any) {
      console.error('Erro ao buscar informações da assinatura:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar informações da assinatura'
      });
    }
  });
  
  // Endpoint para iniciar o processo de checkout
  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;
      
      if (!plan || !['mensal', 'anual', 'vitalicio'].includes(plan)) {
        return res.status(400).json({ 
          success: false, 
          message: "Plano inválido ou não especificado." 
        });
      }

      const priceId = getPriceId(plan);
      
      if (!priceId) {
        console.error(`ID de preço não encontrado para o plano: ${plan}`);
        return res.status(500).json({
          success: false,
          message: "Erro na configuração do plano. Por favor, contate o suporte."
        });
      }

      // Configurando o modo de pagamento com base no tipo de plano
      const mode = plan === 'vitalicio' ? 'payment' : 'subscription';
      
      // Criando a sessão de checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: `${req.protocol}://${req.headers.host}/sucesso?plan=${plan}`,
        cancel_url: `${req.protocol}://${req.headers.host}/cancelado`,
        metadata: {
          plan_type: plan
        }
      });

      res.json({
        success: true,
        url: session.url
      });
    } catch (error: any) {
      console.error("Erro ao criar sessão de checkout:", error);
      res.status(500).json({
        success: false,
        message: `Falha ao processar o checkout: ${error.message}`
      });
    }
  });

  // Webhook do Stripe para processar eventos de pagamento
  app.post("/api/webhooks/stripe", express.raw({type: 'application/json'}), async (req: any, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error("❌ Segredo do Webhook não configurado.");
      return res.status(400).send("Webhook não autorizado.");
    }

    try {
      let event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ Webhook Recebido:", event.type);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userEmail = session.customer_email;
        console.log("✅ Pagamento confirmado:", session);

        if (userEmail) {
          await createOrUpdateUser(userEmail);
          await createSubscription(session);
        }
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('❌ Erro no webhook:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function createOrUpdateUser(email: string) {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log("✅ Criando usuário no Firebase para:", email);
      
      // Criar o usuário no Firebase
      const firebaseUser = await createFirebaseUser(email, 'senhaSegura123!');
      console.log("✅ Usuário criado no Firebase:", email);
      
      // Criar usuário no banco de dados local
      const newUser = await storage.createUser({
        email,
        name: email.split('@')[0], // Nome provisório baseado no email
        password: 'senha_gerenciada_pelo_firebase', // Não usamos diretamente, pois o Firebase gerencia a autenticação
        firebaseUid: firebaseUser.uid
      });
      console.log("✅ Usuário criado no banco de dados:", newUser.id);
      
      try {
        // Gerar link de redefinição de senha e enviar para o e-mail do usuário
        const resetLink = await generatePasswordResetLink(email);
        console.log("✅ Link de redefinição de senha gerado:", resetLink);
        
        // Aqui você poderia enviar o e-mail com o link usando um serviço de e-mail
        // No ambiente de desenvolvimento, apenas mostraremos o link no console
        console.log("📧 E-mail de definição de senha seria enviado para:", email);
        console.log("📧 Link:", resetLink);
      } catch (resetError) {
        console.error("❌ Erro ao gerar link de redefinição de senha:", resetError);
        // Continuamos mesmo se houver erro na geração do link, pois o usuário já foi criado
      }
    } else {
      console.log("✅ Usuário já existe no sistema:", email);
    }
  } catch (error) {
    console.error("❌ Erro ao criar/atualizar usuário:", error);
  }
}

async function createSubscription(session: any) {
  try {
    const userEmail = session.customer_email;
    const planMode = session.mode;
    const subscriptionId = session.subscription;

    if (userEmail && subscriptionId) {
      const user = await storage.getUserByEmail(userEmail);
      if (user) {
        await storage.createSubscription(user.id, planMode === 'subscription' ? 'annual' : 'lifetime');
        console.log("✅ Assinatura criada/atualizada para o usuário:", user.email);
      }
    }
  } catch (error) {
    console.error("❌ Erro ao criar assinatura:", error);
  }
}
