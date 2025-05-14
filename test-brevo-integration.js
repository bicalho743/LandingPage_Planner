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
    
    // Importar o módulo de forma dinâmica
    const SibApiV3Sdk = (await import('sib-api-v3-sdk')).default;
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    
    // Configurar autenticação
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = brevoApiKey;
    
    console.log('✅ Cliente da API do Brevo inicializado com sucesso');
    
    // Criar instâncias de API
    const contactsApi = new SibApiV3Sdk.ContactsApi();
    
    // Verificamos se as APIs existem antes de instanciá-las
    let listsApi;
    let accountApi;
    let emailCampaignsApi;
    let transactionalEmailsApi;
    
    // Verificar se ListsApi existe
    if (typeof SibApiV3Sdk.ListsApi === 'function') {
      listsApi = new SibApiV3Sdk.ListsApi();
    } else {
      console.log('⚠️ ListsApi não disponível na versão atual do SDK');
    }
    
    // Verificar se AccountApi existe
    if (typeof SibApiV3Sdk.AccountApi === 'function') {
      accountApi = new SibApiV3Sdk.AccountApi();
    } else {
      console.log('⚠️ AccountApi não disponível na versão atual do SDK');
    }
    
    // Verificar se EmailCampaignsApi existe
    if (typeof SibApiV3Sdk.EmailCampaignsApi === 'function') {
      emailCampaignsApi = new SibApiV3Sdk.EmailCampaignsApi();
    } else {
      console.log('⚠️ EmailCampaignsApi não disponível na versão atual do SDK');
    }
    
    // Verificar se TransactionalEmailsApi existe
    if (typeof SibApiV3Sdk.TransactionalEmailsApi === 'function') {
      transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
    } else {
      console.log('⚠️ TransactionalEmailsApi não disponível na versão atual do SDK');
    }
    
    // 3. Testar API de contatos
    try {
      console.log('\n📋 Testando API de contatos...');
      
      const contactsResult = await contactsApi.getContacts({ limit: 10, offset: 0 });
      console.log(`✅ Listagem de contatos testada com sucesso (${contactsResult.contacts ? contactsResult.contacts.length : 0} contatos)`);
    } catch (error) {
      console.error('❌ Erro ao testar API de contatos:', error.message);
    }
    
    // 4. Testar API de listas
    if (listsApi) {
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
    } else {
      console.log('⏭️ Teste de API de listas ignorado (API não disponível)');
    }
    
    // 5. Verificar configurações de conta
    if (accountApi) {
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
    } else {
      console.log('⏭️ Teste de API de conta ignorado (API não disponível)');
    }
    
    // 6. Verificar domínios de email
    if (transactionalEmailsApi && typeof transactionalEmailsApi.getSmtpDetails === 'function') {
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
    } else {
      console.log('⏭️ Teste de verificação de domínios ignorado (método não disponível)');
    }
    
    // 7. Verificar status de email transacional
    if (transactionalEmailsApi) {
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
    } else {
      console.log('⏭️ Teste de estatísticas de email ignorado (API não disponível)');
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