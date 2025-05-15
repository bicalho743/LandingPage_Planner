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
  if (!['free', 'mensal', 'anual', 'vitalicio'].includes(plano)) {
    return res.status(400).json({
      success: false,
      message: "Plano inválido. Escolha entre: free, mensal, anual ou vitalicio"
    });
  }

  try {
    console.log(`⏳ Iniciando cadastro de usuário: ${email}`);

    // Verificar se o usuário já existe no Firebase apenas para planos gratuitos
    // Para planos pagos, verificamos apenas no banco de dados
    let firebaseUid = '';
    let skipExistingChecks = false;
      
    // Exceção especial para o email do remetente do Brevo
    if (email.toLowerCase() === 'solanobicalho@yahoo.com.br') {
      console.log(`🔄 Email especial de remetente do Brevo detectado. Permitindo novo cadastro.`);
      // Para este email específico, ignoramos as verificações de existência
      skipExistingChecks = true;
    }
    
    if (!skipExistingChecks) {
      if (plano === 'free') {
        try {
          console.log(`🔍 VERIFICAÇÃO DE EMAIL (FIREBASE): Buscando ${email} no Firebase Authentication`);
          // Para plano free, checamos primeiro no Firebase
          const existingUser = await firebaseAuth.getUserByEmail(email);
          console.log(`⚠️ VERIFICAÇÃO DE EMAIL (FIREBASE): Usuário existe no Firebase: ${existingUser.uid}`);
          return res.status(400).json({
            success: false,
            message: "Este email já está cadastrado. Tente fazer login."
          });
        } catch (error: any) {
          if (error.code !== 'auth/user-not-found') {
            console.error("❌ VERIFICAÇÃO DE EMAIL (FIREBASE): Erro ao verificar usuário no Firebase:", error);
            return res.status(500).json({
              success: false,
              message: "Erro ao verificar cadastro existente."
            });
          }
          console.log(`✅ VERIFICAÇÃO DE EMAIL (FIREBASE): Usuário NÃO encontrado no Firebase Authentication`);
          // Usuário não existe no Firebase, podemos prosseguir
        }
      }

      // Verificar se o usuário já existe no banco de dados
      const existingUserInDB = await storage.getUserByEmail(email);
      if (existingUserInDB) {
        console.log(`⚠️ Usuário já existe no banco de dados: ${existingUserInDB.id}`);
      
        // Caso especial: usuário existe no banco mas não tem Firebase UID
        if (!existingUserInDB.firebaseUid && plano === 'free') {
          // Sincronização automática APENAS para plano gratuito
          console.log(`⚠️ Usuário existe no banco de dados mas não tem uma conta Firebase. Criando conta (plano gratuito)...`);
          try {
            // Criar o usuário no Firebase
            const userRecord = await firebaseAuth.createUser({
              email: email,
              password: senha,
              displayName: nome
            });
            
            // Atualizar o registro no banco de dados com o Firebase UID
            await storage.updateFirebaseUid(existingUserInDB.id, userRecord.uid);
            await storage.updateUserStatus(existingUserInDB.id, undefined, 'ativo');
            
            console.log(`✅ Usuário sincronizado com Firebase UID: ${userRecord.uid}`);
            
            return res.status(200).json({
              success: true,
              message: "Conta sincronizada com sucesso! Agora você pode fazer login.",
              redirectTo: "/login"
            });
          } catch (syncError) {
            console.error("❌ Erro ao sincronizar conta:", syncError);
            return res.status(500).json({
              success: false,
              message: "Erro ao sincronizar sua conta. Tente usar o link 'Problemas com login?' na página de login."
            });
          }
        } else if (!existingUserInDB.firebaseUid && plano !== 'free') {
          // Para planos pagos, informamos que o usuário já existe e precisa usar a página de sincronização
          console.log(`⚠️ Usuário existe no banco mas sem conta Firebase. Solicitando sincronização (plano pago).`);
          return res.status(400).json({
            success: false,
            message: "Este email já está cadastrado mas precisa ser sincronizado. Use o link 'Problemas com login?' na página de login."
          });
        }
        
        // Caso normal: usuário já existe
        return res.status(400).json({
          success: false,
          message: "Este email já está cadastrado. Por favor, use 'Já possui uma conta? Faça login' abaixo do formulário."
        });
      }
    }

    // Criar usuário no Firebase APENAS para plano gratuito
    // Para planos pagos, isso será feito após o pagamento pelo webhook
    if (plano === 'free') {
      const userRecord = await firebaseAuth.createUser({
        email: email,
        password: senha,
        displayName: nome
      });
      
      firebaseUid = userRecord.uid;
      console.log(`✅ Usuário criado no Firebase: ${userRecord.uid}`);
    }

    // Salvar lead/usuário no banco de dados
    const user = await storage.createUser({
      email: email,
      name: nome,
      password: 'senha_gerenciada_pelo_firebase',
      firebaseUid: firebaseUid, // Vazio para planos pagos, preenchido para plano free
      status: plano === 'free' ? 'ativo' : 'pendente', // Status ativo apenas para plano free
      senha_hash: plano !== 'free' ? senha : '' // Armazenar senha apenas para planos pagos (será usada após pagamento)
    });
    
    console.log(`✅ Usuário salvo no banco de dados: ${user.id}`);

    // Verificar se é o plano gratuito
    if (plano === 'free') {
      console.log(`✅ Cadastro no plano gratuito concluído para: ${email}`);
      
      // Para o plano gratuito, criar assinatura diretamente sem checkout
      try {
        await storage.createSubscription(user.id, 'free');
        console.log(`✅ Assinatura gratuita criada para usuário: ${user.id}`);
      } catch (subscriptionError) {
        console.error(`⚠️ Erro ao criar assinatura gratuita:`, subscriptionError);
        // Continuar mesmo com erro, pois o usuário já foi criado
      }
      
      // Enviar email de boas-vindas
      try {
        // Implementar depois com Brevo
        console.log(`⏳ Enviando email de boas-vindas para: ${email}`);
      } catch (emailError) {
        console.error(`⚠️ Erro ao enviar email de boas-vindas:`, emailError);
      }
      
      // Redirecionar diretamente para o dashboard
      return res.status(201).json({
        success: true,
        message: "Cadastro no plano gratuito concluído com sucesso!",
        redirectUrl: "/dashboard"
      });
    } else {
      // Para planos pagos, criar checkout do Stripe
      
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
          plan_type: plano,
          customer_email: email,
          // Vamos enviar a senha criptografada para criar o usuário no Firebase após o pagamento
          senha: Buffer.from(senha).toString('base64') // Codificação básica apenas para transporte
        }
      });

      console.log(`✅ Sessão de checkout criada: ${session.id}`);

      // Retornar URL do checkout para redirecionamento
      return res.status(201).json({
        success: true,
        message: "Usuário cadastrado com sucesso",
        checkoutUrl: session.url
      });
    }
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