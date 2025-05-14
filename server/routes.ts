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
    console.log("⏳ Preparando envio de email de boas-vindas para:", email);
    console.log("⏳ Verificando link de redefinição...");
    
    // Verificar se o link foi gerado corretamente
    if (!resetLink) {
      console.error("❌ Link de redefinição de senha vazio ou inválido!");
      return false;
    }
    
    // Verificar se temos credenciais SMTP configuradas
    console.log("⏳ Verificando credenciais SMTP...");
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("⚠️ Credenciais SMTP não configuradas. Modo de simulação de email:");
      console.log("📧 Para:", email);
      console.log("📧 Assunto: Bem-vindo ao PlannerPro Organizer");
      console.log("📧 Link gerado (primeiros 50 caracteres):", resetLink.substring(0, 50) + "...");
      return true; // Em desenvolvimento, consideramos sucesso
    }
    
    console.log("✅ Credenciais SMTP encontradas");
    console.log("⏳ Configurando transportador de email via Brevo...");

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.sendinblue.com", // Usando Brevo (Sendinblue)
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      console.log("✅ Transportador configurado");
      console.log("⏳ Enviando email...");

      // Preparar o conteúdo do email (HTML e texto)
      const emailHtml = `
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
      `;
      
      const emailText = `Olá,\n\nObrigado por se inscrever para o PlannerPro Organizer! Use o link abaixo para definir sua senha:\n\n${resetLink}\n\nSe você não realizou essa inscrição, por favor ignore este email.\n\n© ${new Date().getFullYear()} PlannerPro Organizer. Todos os direitos reservados.`;
      
      // Enviar o email
      const info = await transporter.sendMail({
        from: 'suporte@plannerpro.com',
        to: email,
        subject: "Bem-vindo ao PlannerPro Organizer - Configure sua senha",
        text: emailText,
        html: emailHtml,
      });
      
      console.log("✅ Email enviado com sucesso!");
      console.log("✅ ID da mensagem:", info.messageId);
      return true;
    } catch (smtpError: any) {
      console.error("❌ Erro ao enviar email via SMTP:", smtpError.message);
      
      // Em caso de erro, tentar utilizar a API do Brevo diretamente
      console.log("⏳ Tentando enviar via API do Brevo como fallback...");
      // Esta parte estaria implementada se tivéssemos configurado a API do Brevo
      console.log("⚠️ API do Brevo não implementada para fallback");
      
      throw smtpError; // Propagar o erro para ser tratado acima
    }
  } catch (error: any) {
    console.error("❌ Erro ao enviar e-mail:", error);
    console.error("❌ Detalhes do erro:", error.message);
    if (error.stack) {
      console.error("❌ Stack de erro:", error.stack);
    }
    return false;
  }
}

