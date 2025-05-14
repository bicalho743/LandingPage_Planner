import express, { Request, Response } from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Verificar status do Stripe CLI
router.get('/api/admin/stripe-cli-status', async (req: Request, res: Response) => {
  try {
    // Na prática, você precisaria verificar se o processo está rodando
    // Como isso é complicado de fazer na API, retornamos instruções para o usuário
    res.json({
      running: false,
      message: 'Para iniciar o Stripe CLI, execute o comando: bash run-stripe-cli.sh',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'configurado' : 'não configurado'
    });
  } catch (error) {
    console.error('Erro ao verificar status do Stripe CLI:', error);
    res.status(500).json({ error: 'Erro ao verificar status do Stripe CLI' });
  }
});

// Endpoint para criar um evento de teste no Stripe
router.post('/api/admin/stripe-test-event', async (req: Request, res: Response) => {
  try {
    // Obter tipo de evento e chave secreta (opcional) do corpo da requisição
    const { eventType, secretKey } = req.body;
    
    // Usar a chave fornecida ou cair para a chave de ambiente
    const stripeKey = secretKey || (process.env.NODE_ENV === 'production'
      ? process.env.STRIPE_SECRET_KEY
      : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY));
    
    if (!stripeKey) {
      throw new Error('Chave secreta do Stripe não configurada');
    }
    
    // Inicializar o Stripe com a chave
    const stripe = new Stripe(stripeKey);
    
    // Criar um evento de teste baseado no tipo
    let event;
    
    if (eventType === 'checkout.session.completed') {
      // Criar um cliente de teste
      const customer = await stripe.customers.create({
        email: 'test@example.com',
        name: 'Teste Webhook'
      });
      
      // Criar uma sessão de checkout de teste
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Teste de Webhook',
            },
            unit_amount: 2000, // R$ 20,00
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          userId: '999',
          senha: Buffer.from('teste123').toString('base64')
        }
      });
      
      // Criar um evento de teste usando a sessão
      event = await stripe.events.create({
        type: 'checkout.session.completed',
        data: {
          object: session
        }
      });
    } else {
      // Para outros tipos de evento, criar um evento genérico
      event = await stripe.events.create({
        type: eventType || 'checkout.session.completed'
      });
    }
    
    // Enviar o evento para o webhook
    console.log(`✅ Evento de teste criado: ${event.id}`);
    
    // Retornar o ID do evento
    res.json({
      success: true,
      eventId: event.id,
      message: `Evento de teste criado com sucesso: ${event.type}`
    });
  } catch (error: any) {
    console.error('Erro ao criar evento de teste:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao criar evento de teste'
    });
  }
});

export default router;