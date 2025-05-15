// Script para excluir um usuário do Firebase
import admin from 'firebase-admin';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

// Inicializar o Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
} catch (error) {
  console.error("Erro ao fazer parse das credenciais do Firebase:", error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function deleteUserByEmail(email) {
  try {
    console.log(`Procurando usuário pelo e-mail: ${email}`);
    
    // Buscar o usuário pelo e-mail
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`Usuário encontrado, UID: ${userRecord.uid}`);
    
    // Excluir o usuário
    await admin.auth().deleteUser(userRecord.uid);
    console.log(`Usuário ${email} (${userRecord.uid}) excluído com sucesso do Firebase!`);
    
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`Usuário com e-mail ${email} não encontrado no Firebase.`);
      return false;
    }
    console.error("Erro ao excluir usuário:", error);
    return false;
  }
}

// O e-mail do usuário que você deseja excluir
const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.error("Por favor, forneça um endereço de e-mail como argumento.");
  console.log("Uso: node delete-firebase-user.js email@exemplo.com");
  process.exit(1);
}

// Função principal que chama deleteUserByEmail
async function main() {
  try {
    const success = await deleteUserByEmail(emailToDelete);
    if (success) {
      console.log("Operação concluída com sucesso!");
    } else {
      console.log("Operação concluída, mas não foi possível excluir o usuário.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Erro durante a execução:", error);
    process.exit(1);
  }
}

// Executar a função principal
main();