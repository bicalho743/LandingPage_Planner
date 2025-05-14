import express, { Request, Response } from 'express';
import { sendTransactionalEmail, addContactToBrevo } from './brevo';

const router = express.Router();

// Rota para testar o envio de emails via Brevo
router.post('/api/teste-email', async (req: Request, res: Response) => {
  try {
    const { to, subject, htmlContent, textContent } = req.body;
    
    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        error: true,
        message: 'Parâmetros incompletos. Necessário fornecer: to, subject, htmlContent'
      });
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        error: true,
        message: 'Email inválido'
      });
    }
    
    console.log(`⏳ Tentando enviar email para: ${to}`);
    
    // Extrair nome do email (parte antes do @)
    const name = to.split('@')[0];
    
    // Opcional: Adicionar o contato à lista de destinatários do Brevo
    try {
      await addContactToBrevo(name, to);
      console.log(`✅ Contato adicionado ao Brevo: ${to}`);
    } catch (contactError: any) {
      console.log(`⚠️ Erro ao adicionar contato (não crítico): ${contactError.message}`);
    }
    
    // Enviar o email transacional
    const emailResult = await sendTransactionalEmail(to, subject, htmlContent, textContent || '');
    console.log(`✅ Email transacional enviado para: ${to}`);
    
    return res.status(200).json({
      success: true,
      message: `Email enviado com sucesso para ${to}`
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    return res.status(500).json({
      error: true,
      message: `Erro ao enviar email: ${error.message}`,
      details: error.response?.text || error.stack
    });
  }
});

export default router;