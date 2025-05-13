import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// Inicializa o Firebase Admin SDK se ainda não estiver inicializado
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      let credential;
      
      // Verifica se temos credenciais de serviço no ambiente
      if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
          credential = admin.credential.cert(serviceAccount);
          console.log('Usando credenciais de serviço do Firebase fornecidas');
        } catch (parseError) {
          console.error('Erro ao analisar credenciais do Firebase:', parseError);
          // Prossegue sem credenciais, o que pode funcionar em ambiente de desenvolvimento
          // mas não em produção
        }
      }
      
      const firebaseConfig = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        credential
      };
      
      admin.initializeApp(firebaseConfig);
      console.log('Firebase Admin SDK inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Firebase Admin SDK:', error);
    }
  }
  
  return admin;
}

// Inicializa o Firebase Admin SDK
const firebaseAdmin = initializeFirebaseAdmin();

// Função para criar um usuário no Firebase Authentication
export async function createFirebaseUser(email: string, password: string): Promise<admin.auth.UserRecord> {
  try {
    console.log("⏳ Criando usuário no Firebase para o email:", email);
    
    // Verificar se o usuário já existe
    try {
      const existingUser = await getAuth().getUserByEmail(email);
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
    const userRecord = await getAuth().createUser({
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
        const existingUser = await getAuth().getUserByEmail(email);
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
      await getAuth().getUserByEmail(email);
      console.log("✅ Usuário encontrado no Firebase, gerando link...");
    } catch (error: any) {
      console.error("❌ Usuário não encontrado para geração de link de redefinição:", error);
      throw new Error(`Usuário com email ${email} não encontrado para gerar link de redefinição`);
    }
    
    // Gera um link de redefinição de senha
    const link = await getAuth().generatePasswordResetLink(email);
    console.log(`✅ Link de redefinição gerado com sucesso (tamanho: ${link.length} caracteres)`);
    return link;
  } catch (error: any) {
    console.error('❌ Erro ao gerar link de redefinição de senha:', error);
    console.error('❌ Código do erro:', error.code);
    console.error('❌ Mensagem do erro:', error.message);
    throw error;
  }
}

export default firebaseAdmin;