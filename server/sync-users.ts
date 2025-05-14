import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { firebaseAuth, createFirebaseUser } from './firebase';
import { generatePasswordResetLink } from './firebase';
import { addContactToBrevo } from './brevo';

const router = Router();

// Endpoint admin para listar usuários com status
router.get('/api/admin/users', async (req: Request, res: Response) => {
  try {
    // Implementar depois com autenticação adequada
    res.status(200).json({ message: 'Endpoint de administração' });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para sincronizar usuário com Firebase
router.post('/api/sync-user', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email não fornecido' 
      });
    }
    
    console.log(`⏳ Iniciando sincronização de usuário: ${email}`);
    
    // 1. Verificar se o usuário existe no banco de dados
    const dbUser = await storage.getUserByEmail(email);
    if (!dbUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado no banco de dados' 
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
      
      userExists = true;
      
      // Apenas retornar um link de redefinição de senha
      try {
        const resetLink = await generatePasswordResetLink(email);
        
        return res.status(200).json({
          success: true,
          message: 'Usuário já existe no Firebase, enviando link de redefinição de senha',
          resetLink,
          existingUser: true
        });
      } catch (resetError) {
        console.error('❌ Erro ao gerar link de redefinição de senha:', resetError);
        return res.status(200).json({
          success: true,
          message: 'Usuário já existe no Firebase, mas houve um erro ao gerar link de redefinição',
          existingUser: true
        });
      }
    } catch (firebaseError: any) {
      if (firebaseError.code !== 'auth/user-not-found') {
        console.error('❌ Erro ao verificar usuário no Firebase:', firebaseError);
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
        
        // Criar usuário no Firebase
        const userRecord = await createFirebaseUser(email, senha);
        
        // Atualizar o UID do Firebase no banco de dados
        await storage.updateFirebaseUid(dbUser.id, userRecord.uid);
        
        console.log(`✅ Usuário criado no Firebase e sincronizado: ${userRecord.uid}`);
        
        // Usuário foi restaurado com sucesso, enviar link de redefinição por segurança
        const resetLink = await generatePasswordResetLink(email);
        
        // Se usuário estava pendente, ativar
        if (dbUser.status === 'pendente') {
          await storage.updateUserStatus(dbUser.id, undefined, 'ativo');
          console.log(`✅ Status do usuário atualizado para ativo`);
        }
        
        return res.status(201).json({
          success: true,
          message: 'Usuário criado no Firebase e sincronizado com sucesso',
          resetLink,
          newUser: true
        });
      } catch (createError) {
        console.error('❌ Erro ao criar usuário no Firebase:', createError);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao criar usuário no Firebase' 
        });
      }
    }
  } catch (error) {
    console.error('❌ Erro geral na sincronização de usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

export default router;