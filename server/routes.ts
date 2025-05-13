import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import express from "express";
import { createFirebaseUser, generatePasswordResetLink } from "./firebase";
import nodemailer from "nodemailer";
import { addContactToBrevo } from "./brevo";

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

// Função para enviar e-mail de boas-vindas
async function sendWelcomeEmail(email: string, resetLink: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("⚠️ Credenciais SMTP não configuradas. E-mail simulado:");
      console.log("📧 Para:", email);
      console.log("📧 Assunto: Bem-vindo ao PlannerPro Organizer");
      console.log("📧 Link para definir senha:", resetLink);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com", // Usando Brevo (Sendinblue)
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER, // Seu usuário SMTP do Brevo
        pass: process.env.SMTP_PASS, // Sua senha SMTP do Brevo
      },
    });

    await transporter.sendMail({
      from: 'suporte@plannerpro.com', // Substitua pelo seu domínio
      to: email,
      subject: "Bem-vindo ao PlannerPro Organizer",
      text: `Olá,\n\nObrigado por se inscrever! Use o link abaixo para definir sua senha:\n\n${resetLink}\n\nSe você não realizou essa inscrição, por favor ignore este email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #4a6cf7; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Bem-vindo ao PlannerPro Organizer</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Olá,</p>
            <p>Obrigado por se inscrever para o PlannerPro Organizer! Estamos animados para ajudá-lo a organizar sua vida e aumentar sua produtividade.</p>
            <p>Para começar a usar sua conta, defina sua senha clicando no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Definir minha senha</a>
            </div>
            <p>Se o botão acima não funcionar, copie e cole o link abaixo em seu navegador:</p>
            <p style="word-break: break-all; font-size: 14px; color: #666;">${resetLink}</p>
            <p>Se você não realizou essa inscrição, por favor ignore este email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
              <p>Este é um email automático, por favor não responda.</p>
              <p>&copy; ${new Date().getFullYear()} PlannerPro Organizer. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ E-mail de boas-vindas enviado para:", email);
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
  }
}

async function createOrUpdateUser(email: string) {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log("✅ Criando usuário no banco de dados para:", email);
      
      // Criar usuário no banco de dados local
      const newUser = await storage.createUser({
        email,
        name: email.split('@')[0], // Nome provisório baseado no email
        password: 'senha_gerenciada_pelo_firebase', // Não usamos diretamente, pois o Firebase gerencia a autenticação
        firebaseUid: '' // Será atualizado quando o usuário fizer login com Firebase
      });
      console.log("✅ Usuário criado no banco de dados:", newUser.id);
      return newUser;
    } else {
      console.log("✅ Usuário já existe no sistema:", email);
      return user;
    }
  } catch (error) {
    console.error("❌ Erro ao criar/atualizar usuário:", error);
    throw error;
  }
}

async function createSubscription(session: any) {
  try {
    const userEmail = session.customer_email;
    const planMode = session.mode;
    const subscriptionId = session.subscription;
    const metadata = session.metadata || {};
    const planType = metadata.plan_type || (planMode === 'subscription' ? 'mensal' : 'vitalicio');

    if (userEmail) {
      const user = await storage.getUserByEmail(userEmail);
      if (user) {
        await storage.createSubscription(user.id, planType);
        console.log("✅ Assinatura criada/atualizada para o usuário:", user.email);
      }
    }
  } catch (error) {
    console.error("❌ Erro ao criar assinatura:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Webhook do Stripe para processar eventos de pagamento
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error("❌ Segredo do Webhook não configurado.");
      return res.status(400).send("Webhook não autorizado.");
    }

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ Webhook Recebido:", event.type);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const userEmail = session.customer_email;
        console.log("✅ Pagamento confirmado:", session);

        if (userEmail) {
          console.log("✅ Criando usuário no Firebase para:", userEmail);

          // Gerando uma senha segura automaticamente
          const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
          await createFirebaseUser(userEmail, tempPassword);
          
          // Criar usuário no banco de dados local
          const user = await createOrUpdateUser(userEmail);
          
          // Criar assinatura
          await createSubscription(session);

          // Envio de email com link de redefinição de senha
          const resetLink = await generatePasswordResetLink(userEmail);
          await sendWelcomeEmail(userEmail, resetLink);
        }
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("❌ Erro no webhook:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // Endpoint para obter informações do usuário atual
  app.get('/api/user/subscription', express.json(), async (req: Request, res: Response) => {
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
  
  // Endpoint para captura de leads
  app.post("/api/leads", express.json(), async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ 
          success: false, 
          message: "Nome e e-mail são obrigatórios." 
        });
      }

      // Adicionar o lead à lista do Brevo
      await addContactToBrevo(name, email);
      
      // Salvar o lead no banco de dados local
      await storage.createLead({
        name,
        email
      });

      console.log(`✅ Lead capturado com sucesso: ${name} (${email})`);
      
      return res.status(200).json({ 
        success: true, 
        message: "Lead capturado com sucesso!" 
      });
    } catch (error: any) {
      console.error("❌ Erro ao capturar lead:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Erro ao processar sua solicitação." 
      });
    }
  });

  // Endpoint para iniciar o processo de checkout
  app.post("/api/checkout", express.json(), async (req: Request, res: Response) => {
    try {
      console.log("Corpo da requisição recebido:", req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}