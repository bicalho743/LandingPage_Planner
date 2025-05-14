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

// Rota para processar webhook do Stripe - versão simplificada focada em criar usuário
router.post('/api/webhook-fixuser', async (req: Request, res: Response) => {
  console.log('✅ Webhook recebido em /api/webhook-fixuser:', req.body ? 'payload recebido' : 'payload vazio');
  
  try {
    // Verificar se o req.body é uma string (raw)
    let event: any;
    if (req.body && typeof req.body === 'string') {
      event = JSON.parse(req.body);
    } else if (Buffer.isBuffer(req.body)) {
      event = JSON.parse(req.body.toString('utf8'));
    } else {
      // Já está em formato de objeto
      event = req.body;
    }
    
    console.log('✅ Tipo do evento:', event.type);
    
    // Verificar se é um evento de checkout concluído
    if (event && event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Detalhes da sessão (parcial):', JSON.stringify(session).substring(0, 500) + '...');
      
      // Obter email do usuário de várias formas possíveis
      const userEmail = session.customer_email || 
                       (session.customer_details ? session.customer_details.email : null) ||
                       (session.metadata ? session.metadata.email : null);
      
      if (!userEmail) {
        console.error('❌ Email não encontrado na sessão de checkout');
        return res.status(200).send("Email não encontrado na sessão");
      }
      
      console.log(`✅ Processando checkout para ${userEmail}`);
      
      // Passo 1: Verificar se usuário existe no Firebase
      try {
        const firebaseUser = await firebaseAuth.getUserByEmail(userEmail);
        console.log(`⚠️ Usuário já existe no Firebase: ${firebaseUser.uid}`);
        
        // Usuário já existe, vamos verificar no banco
        const dbUser = await storage.getUserByEmail(userEmail);
        
        if (dbUser) {
          console.log(`✅ Usuário encontrado no banco: ${dbUser.id}`);
          
          // Atualizar Firebase UID se necessário
          if (!dbUser.firebaseUid || dbUser.firebaseUid !== firebaseUser.uid) {
            await storage.updateFirebaseUid(dbUser.id, firebaseUser.uid);
            console.log(`✅ Firebase UID atualizado no banco: ${firebaseUser.uid}`);
          }
          
          // Atualizar status
          await storage.updateUserStatus(dbUser.id, undefined, 'ativo');
          console.log(`✅ Status do usuário atualizado para 'ativo'`);
        } else {
          console.log(`⚠️ Usuário existe no Firebase mas não no banco. Criando no banco...`);
          
          // Criar usuário no banco
          const newUser = await storage.createUser({
            email: userEmail,
            name: firebaseUser.displayName || userEmail.split('@')[0],
            status: 'ativo',
            firebaseUid: firebaseUser.uid
          });
          
          console.log(`✅ Usuário criado no banco: ${newUser.id}`);
        }
        
        return res.status(200).send("Usuário já existente processado");
      } catch (firebaseError: any) {
        // Usuário não existe no Firebase
        if (firebaseError.code === 'auth/user-not-found') {
          console.log(`🔄 Usuário não encontrado no Firebase, criando novo...`);
          
          // Passo 2: Buscar ou criar usuário no banco
          let dbUser = await storage.getUserByEmail(userEmail);
          
          if (!dbUser) {
            console.log(`⚠️ Usuário não encontrado no banco. Criando...`);
            
            // Criar usuário no banco
            dbUser = await storage.createUser({
              email: userEmail,
              name: userEmail.split('@')[0],
              status: 'pendente'
            });
            
            console.log(`✅ Usuário criado no banco: ${dbUser.id}`);
          }
          
          // Obter ou gerar senha
          const metadata = session.metadata || {};
          const encodedPassword = metadata.senha;
          
          let password;
          if (encodedPassword) {
            password = Buffer.from(encodedPassword, 'base64').toString('utf-8');
            console.log('✅ Senha recuperada dos metadados');
          } else if (dbUser.senha_hash) {
            password = dbUser.senha_hash;
            console.log('✅ Senha recuperada do banco de dados');
          } else {
            // Gerar senha aleatória
            password = Math.random().toString(36).slice(-10) + 
                      Math.random().toString(36).toUpperCase().slice(-2) + 
                      Math.floor(Math.random() * 10) + 
                      '!';
            console.log('⚠️ Senha não encontrada, gerando senha aleatória');
          }
          
          // Passo 3: Criar usuário no Firebase
          try {
            console.log(`🔄 INICIANDO CRIAÇÃO DE USUÁRIO NO FIREBASE: ${userEmail}`);
            const userRecord = await firebaseAuth.createUser({
              email: userEmail,
              password: password,
              displayName: dbUser.name || userEmail.split('@')[0],
              emailVerified: true // Importante para evitar problemas de login
            });
            
            console.log(`✅ USUÁRIO CRIADO NO FIREBASE COM SUCESSO: ${userRecord.uid}`);
            
            // Atualizar o usuário no banco
            await storage.updateFirebaseUid(dbUser.id, userRecord.uid);
            console.log(`✅ Firebase UID salvo no banco de dados: ${userRecord.uid}`);
            
            // Atualizar status para ativo
            await storage.updateUserStatus(dbUser.id, undefined, 'ativo');
            console.log(`✅ Status do usuário atualizado para 'ativo'`);
            
            // Enviar email de boas-vindas
            try {
              const htmlContent = `
                <h1>Bem-vindo ao PlannerPro Organizer!</h1>
                <p>Olá,</p>
                <p>Seu pagamento foi confirmado com sucesso e sua conta está pronta para uso.</p>
                <p>Você pode acessar sua conta usando seu email e a senha criada durante o cadastro.</p>
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
            
            return res.status(200).send(`Usuário ${userEmail} criado com sucesso no Firebase`);
          } catch (createError: any) {
            console.error(`❌ ERRO AO CRIAR USUÁRIO NO FIREBASE:`, createError);
            return res.status(500).send(`Erro ao criar usuário no Firebase: ${createError.message}`);
          }
        } else {
          console.error(`❌ Erro ao verificar usuário no Firebase:`, firebaseError);
          return res.status(500).send(`Erro ao verificar usuário: ${firebaseError.message}`);
        }
      }
    } else if (req.body && req.body.type) {
      console.log(`⚠️ Evento não tratado: ${req.body.type}`);
      return res.status(200).send(`Evento ${req.body.type} recebido, mas não processado`);
    } else {
      console.error('❌ Payload inválido');
      return res.status(400).send('Payload inválido');
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(500).send(`Erro interno: ${error.message}`);
  }
});

export default router;