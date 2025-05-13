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
    // Gera uma senha forte aleatória se não for fornecida
    const finalPassword = password || Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + '!';
    
    // Cria o usuário no Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password: finalPassword,
      emailVerified: false, // O email ainda não foi verificado
    });
    
    console.log(`Usuário do Firebase criado com sucesso: ${userRecord.uid}`);
    return userRecord;
  } catch (error) {
    console.error('Erro ao criar usuário no Firebase:', error);
    throw error;
  }
}

// Função para gerar um link de redefinição de senha
export async function generatePasswordResetLink(email: string): Promise<string> {
  try {
    // Gera um link de redefinição de senha
    const link = await getAuth().generatePasswordResetLink(email);
    console.log(`Link de redefinição de senha gerado para ${email}`);
    return link;
  } catch (error) {
    console.error('Erro ao gerar link de redefinição de senha:', error);
    throw error;
  }
}

export default firebaseAdmin;