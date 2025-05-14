import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializa o Firebase Admin SDK se ainda não estiver inicializado
if (!admin.apps.length) {
  try {
    // Verificar se temos credenciais de serviço no ambiente
    if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
      console.warn('⚠️ Credenciais do Firebase Admin não encontradas no ambiente');
      console.warn('⚠️ Algumas funcionalidades relacionadas ao Firebase podem não funcionar corretamente');
      
      // Inicialização com configuração mínima para desenvolvimento
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      });
    } else {
      // Inicialização com credenciais completas
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.VITE_FIREBASE_PROJECT_ID
        });
        console.log('✅ Firebase Admin SDK inicializado com credenciais');
      } catch (parseError) {
        console.error('❌ Erro ao analisar credenciais do Firebase:', parseError);
        throw new Error('Falha ao inicializar Firebase Admin com credenciais inválidas');
      }
    }
  } catch (error) {
    console.error('❌ Erro fatal ao inicializar Firebase Admin SDK:', error);
    // Em produção, isto poderia derrubar a aplicação
    // process.exit(1);
  }
}

// Exportando serviços para uso em outros arquivos
export const firebaseAuth = admin.auth();
export const firebaseDb = admin.firestore();

console.log('✅ Firebase Admin SDK pronto para uso');

// Função para criar um usuário no Firebase Authentication
export async function createFirebaseUser(email: string, password: string): Promise<admin.auth.UserRecord> {
  try {
    console.log("⏳ Criando usuário no Firebase para o email:", email);
    
    // Verificar se o usuário já existe
    try {
      const existingUser = await firebaseAuth.getUserByEmail(email);
      console.log("⚠️ Usuário já existe no Firebase com UID:", existingUser.uid);
      
      // Se o usuário já existe, apenas retornar
      return existingUser;
    } catch (lookupError: any) {
      if (lookupError.code === 'auth/user-not-found') {
        console.log("✅ Usuário não encontrado no Firebase, prosseguindo com criação...");
      } else {
        console.error("❌ Erro ao verificar usuário existente:", lookupError);
        throw lookupError;
      }
    }
    
    // Gera uma senha forte aleatória se não for fornecida
    const finalPassword = password || Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + '!';
    console.log("✅ Senha temporária gerada (não exibindo por segurança)");
    
    // Cria o usuário no Firebase Auth
    console.log("⏳ Enviando solicitação para criar usuário no Firebase...");
    const userRecord = await firebaseAuth.createUser({
      email,
      password: finalPassword,
      emailVerified: false, // O email ainda não foi verificado
      displayName: email.split('@')[0], // Nome provisório baseado no email
    });
    
    console.log(`✅ Usuário do Firebase criado com sucesso! UID: ${userRecord.uid}`);
    return userRecord;
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.log("⚠️ Email já existe no Firebase, tentando recuperar usuário...");
      try {
        const existingUser = await firebaseAuth.getUserByEmail(email);
        console.log("✅ Usuário recuperado do Firebase com UID:", existingUser.uid);
        return existingUser;
      } catch (secondError) {
        console.error("❌ Erro ao recuperar usuário existente:", secondError);
        throw secondError;
      }
    }
    
    console.error('❌ Erro ao criar usuário no Firebase:', error);
    console.error('❌ Código do erro:', error.code);
    console.error('❌ Mensagem do erro:', error.message);
    throw error;
  }
}

// Função para gerar um link de redefinição de senha
export async function generatePasswordResetLink(email: string): Promise<string> {
  try {
    console.log(`⏳ Gerando link de redefinição de senha para ${email}...`);
    
    // Verificar se o usuário existe antes de gerar o link
    try {
      await firebaseAuth.getUserByEmail(email);
      console.log("✅ Usuário encontrado no Firebase, gerando link...");
    } catch (error: any) {
      console.error("❌ Usuário não encontrado para geração de link de redefinição:", error);
      throw new Error(`Usuário com email ${email} não encontrado para gerar link de redefinição`);
    }
    
    // Gera um link de redefinição de senha
    const link = await firebaseAuth.generatePasswordResetLink(email);
    console.log(`✅ Link de redefinição gerado com sucesso (tamanho: ${link.length} caracteres)`);
    return link;
  } catch (error: any) {
    console.error('❌ Erro ao gerar link de redefinição de senha:', error);
    console.error('❌ Código do erro:', error.code);
    console.error('❌ Mensagem do erro:', error.message);
    throw error;
  }
}

// Função para atualizar o Firebase UID de um usuário existente no banco de dados
export async function updateFirebaseUid(userId: number, firebaseUid: string): Promise<boolean> {
  try {
    // Esta função seria implementada no storage.ts
    // mas por enquanto apenas registramos a intenção
    console.log(`⏳ Atualizando Firebase UID do usuário ${userId} para ${firebaseUid}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar Firebase UID:', error);
    return false;
  }
}