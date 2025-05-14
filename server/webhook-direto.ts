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

const stripe = new Stripe(stripeKey);

// Rota para processar webhook do Stripe - versão direta sem verificação
router.post('/api/webhook-direto', express.json(), async (req: Request, res: Response) => {
  console.log('✅ Webhook recebido em /api/webhook-direto:', JSON.stringify(req.body));
  
  try {
    // Verificar se é um evento de checkout concluído
    if (req.body && req.body.type === 'checkout.session.completed') {
      const session = req.body.data.object;
      const userEmail = session.customer_email;
      
      if (userEmail) {
        console.log(`✅ Processando checkout para ${userEmail}`);
        
        // Obter dados dos metadados
        const metadata = session.metadata || {};
        const userId = metadata.userId || metadata.user_id;
        const encodedPassword = metadata.senha;
        
        if (!userId) {
          console.error('❌ ID do usuário não encontrado nos metadados');
          return res.status(200).send("Evento recebido, mas ID do usuário não foi encontrado");
        }
        
        // Obter usuário do banco
        const dbUser = await storage.getUser(parseInt(userId));
        
        if (!dbUser) {
          console.error(`❌ Usuário não encontrado no banco: ${userId}`);
          return res.status(200).send("Evento recebido, mas usuário não encontrado no banco");
        }
        
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
        } catch (firebaseError: any) {
          // Se o usuário não existir no Firebase, criar um novo
          if (firebaseError.code === 'auth/user-not-found') {
            try {
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
              
              // Enviar email de boas-vindas
              try {
                const htmlContent = `
                  <h1>Bem-vindo ao PlannerPro Organizer!</h1>
                  <p>Olá,</p>
                  <p>Seu pagamento foi confirmado com sucesso e sua conta está pronta para uso.</p>
                  <p>Você pode acessar sua conta usando seu email e senha.</p>
                  <p>Atenciosamente,<br>Equipe PlannerPro</p>
                `;
                
                await sendTransactionalEmail(
                  userEmail,
                  "Bem-vindo ao PlannerPro - Sua conta está pronta!",
                  htmlContent,
                  "Seu pagamento foi confirmado e sua conta está pronta para uso."
                );
                
                console.log(`✅ Email de boas-vindas enviado para: ${userEmail}`);
              } catch (emailError) {
                console.error(`❌ Erro ao enviar email:`, emailError);
              }
              
              // Adicionar ao Brevo para marketing
              try {
                await addContactToBrevo(dbUser.name || userEmail.split('@')[0], userEmail);
                console.log(`✅ Contato adicionado ao Brevo`);
              } catch (brevoError) {
                console.error(`❌ Erro ao adicionar contato ao Brevo:`, brevoError);
              }
            } catch (createError) {
              console.error(`❌ ERRO AO CRIAR USUÁRIO NO FIREBASE:`, createError);
            }
          } else {
            console.error(`❌ Erro ao verificar usuário no Firebase:`, firebaseError);
          }
        }
      } else {
        console.error('❌ Email não encontrado na sessão de checkout');
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