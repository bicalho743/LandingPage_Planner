# Instruções para Ambiente de Produção

Este documento fornece instruções detalhadas para configurar e colocar o PlannerPro em produção.

## Pré-requisitos

Antes de começar, certifique-se de que você tem:

1. Acesso ao painel do Stripe com uma conta de produção ativa
2. Acesso ao console do Firebase
3. Conta no Brevo (antigo SendInBlue) para emails transacionais
4. Banco de dados PostgreSQL configurado para produção

## Configuração das Chaves de API

### Stripe
1. No painel do Stripe, vá para **Developers > API Keys**
2. Copie a **Publishable key** (começa com `pk_live_`)
3. Copie a **Secret key** (começa com `sk_live_`)
4. Configure os produtos e planos no Stripe:
   - Acesse **Products**
   - Crie os produtos e anote os IDs dos preços (começam com `price_`)
   - Você precisará de IDs para planos mensais, anuais e vitalícios

### Firebase
Certifique-se de que o arquivo de credenciais do Firebase Admin SDK está configurado.

### Brevo (SendInBlue)
Verifique se sua conta tem uma chave de API válida para enviar emails transacionais.

## Variáveis de Ambiente para Produção

Configure as seguintes variáveis de ambiente no Replit:

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_LIFETIME=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Configuração de Webhook do Stripe

1. No painel do Stripe, vá para **Developers > Webhooks**
2. Clique em **Add endpoint**
3. Configure a URL do seu webhook: `https://seu-dominio.com/api/stripe-webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `invoice.paid`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.deleted`
5. Copie a **Signing Secret** (começa com `whsec_`) e configure como `STRIPE_WEBHOOK_SECRET`

## Compilação e Implantação

Para compilar o código para produção:

```bash
npm run build
```

Para iniciar o servidor em modo de produção:

```bash
npm start
```

## Verificando a Implantação

Após a implantação, verifique:

1. Se o frontend está carregando corretamente
2. Se você consegue criar um usuário de teste
3. Se o checkout do Stripe está funcionando
4. Se os webhooks do Stripe estão sendo recebidos corretamente
5. Se os emails estão sendo enviados pelo Brevo

## Monitoramento em Produção

Para monitorar o sistema em produção:

1. Configure alertas no Stripe para notificações de falhas de pagamento
2. Verifique regularmente os logs do servidor
3. Monitore a taxa de entrega de emails no painel do Brevo
4. Configure monitoramento de erros no console do Firebase

## Troubleshooting

Em caso de problemas:

1. Verifique os logs do servidor para erros específicos
2. Confirme que todas as chaves de API estão corretamente configuradas
3. Verifique se os webhooks do Stripe estão sendo recebidos (na seção de webhooks do painel do Stripe)
4. Teste o envio de emails manualmente através da página de teste