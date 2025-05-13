import type { Express, Request, Response } from "express";
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

export async function registerRoutes(app: Express): Promise<Server> {
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
      await createFirebaseUser(email, 'senhaSegura123!');
      console.log("✅ Usuário criado no Firebase:", email);
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