async function createOrUpdateUser(email: string, firebaseUid: string = '') {
  try {
    console.log("⏳ Verificando se o usuário já existe no banco de dados:", email);
    
    // Primeiro verificar se o usuário já existe por email
    let user;
    try {
      user = await storage.getUserByEmail(email);
      if (user) {
        console.log("✅ Usuário encontrado no banco de dados. ID:", user.id);
        
        // Se temos um novo UID do Firebase e o usuário ainda não tem um, atualizar
        if (firebaseUid && (!user.firebaseUid || user.firebaseUid !== firebaseUid)) {
          console.log("⏳ Atualizando UID do Firebase para usuário existente...");
          
          try {
            // Agora temos um método para atualizar o UID
            user = await storage.updateFirebaseUid(user.id, firebaseUid);
            console.log("✅ Firebase UID atualizado com sucesso para usuário:", user.id);
          } catch (updateError) {
            console.error("❌ Erro ao atualizar Firebase UID:", updateError);
            // Continuamos mesmo com erro na atualização
          }
        }
        
        return user;
      } else {
        console.log("⏳ Usuário não encontrado, prosseguindo com criação...");
      }
    } catch (dbLookupError) {
      console.error("⚠️ Erro ao buscar usuário existente:", dbLookupError);
      // Continua para criar um novo usuário
    }
    
    // Se chegou aqui, o usuário não existe e precisamos criar
    console.log("⏳ Criando novo usuário no banco de dados para:", email);
    
    try {
      // Criar usuário no banco de dados local com os dados que temos
      const newUser = await storage.createUser({
        email,
        name: email.split('@')[0], // Nome provisório baseado no email
        password: 'senha_gerenciada_pelo_firebase', // Não usamos diretamente, pois o Firebase gerencia a autenticação
        firebaseUid: firebaseUid // Pode estar disponível do processo de checkout
      });
      
      console.log("✅ Usuário criado com sucesso no banco de dados! ID:", newUser.id);
      
      // Verificar se precisamos atualizar o Firebase UID após a criação
      // (caso não tenhamos recebido o UID no momento da criação)
      if (!firebaseUid && newUser.id) {
        console.log("⚠️ Usuário criado sem Firebase UID. Será necessário atualizar posteriormente.");
      }
      
      return newUser;
    } catch (error: any) {
      console.error("❌ Erro ao criar novo usuário no banco:", error);
      if (error.message && typeof error.message === 'string' && error.message.includes('duplicate key')) {
        console.log("⚠️ Possível condição de corrida, tentando buscar usuário novamente...");
        const retryUser = await storage.getUserByEmail(email);
        if (retryUser) {
          console.log("✅ Usuário encontrado após retry. ID:", retryUser.id);
          
          // Se temos um Firebase UID, vamos tentar atualizar mesmo neste caso
          if (firebaseUid && (!retryUser.firebaseUid || retryUser.firebaseUid !== firebaseUid)) {
            try {
              const updatedUser = await storage.updateFirebaseUid(retryUser.id, firebaseUid);
              console.log("✅ Firebase UID atualizado após condição de corrida:", updatedUser.id);
              return updatedUser;
            } catch (updateError) {
              console.error("❌ Erro ao atualizar Firebase UID após retry:", updateError);
              // Retornamos o usuário existente mesmo sem atualizar o UID
            }
          }
          
          return retryUser;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Erro geral ao criar/atualizar usuário:", error);
    throw error;
  }
}

async function createSubscription(session: any) {
  try {
    console.log("⏳ Iniciando processo de criação de assinatura...");
    
    // Extrair dados relevantes da sessão
    const userEmail = session.customer_email;
    const planMode = session.mode;
    const subscriptionId = session.subscription;
    const metadata = session.metadata || {};
    
    console.log("📊 Dados da assinatura:");
    console.log("- Email do cliente:", userEmail || "Não disponível");
    console.log("- Modo do plano:", planMode || "Não especificado");
    console.log("- ID da assinatura:", subscriptionId || "Não disponível");
    console.log("- Metadados:", JSON.stringify(metadata));
    
    // Determinar o tipo de plano
    let planType = metadata.plan_type;
    if (!planType) {
      planType = (planMode === 'subscription') ? 'mensal' : 'vitalicio';
      console.log("⚠️ Tipo de plano não encontrado nos metadados, usando padrão:", planType);
    } else {
      console.log("✅ Tipo de plano dos metadados:", planType);
    }

    if (!userEmail) {
      console.error("❌ Email do usuário não disponível na sessão, não é possível criar assinatura");
      return;
    }
    
    // Buscar o usuário no banco de dados
    console.log("⏳ Buscando usuário para associar assinatura:", userEmail);
    try {
      const user = await storage.getUserByEmail(userEmail);
      
      if (user) {
        console.log("✅ Usuário encontrado no banco de dados. ID:", user.id);
        
        try {
          // Criar a assinatura
          console.log("⏳ Criando assinatura para o usuário:", user.id, "- Tipo:", planType);
          await storage.createSubscription(user.id, planType);
          console.log("✅ Assinatura criada com sucesso para:", user.email);
        } catch (subError) {
          console.error("❌ Erro ao criar assinatura no banco de dados:", subError);
          throw subError;
        }
      } else {
        console.error("❌ Usuário não encontrado no banco de dados:", userEmail);
        console.log("⚠️ Não foi possível criar assinatura pois o usuário não existe");
      }
    } catch (userLookupError) {
      console.error("❌ Erro ao buscar usuário para assinatura:", userLookupError);
      throw userLookupError;
    }
  } catch (error) {
    console.error("❌ Erro geral ao criar assinatura:", error);
    // Não lançamos o erro para não interromper o processamento do webhook
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Webhook do Stripe para processar eventos de pagamento
  // IMPORTANTE: O middleware express.raw() já está configurado no index.ts
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    console.log("🔔 Webhook do Stripe recebido");
    
    // Verificação do conteúdo da requisição
    if (!req.body || Buffer.isBuffer(req.body) === false) {
      console.error("❌ ERRO CRÍTICO: Corpo da requisição não é um Buffer! Middleware express.raw() não está funcionando corretamente.");
      console.log("Tipo do corpo recebido:", typeof req.body);
      console.log("É Buffer?", Buffer.isBuffer(req.body));
      return res.status(400).send("Formato de requisição inválido.");
    } else {
      console.log("✅ Corpo da requisição é um Buffer, tamanho:", req.body.length);
    }
    
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      console.error("❌ Header stripe-signature ausente na requisição");
      return res.status(400).send("Assinatura ausente.");
    }
    console.log("✅ Header stripe-signature recebido:", sig.substring(0, 20) + "...");
    
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      console.error("❌ Segredo do Webhook não configurado no ambiente.");
      return res.status(400).send("Webhook não configurado.");
    }
    console.log("✅ STRIPE_WEBHOOK_SECRET configurado");

    try {
      console.log("⏳ Validando assinatura do webhook...");
      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ Webhook validado com sucesso! Evento:", event.type);

      if (event.type === "checkout.session.completed") {
        console.log("💰 Evento de checkout.session.completed detectado!");
        const session = event.data.object as any;
        console.log("✅ ID da Sessão:", session.id);
        console.log("✅ Status da Sessão:", session.status);
        console.log("✅ Modo de pagamento:", session.mode);
        console.log("✅ Total pago:", (session.amount_total || 0) / 100, session.currency?.toUpperCase());
        console.log("✅ Cliente:", session.customer);
        console.log("✅ Email do cliente:", session.customer_email || "Não fornecido");

        console.log("⏳ Verificando metadados da sessão...");
        const metadata = session.metadata || {};
        console.log("✅ Metadados:", JSON.stringify(metadata));
        
        // Verificar se temos um email no objeto da sessão ou metadados
        let userEmail = session.customer_email;
        console.log("⏳ Verificando email do cliente...");
        
        if (!userEmail) {
          console.log("⚠️ Email não encontrado diretamente na sessão");
          // Se não tiver no customer_email, procurar nos metadados
          const emailFromMetadata = metadata.customer_email;
          
          if (emailFromMetadata) {
            console.log("✅ Email encontrado nos metadados:", emailFromMetadata);
            userEmail = emailFromMetadata;
          } else {
            console.error("❌ E-mail do usuário não capturado na sessão de checkout nem nos metadados!");
            console.log("⚠️ Enviando resposta de recebimento, mas sem processar usuário");
            // Se não encontrou o email, não prossegue com criação de conta
            return res.status(200).json({ received: true, status: "email_missing" });
          }
        } else {
          console.log("✅ Email encontrado diretamente na sessão:", userEmail);
        }
        
        // Verificar se parece ser um email válido
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
          console.error("❌ O email capturado não parece válido:", userEmail);
        }

        try {
          console.log("✅ Iniciando processo de criação do usuário...");
          
          // Gerando uma senha segura automaticamente
          const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
          
          // Variável para armazenar o UID do Firebase
          let firebaseUid = '';
          
          try {
            const firebaseUser = await createFirebaseUser(userEmail, tempPassword);
            console.log("✅ Usuário criado/recuperado no Firebase:", firebaseUser.uid);
            firebaseUid = firebaseUser.uid;
          } catch (firebaseError) {
            console.error("❌ Erro ao criar usuário no Firebase:", firebaseError);
            // Não interrompe o fluxo pois pode ser que o usuário já exista no Firebase
          }
          
          try {
            // Criar usuário no banco de dados local, passando o UID do Firebase se disponível
            const user = await createOrUpdateUser(userEmail, firebaseUid);
            console.log("✅ Usuário criado/atualizado no PostgreSQL:", user);
            
            // Criar assinatura
            try {
              await createSubscription(session);
              console.log("✅ Assinatura criada com sucesso para o plano:", session.mode);
            } catch (subscriptionError) {
              console.error("❌ Erro ao criar assinatura:", subscriptionError);
            }
          } catch (dbError) {
            console.error("❌ Erro ao criar usuário no PostgreSQL:", dbError);
          }

          try {
            // Envio de email com link de redefinição de senha
            const resetLink = await generatePasswordResetLink(userEmail);
            console.log("✅ Link de redefinição de senha gerado:", resetLink.substring(0, 50) + "...");
            
            await sendWelcomeEmail(userEmail, resetLink);
            console.log("✅ Email de boas-vindas enviado para:", userEmail);
          } catch (emailError) {
            console.error("❌ Erro ao gerar link/enviar email:", emailError);
          }
          
          console.log("✅ Processamento do usuário concluído para:", userEmail);
        } catch (error) {
          console.error("❌ Erro geral ao processar novo usuário:", error);
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
  
  // Endpoint para captura de leads - Otimizado para ser não-bloqueante
  app.post("/api/leads", express.json(), async (req: Request, res: Response) => {
    const { name, email } = req.body;

    // Validação básica rápida
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Nome e e-mail são obrigatórios." 
      });
    }

    // Verificação rápida de formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de e-mail inválido."
      });
    }

    // Retorna resposta imediatamente para não bloquear o cliente
    res.status(200).json({ 
      success: true, 
      message: "Lead recebido com sucesso!" 
    });

    // Processa o lead em background
    (async () => {
      try {
        // Primeiro tentamos adicionar ao Brevo, que é mais rápido e confiável
        try {
          await addContactToBrevo(name, email);
          console.log(`✅ Lead adicionado ao Brevo: ${email}`);
        } catch (brevoError) {
          console.error("❌ Erro ao adicionar lead ao Brevo:", brevoError);
          // Continua mesmo com erro no Brevo
        }
        
        // Depois tentamos salvar no banco de dados com timeout
        try {
          // Criamos uma promise com timeout para evitar bloqueio
          const dbPromise = storage.createLead({ name, email });
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout ao salvar lead no banco")), 5000)
          );
          
          await Promise.race([dbPromise, timeoutPromise]);
          console.log(`✅ Lead salvo no banco de dados: ${email}`);
        } catch (dbError: any) {
          // Verificar se é erro de duplicação de chave (lead já existe)
          if (dbError.code === '23505' || 
              (dbError.detail && dbError.detail.includes('already exists')) ||
              (dbError.message && dbError.message.includes('duplicate key'))) {
            console.log(`⚠️ Lead já existe no banco de dados: ${email}`);
            // Este não é realmente um erro, já temos o lead capturado
          } else {
            console.error("❌ Erro ao salvar lead no banco de dados:", dbError);
            // Já temos o lead no Brevo, então não é crítico se falhar no banco
          }
        }
        
        console.log(`✅ Processamento de lead concluído: ${name} (${email})`);
      } catch (error) {
        console.error("❌ Erro geral ao processar lead em background:", error);
      }
    })().catch(error => {
      console.error("❌ Erro não tratado no processamento de lead:", error);
    });
  });

  // Endpoint para iniciar o processo de checkout - Otimizado para performance
  app.post("/api/checkout", express.json(), async (req: Request, res: Response) => {
    try {
      console.log("⏳ Iniciando processo de checkout...");
      console.log("📝 Dados recebidos:", req.body);
      
      const { plan, email } = req.body;
      const startTime = Date.now();
      
      // Validação rápida dos parâmetros
      if (!plan || !['mensal', 'anual', 'vitalicio'].includes(plan)) {
        console.log("❌ Plano inválido:", plan);
        return res.status(400).json({ 
          success: false, 
          message: "Plano inválido ou não especificado." 
        });
      }

      if (!email) {
        console.log("❌ Email não especificado");
        return res.status(400).json({
          success: false,
          message: "E-mail não especificado."
        });
      }

      // Verificar se é um e-mail válido
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log("❌ Email inválido:", email);
        return res.status(400).json({
          success: false,
          message: "E-mail inválido."
        });
      }

      // Obter o ID do preço Stripe para o plano
      console.log("⏳ Obtendo ID do preço para o plano:", plan);
      const priceId = getPriceId(plan);
      
      if (!priceId) {
        console.error(`❌ ID de preço não encontrado para o plano: ${plan}`);
        return res.status(500).json({
          success: false,
          message: "Erro na configuração do plano. Por favor, contate o suporte."
        });
      }
      console.log("✅ ID do preço obtido:", priceId);

      // Adicionar o e-mail à lista do Brevo em background
      // Não esperamos isso terminar para não bloquear o checkout
      (async () => {
        try {
          await addContactToBrevo("Cliente potencial", email);
          console.log(`✅ Email adicionado ao Brevo antes do checkout: ${email}`);
        } catch (error) {
          console.error("❌ Erro ao adicionar e-mail ao Brevo:", error);
        }
      })();

      // Configurando o modo de pagamento com base no tipo de plano
      const mode = plan === 'vitalicio' ? 'payment' : 'subscription';
      console.log("📊 Modo de pagamento:", mode);
      
      // Montando URLs de sucesso e cancelamento
      const successUrl = `${req.protocol}://${req.headers.host}/sucesso?plan=${plan}&email=${encodeURIComponent(email)}`;
      const cancelUrl = `${req.protocol}://${req.headers.host}/cancelado`;
      
      console.log("⏳ Criando sessão de checkout no Stripe...");
      
      // Criando a sessão de checkout com um timeout para evitar bloqueios longos
      const sessionPromise = stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email, // Garantindo que o e-mail é capturado
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        subscription_data: mode === 'subscription' ? {
          trial_period_days: 7, // Período de teste gratuito para planos de assinatura
        } : undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan_type: plan,
          customer_email: email
        }
      });
      
      // Adicionamos um timeout para não bloquear o servidor por muito tempo
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout ao criar sessão de checkout")), 10000);
      });
      
      const session = await Promise.race([sessionPromise, timeoutPromise]) as Stripe.Checkout.Session;
      
      console.log("✅ Sessão de checkout criada com sucesso!");
      console.log("⏱️ Tempo total:", Date.now() - startTime, "ms");
      
      // Verificação de segurança
      if (!session.url) {
        console.error("❌ URL de checkout não gerada pelo Stripe");
        return res.status(500).json({
          success: false,
          message: "Erro ao gerar URL de checkout. Tente novamente."
        });
      }
      
      console.log("🔗 URL de checkout:", session.url);
      
      // Retornar a URL de checkout para o cliente
      res.json({
        success: true,
        url: session.url
      });
    } catch (error: any) {
      console.error("❌ Erro ao criar sessão de checkout:", error);
      
      // Mensagem de erro mais amigável
      let errorMessage = "Falha ao processar o checkout. Tente novamente.";
      
      if (error.type && error.type.startsWith('Stripe')) {
        console.error("❌ Erro do Stripe:", error.type);
        
        // Erros específicos do Stripe para mensagens mais úteis
        if (error.type === 'StripeCardError') {
          errorMessage = "Erro no processamento do cartão. Verifique os dados e tente novamente.";
        } else if (error.type === 'StripeRateLimitError') {
          errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
        }
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}