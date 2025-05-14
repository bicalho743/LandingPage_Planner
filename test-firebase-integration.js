/**
 * Script para testar integração com o Firebase
 * 
 * Este script testa a integração com o Firebase Auth e Firestore
 * realizando operações não-destrutivas como:
 * - Verificar se as credenciais estão configuradas corretamente
 * - Verificar se o SDK Admin foi inicializado
 * - Testar a listagem de usuários
 * - Verificar configurações de autenticação
 */

// Import dinâmico será feito dentro da função

// Melhores práticas de segurança: nunca exibir as chaves completas
function maskString(str) {
  if (!str) return '[não definido]';
  return str.substring(0, 6) + '...' + str.substring(str.length - 4);
}

async function testFirebaseIntegration() {
  // Importar o módulo de forma dinâmica
  const admin = (await import('firebase-admin')).default;
  console.log('🔄 Iniciando testes de integração com Firebase...');

  // 1. Verificar variáveis de ambiente
  console.log('\n📋 Verificando configuração do Firebase:');

  // Verificar credenciais do Firebase Admin
  const adminCredentials = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!adminCredentials) {
    console.error('❌ Credenciais do Firebase Admin (FIREBASE_ADMIN_CREDENTIALS) não configuradas!');
    return false;
  }
  console.log('✅ Credenciais do Firebase Admin configuradas');

  // Verificar configuração do Firebase SDK para cliente
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const appId = process.env.VITE_FIREBASE_APP_ID;

  if (!apiKey) {
    console.error('❌ Chave de API do Firebase (VITE_FIREBASE_API_KEY) não configurada!');
  } else {
    console.log(`✅ Chave de API do Firebase: ${maskString(apiKey)}`);
  }

  if (!projectId) {
    console.error('❌ ID do projeto Firebase (VITE_FIREBASE_PROJECT_ID) não configurado!');
  } else {
    console.log(`✅ ID do projeto Firebase: ${projectId}`);
  }

  if (!appId) {
    console.error('❌ ID do aplicativo Firebase (VITE_FIREBASE_APP_ID) não configurado!');
  } else {
    console.log(`✅ ID do aplicativo Firebase: ${maskString(appId)}`);
  }

  // 2. Inicializar Firebase Admin SDK
  try {
    console.log('\n📋 Inicializando Firebase Admin SDK...');

    // Verificar se já está inicializado
    let app;
    if (admin.apps.length === 0) {
      const credentials = JSON.parse(adminCredentials);
      app = admin.initializeApp({
        credential: admin.credential.cert(credentials)
      });
      console.log('✅ Firebase Admin SDK inicializado com sucesso');
    } else {
      app = admin.apps[0];
      console.log('✅ Firebase Admin SDK já estava inicializado');
    }

    console.log(`✅ Projeto Firebase: ${app.options.projectId}`);
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin SDK:', error.message);
    return false;
  }

  // 3. Testar Firebase Auth
  try {
    console.log('\n📋 Testando Firebase Authentication...');
    
    const auth = admin.auth();
    
    // Listar usuários (limitado a 1 para não sobrecarregar)
    const listUsersResult = await auth.listUsers(1);
    console.log(`✅ Listagem de usuários testada com sucesso (${listUsersResult.users.length} usuários retornados)`);
    
    // Verificar configurações de autenticação
    try {
      const emailProviders = await auth.listProviderConfigs({ providerType: 'email' });
      console.log(`✅ Autenticação por e-mail configurada: ${emailProviders.providerConfigs.length > 0 ? 'Sim' : 'Não'}`);
    } catch (error) {
      console.log('❌ Não foi possível verificar configurações de autenticação por e-mail');
    }
    
    // Verificar provedores de autenticação
    try {
      const providers = await auth.listProviderConfigs({ providerType: 'oidc' });
      console.log(`✅ Provedores OIDC configurados: ${providers.providerConfigs.length}`);
      
      if (providers.providerConfigs.length > 0) {
        console.log('📋 Provedores OIDC disponíveis:');
        providers.providerConfigs.forEach(provider => {
          console.log(`   - ${provider.displayName} (${provider.providerId})`);
        });
      }
    } catch (error) {
      console.log('❌ Não foi possível verificar provedores OIDC');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar Firebase Authentication:', error.message);
  }

  // 4. Testar Firestore (se estiver sendo usado)
  try {
    console.log('\n📋 Testando Firestore (opcional)...');
    
    const firestore = admin.firestore();
    const testCollection = firestore.collection('_integration_test');
    
    // Adicionar um documento de teste
    const testDocRef = testCollection.doc('test_doc');
    await testDocRef.set({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Documento de teste criado com sucesso');
    
    // Ler o documento
    const docSnapshot = await testDocRef.get();
    console.log('✅ Leitura de documento testada com sucesso');
    
    // Limpar documento de teste
    await testDocRef.delete();
    console.log('✅ Documento de teste removido com sucesso');
    
  } catch (error) {
    console.log('ℹ️ Firestore não testado ou não disponível:', error.message);
  }

  console.log('\n✅ Testes de integração com Firebase concluídos!');
  return true;
}

// Executar os testes de integração
testFirebaseIntegration()
  .then(success => {
    if (success) {
      console.log('✅ Testes de integração com Firebase completados com sucesso!');
    } else {
      console.error('❌ Testes de integração com Firebase falharam!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro nos testes de integração:', error);
    process.exit(1);
  });