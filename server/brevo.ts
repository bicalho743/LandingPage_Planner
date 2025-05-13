import SibApiV3Sdk from 'sib-api-v3-sdk';

const API_KEY = process.env.BREVO_API_KEY!;
const LIST_ID = 7; // ID da lista "Leads Planner Organizer"

// Verificar se a chave API foi fornecida
if (!API_KEY) {
  console.warn('⚠️ BREVO_API_KEY não configurada. A integração com Brevo estará desativada.');
}

// Configuração do cliente da API Brevo (anteriormente SendInBlue)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = API_KEY;

const apiInstance = new SibApiV3Sdk.ContactsApi();

/**
 * Adiciona um contato à lista do Brevo
 * @param name Nome do contato
 * @param email Email do contato
 */
export async function addContactToBrevo(name: string, email: string) {
  try {
    if (!API_KEY) {
      console.log(`ℹ️ Simulando adição de contato ao Brevo: ${email}`);
      return;
    }

    const createContact = {
      email: email,
      listIds: [LIST_ID],
      updateEnabled: true,
      attributes: {
        FIRSTNAME: name
      },
    };

    await apiInstance.createContact(createContact);
    console.log(`✅ Contato adicionado ao Brevo: ${email}`);
  } catch (error) {
    console.error("❌ Erro ao adicionar contato ao Brevo:", error);
  }
}

/**
 * Envia um email transacional via Brevo
 * @param to Email do destinatário
 * @param subject Assunto do email
 * @param htmlContent Conteúdo HTML do email
 * @param textContent Conteúdo texto do email
 */
export async function sendTransactionalEmail(
  to: string, 
  subject: string, 
  htmlContent: string, 
  textContent: string
) {
  try {
    if (!API_KEY) {
      console.log("ℹ️ Simulando envio de email transacional:");
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Texto: ${textContent.substring(0, 100)}...`);
      return;
    }

    const sendSmtpEmail = {
      to: [{email: to}],
      sender: {
        name: "PlannerPro Organizer",
        email: "suporte@plannerpro.com" // Substituir pelo seu email de envio verificado no Brevo
      },
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent
    };
  
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email transacional enviado: ${result.messageId}`);
  } catch (error) {
    console.error("❌ Erro ao enviar email transacional:", error);
  }
}