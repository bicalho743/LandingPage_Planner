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

// Inicialização protegida: sem as envs VITE_FIREBASE_*, o getAuth lança
// "auth/invalid-api-key" no import e derruba o site INTEIRO em tela branca.
// A landing em si não depende de Firebase (login/registro acontecem na
// aplicação principal), então aqui só inicializa se a config existir.
let auth: ReturnType<typeof getAuth> = null as any;
if (firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (e) {
    console.warn("Firebase não inicializado:", e);
  }
}

function requireAuth() {
  if (!auth) throw new Error("Autenticação indisponível. Acesse plannerorganiza.com.br para entrar.");
  return auth;
}

// Autenticação de usuário com email e senha
export async function loginWithEmailPassword(email: string, password: string): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(requireAuth(), email, password);
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
    await sendPasswordResetEmail(requireAuth(), email);
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
  return auth ? auth.currentUser : null;
}

// Logout
export async function logout(): Promise<void> {
  if (auth) await auth.signOut();
}

export { auth };