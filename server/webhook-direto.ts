import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { firebaseAuth } from './firebase';
import { addContactToBrevo, sendTransactionalEmail } from './brevo';

const router = express.Router();

// Inicializando o Stripe
const stripeKey = process.env.NODE_ENV === 'production'
  ? process.env.STRIPE_SECRET_KEY
  : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurado');
}

// Defina a webhook secret (específica para este endpoint)
// whsec_jdOvfRuggg7gR2vCyZebZ2LEoEQ0Ig57
const webhookDiretoSecret = 'whsec_jdOvfRuggg7gR2vCyZebZ2LEoEQ0Ig57';

const stripe = new Stripe(stripeKey);

// Função auxiliar para processar usuário do Firebase
async function processFirebaseUser(dbUser: any, userEmail: string, encodedPassword: string | undefined) {
  console.log(`⏳ Processando usuário do Firebase para: ${userEmail}`);
  
  // Decodificar senha se disponível
  let password;
  if (encodedPassword) {
    password = Buffer.from(encodedPassword, 'base64').toString('utf-8');
  } else if (dbUser.senha_hash) {
    password = dbUser.senha_hash;
  } else {
    // Gerar senha aleatória como último recurso
    password = Math.random().toString(36).slice(-10) + 
              Math.random().toString(36).toUpperCase().slice(-2) + 
              Math.floor(Math.random() * 10) + 
              '!';
  }
  
  // Verificar se o usuário já existe no Firebase
  try {
    const userRecord = await firebaseAuth.getUserByEmail(userEmail);
    console.log(`⚠️ Usuário já existe no Firebase: ${userRecord.uid}`);
    
    // Atualizar o usuário no banco se necessário
    if (!dbUser.firebaseUid || dbUser.firebaseUid !== userRecord.uid) {
      await storage.updateFirebaseUid(dbUser.id, userRecord.uid);
      console.log(`✅ Firebase UID atualizado no banco de dados`);
    }
    
    // Atualizar status para ativo
    await storage.updateUserStatus(dbUser.id, undefined, 'ativo');
    console.log(`✅ Status do usuário atualizado para 'ativo'`);
    
    return true;
  } catch (firebaseError: any) {
    // Se o usuário não existir no Firebase, criar um novo
    if (firebaseError.code === 'auth/user-not-found') {
      try {
        // Criar o usuário no Firebase com força
        console.log('🔄 Criando NOVO usuário no Firebase com força...');
        
        // Criar o usuário no Firebase
        const userRecord = await firebaseAuth.createUser({
          email: userEmail,
          password: password,
          displayName: dbUser.name || userEmail.split('@')[0]
        });
        
        console.log(`✅ USUÁRIO CRIADO NO FIREBASE: ${userRecord.uid}`);
        
        // Atualizar o usuário no banco
        await storage.updateFirebaseUid(dbUser.id, userRecord.uid);
        console.log(`✅ Firebase UID salvo no banco de dados`);
        
        // Atualizar status para ativo
        await storage.updateUserStatus(dbUser.id, undefined, 'ativo');
        console.log(`✅ Status do usuário atualizado para 'ativo'`);
              
        // Não enviar email daqui para evitar duplicação
        // O email oficial de boas-vindas será enviado pelo webhook principal em stripe-webhook.ts
        console.log(`ℹ️ Email de boas-vindas não será enviado a partir deste endpoint`);
        console.log(`ℹ️ O email será enviado pelo endpoint principal /api/stripe-webhook`);
        
        // Adicionar ao Brevo para marketing
        try {
          await addContactToBrevo(dbUser.name || userEmail.split('@')[0], userEmail);
          console.log(`✅ Contato adicionado ao Brevo`);
        } catch (brevoError) {
          console.error(`❌ Erro ao adicionar contato ao Brevo:`, brevoError);
        }
        
        return true;
      } catch (createError) {
        console.error(`❌ ERRO AO CRIAR USUÁRIO NO FIREBASE:`, createError);
        return false;
      }
    } else {
      console.error(`❌ Erro ao verificar usuário no Firebase:`, firebaseError);
      return false;
    }
  }
}

