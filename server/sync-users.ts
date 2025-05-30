import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { firebaseAuth, createFirebaseUser } from './firebase';
import { generatePasswordResetLink } from './firebase';
import { addContactToBrevo } from './brevo';

const router = Router();

// Debug function - Lista todas as tentativas de sincronização
const syncAttempts = new Map<string, {count: number, lastError: string, lastAttempt: Date}>();

function logSyncAttempt(email: string, error: string = '') {
  const now = new Date();
  const existing = syncAttempts.get(email) || {count: 0, lastError: '', lastAttempt: now};
  
  existing.count++;
  if (error) existing.lastError = error;
  existing.lastAttempt = now;
  
  syncAttempts.set(email, existing);
  
  console.log(`📊 Histórico de sincronização para ${email}: ${existing.count} tentativas, último erro: ${existing.lastError || 'nenhum'}`);
}

// Endpoint admin para listar usuários com status
router.get('/api/admin/users', async (req: Request, res: Response) => {
  try {
    // Buscar todos os usuários do banco de dados
    const users = await storage.getUsers();
    
    // Adicionar informações sobre tentativas de sincronização
    const syncInfo = Object.fromEntries(syncAttempts.entries());
    
    res.status(200).json({ 
      users, 
      syncAttempts: syncInfo,
      totalUsers: users.length,
      syncedUsers: users.filter(u => u.firebaseUid).length,
      pendingUsers: users.filter(u => !u.firebaseUid).length
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para sincronizar usuário com Firebase
router.post('/api/sync-user', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email não fornecido' 
    });
  }
  
  console.log(`⏳ Iniciando sincronização de usuário: ${email}`);
  logSyncAttempt(email);
  
  try {
    // 1. Verificar se o usuário existe no banco de dados
    const dbUser = await storage.getUserByEmail(email);
    if (!dbUser) {
      const errorMsg = 'Usuário não encontrado no banco de dados';
      logSyncAttempt(email, errorMsg);
      return res.status(404).json({ 
        success: false, 
        message: errorMsg
      });
    }
    
    console.log(`✅ Usuário encontrado no banco de dados: ${dbUser.id}`);
    
    // 2. Verificar se já existe no Firebase
    let userExists = false;
    try {
      const firebaseUser = await firebaseAuth.getUserByEmail(email);
      console.log(`✅ Usuário já existe no Firebase: ${firebaseUser.uid}`);
      
      // Se o usuário existe no Firebase, mas não temos o UID salvo, atualizamos
      if (!dbUser.firebaseUid) {
        await storage.updateFirebaseUid(dbUser.id, firebaseUser.uid);
        console.log(`✅ UID do Firebase atualizado no banco de dados`);
      }
      
      // Atualizar status do usuário se estiver pendente
      if (dbUser.status === 'pendente') {
        await storage.updateUserStatus(dbUser.id, undefined, 'ativo');
        console.log(`✅ Status do usuário atualizado para ativo`);
      }
      
      userExists = true;
      
      // Apenas retornar um link de redefinição de senha
      try {
        const resetLink = await generatePasswordResetLink(email);
        console.log(`✅ Link de redefinição de senha gerado: ${resetLink.substring(0, 50)}...`);
        
        return res.status(200).json({
          success: true,
          message: 'Usuário já existe no Firebase, enviando link de redefinição de senha',
          resetLink,
          existingUser: true
        });
      } catch (resetError: any) {
        const errorMsg = `Erro ao gerar link de redefinição: ${resetError.message}`;
        logSyncAttempt(email, errorMsg);
        console.error('❌ ' + errorMsg, resetError);
        
        return res.status(200).json({
          success: true,
          message: 'Usuário já existe no Firebase, mas houve um erro ao gerar link de redefinição',
          existingUser: true
        });
      }
    } catch (firebaseError: any) {
      if (firebaseError.code !== 'auth/user-not-found') {
        const errorMsg = `Erro ao verificar usuário no Firebase: ${firebaseError.code} - ${firebaseError.message}`;
        logSyncAttempt(email, errorMsg);
        console.error('❌ ' + errorMsg);
        
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao verificar usuário no Firebase' 
        });
      }
      
      console.log('⚠️ Usuário não existe no Firebase, criando...');
    }
    
    // 3. Se não existe no Firebase, mas existe no banco, criar no Firebase
    if (!userExists) {
      try {
        // Verificar se temos senha para o usuário
        const senha = password || dbUser.senha_hash || 'Senha@123456';
        
        // Mostrar a senha que estamos usando (apenas em debug)
        console.log(`⏳ Criando usuário no Firebase com email: ${email} e senha: ${senha.substring(0, 3)}*** (truncada por segurança)`);
        
        // Criar usuário no Firebase
        const userRecord = await createFirebaseUser(email, senha);
        console.log(`✅ Usuário criado no Firebase com sucesso, UID: ${userRecord.uid}`);
        
        // Atualizar o UID do Firebase no banco de dados
        const updatedUser = await storage.updateFirebaseUid(dbUser.id, userRecord.uid);
        console.log(`✅ UID do Firebase salvo no banco de dados: ${updatedUser.id} -> ${userRecord.uid}`);
        
        console.log(`✅ Usuário criado no Firebase e sincronizado: ${userRecord.uid}`);
        
        // Se usuário estava pendente, ativar
        if (updatedUser.status === 'pendente') {
          await storage.updateUserStatus(updatedUser.id, undefined, 'ativo');
          console.log(`✅ Status do usuário atualizado para ativo`);
        }
        
        // Usuário foi restaurado com sucesso, enviar link de redefinição por segurança
        try {
          const resetLink = await generatePasswordResetLink(email);
          console.log(`✅ Link de redefinição de senha gerado: ${resetLink.substring(0, 50)}...`);
          
          return res.status(200).json({
            success: true,
            message: 'Usuário restaurado no Firebase com sucesso',
            resetLink,
            newUser: true
          });
        } catch (resetError: any) {
          const errorMsg = `Erro ao gerar link de redefinição: ${resetError.message}`;
          logSyncAttempt(email, errorMsg);
          console.error('❌ ' + errorMsg, resetError);
          
          return res.status(200).json({
            success: true,
            message: 'Usuário restaurado no Firebase, mas houve um erro ao gerar link de redefinição',
            newUser: true
          });
        }
      } catch (createError: any) {
        const errorMsg = `Erro ao criar usuário no Firebase: ${createError.code} - ${createError.message}`;
        logSyncAttempt(email, errorMsg);
        console.error('❌ ' + errorMsg);
        
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao criar usuário no Firebase: ' + createError.message 
        });
      }
    }
    
  } catch (error: any) {
    const errorMsg = `Erro interno ao sincronizar usuário: ${error.message || 'Erro desconhecido'}`;
    logSyncAttempt(email || 'email_desconhecido', errorMsg);
    console.error('❌ ' + errorMsg, error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor: ' + (error.message || 'Erro desconhecido')
    });
  }
});

export default router;