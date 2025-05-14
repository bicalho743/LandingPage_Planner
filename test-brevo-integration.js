/**
 * Script para testar integração com o Brevo (SendinBlue)
 * 
 * Este script testa a integração com a API do Brevo
 * realizando operações não-destrutivas como:
 * - Verificar se a chave API está configurada corretamente
 * - Testar a listagem de contatos
 * - Testar a listagem de listas de contatos
 * - Verificar configurações de email
 */

// Melhores práticas de segurança: nunca exibir as chaves completas
function maskKey(key) {
  if (!key) return '[não definido]';
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}

async function testBrevoIntegration() {
  console.log('🔄 Iniciando testes de integração com Brevo...');
  
  // 1. Verificar variáveis de ambiente
  console.log('\n📋 Verificando configuração do Brevo:');
  
  const brevoApiKey = process.env.BREVO_API_KEY;
  
  if (!brevoApiKey) {
    console.error('❌ Chave de API do Brevo não configurada!');
    return false;
  }
  
  console.log(`✅ Chave de API do Brevo: ${maskKey(brevoApiKey)}`);
  
  // 2. Inicializar cliente Brevo
  let apiInstance;
  try {
    console.log('\n📋 Inicializando cliente da API do Brevo...');
    
    const SibApiV3Sdk = require('sib-api-v3-sdk');
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    
    // Configurar autenticação
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = brevoApiKey;
    
    console.log('✅ Cliente da API do Brevo inicializado com sucesso');
    
    // Criar instâncias de API
    const contactsApi = new SibApiV3Sdk.ContactsApi();
    const listsApi = new SibApiV3Sdk.ListsApi();
    const accountApi = new SibApiV3Sdk.AccountApi();
    const emailCampaignsApi = new SibApiV3Sdk.EmailCampaignsApi();
    const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // 3. Testar API de contatos
    try {
      console.log('\n📋 Testando API de contatos...');
      
      const contactsResult = await contactsApi.getContacts({ limit: 10, offset: 0 });
      console.log(`✅ Listagem de contatos testada com sucesso (${contactsResult.contacts ? contactsResult.contacts.length : 0} contatos)`);
    } catch (error) {
      console.error('❌ Erro ao testar API de contatos:', error.message);
    }
    
    // 4. Testar API de listas
    try {
      console.log('\n📋 Testando API de listas...');
      
      const listsResult = await listsApi.getLists({ limit: 10, offset: 0 });
      console.log(`✅ Listagem de listas testada com sucesso (${listsResult.lists ? listsResult.lists.length : 0} listas)`);
      
      if (listsResult.lists && listsResult.lists.length > 0) {
        console.log('📋 Listas de contatos disponíveis:');
        listsResult.lists.forEach(list => {
          console.log(`   - ${list.name} (ID: ${list.id}, ${list.totalSubscribers} inscritos)`);
        });
      } else {
        console.log('⚠️ Nenhuma lista de contatos encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao testar API de listas:', error.message);
    }
    
    // 5. Verificar configurações de conta
    try {
      console.log('\n📋 Verificando configurações de conta...');
      
      const accountInfo = await accountApi.getAccount();
      console.log(`✅ Informações da conta recuperadas com sucesso`);
      console.log(`   - Plano: ${accountInfo.plan[0].name}`);
      console.log(`   - Empresa: ${accountInfo.companyName || 'Não definido'}`);
      console.log(`   - Email: ${accountInfo.email}`);
    } catch (error) {
      console.error('❌ Erro ao verificar configurações de conta:', error.message);
    }
    
    // 6. Verificar domínios de email
    try {
      console.log('\n📋 Verificando domínios de email...');
      
      const domains = await transactionalEmailsApi.getSmtpDetails();
      
      if (domains.relay && domains.relay.data && domains.relay.data.length > 0) {
        console.log(`✅ ${domains.relay.data.length} domínios configurados`);
        
        domains.relay.data.forEach(domain => {
          const status = domain.active ? '✅ Ativo' : '❌ Inativo';
          console.log(`   - ${domain.domain} (${status})`);
        });
      } else {
        console.log('⚠️ Nenhum domínio de email configurado');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar domínios de email:', error.message);
    }
    
    // 7. Verificar status de email transacional
    try {
      console.log('\n📋 Verificando status de email transacional...');
      
      const emailStats = await transactionalEmailsApi.getEmailEventReport({
        limit: 1,
        events: ['delivered']
      });
      
      if (emailStats && emailStats.events) {
        console.log(`✅ Estatísticas de email recuperadas com sucesso`);
      } else {
        console.log('⚠️ Sem estatísticas de email disponíveis');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar estatísticas de email:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar cliente Brevo:', error.message);
    return false;
  }
  
  console.log('\n✅ Testes de integração com Brevo concluídos!');
  return true;
}

// Executar os testes de integração
testBrevoIntegration()
  .then(success => {
    if (success) {
      console.log('✅ Testes de integração com Brevo completados com sucesso!');
    } else {
      console.error('❌ Testes de integração com Brevo falharam!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro nos testes de integração:', error);
    process.exit(1);
  });