// Rota para processar webhook do Stripe - com verificação de assinatura
router.post('/api/webhook-direto', async (req: Request, res: Response) => {
  console.log('🔔 Webhook recebido em /api/webhook-direto');
  
  let event;
  const sig = req.headers['stripe-signature'];
  
  // Verificar se o corpo da requisição é um Buffer
  if (!req.body || Buffer.isBuffer(req.body) === false) {
    console.error("❌ ERRO CRÍTICO: Corpo da requisição não é um Buffer! Middleware express.raw() não está funcionando corretamente.");
    console.log("Tipo do corpo recebido:", typeof req.body);
    console.log("É Buffer?", Buffer.isBuffer(req.body));
    return res.status(400).send("Formato de requisição inválido");
  }

  // Verificar se a assinatura está presente
  if (!sig) {
    console.error("❌ Assinatura do Stripe ausente no cabeçalho");
    return res.status(400).send("Assinatura ausente");
  }

  try {
    // Verificar a assinatura usando webhookDiretoSecret
    event = stripe.webhooks.constructEvent(req.body, sig, webhookDiretoSecret);
    console.log(`✅ Assinatura do webhook verificada com sucesso: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Erro ao verificar assinatura do webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    // Verificar se é um evento de checkout concluído
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Detalhes da sessão (parcial):', JSON.stringify(session).substring(0, 500) + '...');
      
      // Obter email do usuário de várias formas possíveis
      const userEmail = session.customer_email || 
                       (session.customer_details ? session.customer_details.email : null) ||
                       (session.metadata ? session.metadata.email : null);
      
      if (userEmail) {
        console.log(`✅ Processando checkout para ${userEmail}`);
        
        // Obter dados dos metadados
        const metadata = session.metadata || {};
        const userId = metadata.userId || metadata.user_id;
        const encodedPassword = metadata.senha;
        
        // Se não houver userId nos metadados, tentamos buscar pelo email
        if (!userId) {
          console.log('⚠️ ID do usuário não encontrado nos metadados, buscando pelo email...');
          const dbUserByEmail = await storage.getUserByEmail(userEmail);
          
          if (dbUserByEmail) {
            console.log(`✅ Usuário encontrado pelo email: ${dbUserByEmail.id}`);
            // Continue o processamento com esse usuário
            await processFirebaseUser(dbUserByEmail, userEmail, encodedPassword);
            
            // Criar registro na tabela de assinaturas se for um checkout de assinatura
            if (session.mode === 'subscription' && session.subscription) {
              try {
                console.log(`⏳ Criando registro de assinatura para usuário encontrado pelo email ${dbUserByEmail.id} - Assinatura: ${session.subscription}`);
                
                // Determinar o tipo de plano com base no preço
                let planType = 'monthly'; // valor padrão
                if (session.metadata && session.metadata.planType) {
                  planType = session.metadata.planType;
                } else if (session.amount_total) {
                  // Lógica baseada no valor (aproximada)
                  if (session.amount_total >= 10000) {
                    planType = 'lifetime';
                  } else if (session.amount_total >= 1000) {
                    planType = 'annual';
                  }
                }
                
                // Criar o registro de assinatura
                await storage.createSubscription(dbUserByEmail.id, planType);
                console.log(`✅ Registro de assinatura criado com sucesso para usuário encontrado pelo email: ${userEmail}`);
                
                // Atualizar datas de trial se necessário
                try {
                  await storage.updateUserTrialDates(dbUserByEmail.id);
                  console.log(`✅ Datas de trial atualizadas para usuário encontrado pelo email: ${dbUserByEmail.id}`);
                } catch (trialDatesError) {
                  console.error(`❌ Erro ao atualizar datas de trial:`, trialDatesError);
                }
              } catch (subscriptionError) {
                console.error(`❌ Erro ao criar registro de assinatura:`, subscriptionError);
              }
            }
            
            return res.status(200).send("Evento processado com sucesso");
          } else {
            console.error(`❌ Usuário não encontrado pelo email: ${userEmail}`);
            
            // Tente criar um novo usuário
            console.log(`⚠️ Tentando criar novo usuário para: ${userEmail}`);
            try {
              const newUser = await storage.createUser({
                email: userEmail,
                name: userEmail.split('@')[0],
                status: 'pendente'
              });
              
              console.log(`✅ Novo usuário criado: ${newUser.id}`);
              await processFirebaseUser(newUser, userEmail, encodedPassword);
              
              // Criar registro na tabela de assinaturas se for um checkout de assinatura
              if (session.mode === 'subscription' && session.subscription) {
                try {
                  console.log(`⏳ Criando registro de assinatura para novo usuário ${newUser.id} - Assinatura: ${session.subscription}`);
                  
                  // Determinar o tipo de plano com base no preço
                  let planType = 'monthly'; // valor padrão
                  if (session.metadata && session.metadata.planType) {
                    planType = session.metadata.planType;
                  } else if (session.amount_total) {
                    // Lógica baseada no valor (aproximada)
                    if (session.amount_total >= 10000) {
                      planType = 'lifetime';
                    } else if (session.amount_total >= 1000) {
                      planType = 'annual';
                    }
                  }
                  
                  // Criar o registro de assinatura
                  await storage.createSubscription(newUser.id, planType);
                  console.log(`✅ Registro de assinatura criado com sucesso para novo usuário: ${userEmail}`);
                  
                  // Atualizar datas de trial se necessário
                  try {
                    await storage.updateUserTrialDates(newUser.id);
                    console.log(`✅ Datas de trial atualizadas para novo usuário: ${newUser.id}`);
                  } catch (trialDatesError) {
                    console.error(`❌ Erro ao atualizar datas de trial para novo usuário:`, trialDatesError);
                  }
                } catch (subscriptionError) {
                  console.error(`❌ Erro ao criar registro de assinatura para novo usuário:`, subscriptionError);
                }
              }
              
              return res.status(200).send("Novo usuário criado e processado com sucesso");
            } catch (createError) {
              console.error(`❌ Erro ao criar novo usuário:`, createError);
              return res.status(200).send("Erro ao criar novo usuário");
            }
          }
        }
        
        // Obter usuário do banco pelo ID
        const dbUser = await storage.getUser(parseInt(userId));
        
        if (!dbUser) {
          console.error(`❌ Usuário não encontrado no banco: ${userId}`);
          return res.status(200).send("Evento recebido, mas usuário não encontrado no banco");
        }
        
        // Processar o usuário do Firebase
        await processFirebaseUser(dbUser, userEmail, encodedPassword);
        
        // Criar registro na tabela de assinaturas se for um checkout de assinatura
        if (session.mode === 'subscription' && session.subscription) {
          try {
            console.log(`⏳ Criando registro de assinatura para usuário ${dbUser.id} - Assinatura: ${session.subscription}`);
            
            // Determinar o tipo de plano com base no preço
            let planType = 'monthly'; // valor padrão
            if (session.metadata && session.metadata.planType) {
              planType = session.metadata.planType;
            } else if (session.amount_total) {
              // Lógica baseada no valor (aproximada)
              if (session.amount_total >= 10000) {
                planType = 'lifetime';
              } else if (session.amount_total >= 1000) {
                planType = 'annual';
              }
            }
            
            // Criar o registro de assinatura
            await storage.createSubscription(dbUser.id, planType);
            console.log(`✅ Registro de assinatura criado com sucesso para: ${userEmail}`);
            
            // Atualizar datas de trial se necessário
            try {
              await storage.updateUserTrialDates(dbUser.id);
              console.log(`✅ Datas de trial atualizadas para usuário com nova assinatura: ${dbUser.id}`);
            } catch (trialDatesError) {
              console.error(`❌ Erro ao atualizar datas de trial para nova assinatura:`, trialDatesError);
            }
          } catch (subscriptionError) {
            console.error(`❌ Erro ao criar registro de assinatura:`, subscriptionError);
          }
        }
      } else {
        console.error('❌ Email não encontrado na sessão de checkout');
        return res.status(200).send("Email não encontrado na sessão");
      }
    }
    
    // Responder com sucesso para o Stripe
    return res.status(200).send('Evento processado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    // Ainda retornamos 200 para o Stripe não reenviar o evento
    return res.status(200).send('Evento recebido com erros no processamento');
  }
});

export default router;