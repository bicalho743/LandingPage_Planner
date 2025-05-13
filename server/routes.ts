import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactSchema, leadSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";
import express from "express";

// Inicializa o Stripe com a chave secreta (suporte a ambiente de teste e produção)
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

// Determina qual chave usar baseado no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const stripeKey = isProduction 
  ? process.env.STRIPE_SECRET_KEY 
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

// Log da inicialização
console.log(`Iniciando Stripe no modo ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log(`Usando chave ${isProduction ? 'de produção' : 'de teste'}`);

const stripe = new Stripe(stripeKey);

// Import error handling function for consistent error responses
const handleError = (error: any, res: Response) => {
  if (error instanceof ZodError) {
    // Handle validation errors
    const validationError = fromZodError(error);
    res.status(400).json({ 
      success: false, 
      message: "Validation error", 
      errors: validationError.message 
    });
  } else {
    // Handle other errors
    console.error("API error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to process your request" 
    });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== Contact form API route =====
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = contactSchema.parse(req.body);
      
      // Store contact form submission
      const contact = await storage.createContact(validatedData);
      
      // Return success response
      res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully", 
        data: contact 
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== Lead capture API route =====
  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = leadSchema.parse(req.body);
      
      // Store lead form submission
      const lead = await storage.createLead(validatedData);
      
      // Return success response
      res.status(201).json({ 
        success: true, 
        message: "Thank you for your interest! We'll be in touch soon.", 
        data: lead 
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== User registration API route =====
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists with this email
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists"
        });
      }
      
      // Create new user
      const user = await storage.createUser(validatedData);
      
      // Convert lead to user if email exists in leads
      await storage.convertLeadToUser(validatedData.email);
      
      // Return success response (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ 
        success: true, 
        message: "User registered successfully", 
        data: userWithoutPassword 
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== Subscription API routes =====
  app.post("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      const { userId, planType } = req.body;
      
      if (!userId || !planType) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId and planType"
        });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Check if subscription already exists
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      if (existingSubscription) {
        return res.status(409).json({
          success: false,
          message: "User already has an active subscription"
        });
      }
      
      // Create subscription
      const subscription = await storage.createSubscription(userId, planType);
      
      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== Checkout with Stripe =====
  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;
      let priceId: string = '';
      let mode: 'payment' | 'subscription' = 'subscription';

      // Usando os IDs de preço reais do Stripe
      console.log(`Iniciando checkout para plano: ${plan}`);
      
      // Código real para quando tivermos preços configurados no Stripe
      switch (plan) {
        case 'mensal':
          priceId = process.env.STRIPE_PRICE_MONTHLY || '';
          break;
        case 'anual':
          priceId = process.env.STRIPE_PRICE_ANNUAL || '';
          break;
        case 'vitalicio':
          priceId = process.env.STRIPE_PRICE_LIFETIME || '';
          mode = 'payment'; // Plano vitalício é pagamento único
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Plano inválido' 
          });
      }
      
      // Verificação extra para garantir que temos um ID de preço válido
      if (!priceId) {
        return res.status(400).json({
          success: false,
          message: `ID de preço para o plano '${plan}' não configurado. Configure o preço no painel do Stripe e defina a variável de ambiente correspondente.`
        });
      }

      // Adiciona logs para debug
      console.log(`Plano: ${plan}, ID de preço: ${priceId}, Modo: ${mode}`);
      
      // Cria uma sessão de checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode,
        line_items: [{ price: priceId, quantity: 1 }],
        ...(mode === 'subscription' && { subscription_data: { trial_period_days: 7 } }),
        success_url: `${req.headers.origin}/sucesso?plan=${plan}`,
        cancel_url: `${req.headers.origin}/cancelado`,
      });

      res.json({ 
        success: true,
        url: session.url 
      });
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      handleError(error, res);
    }
  });

  // ===== Webhook for Stripe =====
  app.post("/api/webhooks/stripe", 
    express.raw({type: 'application/json'}), 
    async (req: any, res: Response) => {
      const sig = req.headers['stripe-signature'] as string;
      
      try {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        
        if (endpointSecret && sig) {
          // Verifica a assinatura do webhook
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
          );
        } else {
          // Para desenvolvimento, aceita eventos sem verificação
          event = req.body;
        }
        
        // Log the event for debugging
        console.log("Received Stripe webhook event:", event.type);
        
        // Process based on event type
        switch (event.type) {
          case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout completed:', session);
            
            try {
              // Capturar informações importantes da sessão
              const userEmail = session.customer_email;
              const planMode = session.mode;
              const subscriptionId = session.subscription;
              
              if (userEmail) {
                // Verificar se o usuário já existe no sistema
                const existingUser = await storage.getUserByEmail(userEmail);
                
                if (!existingUser) {
                  // Criar um novo usuário com base nos dados da assinatura
                  const newUser = await storage.createUser({
                    email: userEmail,
                    name: userEmail.split('@')[0],
                    password: 'tempHash', // Idealmente, usaríamos um sistema de reset de senha aqui
                    firebaseUid: null
                  });
                  
                  console.log('Novo usuário criado após pagamento:', newUser.id);
                } else {
                  // Atualizar usuário existente com dados da assinatura
                  console.log('Usuário existente atualizado após pagamento:', existingUser.id);
                }
                
                // Criar uma assinatura no banco de dados
                if (subscriptionId) {
                  const planType = planMode === 'subscription' 
                    ? (session.amount_total > 20000 ? 'annual' : 'monthly')
                    : 'lifetime';
                  
                  // Verifique se o usuário existe antes de criar a assinatura
                  const user = existingUser || await storage.getUserByEmail(userEmail);
                  
                  if (user) {
                    await storage.createSubscription(user.id, planType);
                    console.log(`Assinatura ${planType} criada para o usuário ${user.id}`);
                  }
                }
              } else {
                console.log('Sessão de checkout sem email do usuário:', session.id);
              }
            } catch (error) {
              console.error('Erro ao processar checkout.session.completed:', error);
            }
            break;
            
          case 'customer.subscription.updated':
            const updatedSubscription = event.data.object;
            console.log('Subscription updated:', updatedSubscription);
            
            try {
              // Atualizar status da assinatura no banco de dados
              const customerId = updatedSubscription.customer;
              const status = updatedSubscription.status;
              
              // Aqui precisaríamos buscar o usuário pelo customer ID do Stripe
              // e então atualizar o status da assinatura
              console.log(`Assinatura atualizada para: ${status}`);
            } catch (error) {
              console.error('Erro ao processar customer.subscription.updated:', error);
            }
            break;
            
          case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            console.log('Subscription canceled:', deletedSubscription);
            
            try {
              // Marcar assinatura como cancelada no banco de dados
              const customerId = deletedSubscription.customer;
              
              // Aqui precisaríamos buscar o usuário pelo customer ID do Stripe
              // e então marcar a assinatura como cancelada
              console.log('Assinatura cancelada');
            } catch (error) {
              console.error('Erro ao processar customer.subscription.deleted:', error);
            }
            break;
            
          default:
            console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
      } catch (error: any) {
        console.error('Erro no webhook:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    });

  const httpServer = createServer(app);

  return httpServer;
}
