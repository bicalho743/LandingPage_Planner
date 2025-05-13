// Inicialização do Firebase para autenticação
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Autenticação de usuário com email e senha
export async function loginWithEmailPassword(email: string, password: string): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    
    // Traduzir mensagens de erro comuns
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuário não encontrado. Verifique seu email.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Senha incorreta. Tente novamente.');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Credenciais inválidas. Verifique seu email e senha.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas de login. Tente novamente mais tarde.');
    }
    
    throw new Error(error.message || 'Erro ao fazer login');
  }
}

// Enviar email de redefinição de senha
export async function sendPasswordReset(email: string): Promise<boolean> {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error('Erro ao enviar email de redefinição de senha:', error);
    
    // Traduzir mensagens de erro comuns
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuário não encontrado. Verifique seu email.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email inválido. Verifique e tente novamente.');
    }
    
    throw new Error(error.message || 'Erro ao enviar email de redefinição de senha');
  }
}

// Verificar estado da autenticação
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// Logout
export async function logout(): Promise<void> {
  return auth.signOut();
}

export { auth };