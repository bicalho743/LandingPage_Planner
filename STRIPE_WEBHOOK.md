# Configuração do Webhook do Stripe para Produção

Este documento contém instruções detalhadas para configurar o webhook do Stripe corretamente no ambiente de produção.

## Passos para Configuração

### 1. Acesse o Dashboard do Stripe

Faça login no [Dashboard do Stripe](https://dashboard.stripe.com/) e navegue até **Developers > Webhooks**.

### 2. Adicione um Novo Endpoint

Clique em **Add Endpoint** e configure:

- **Endpoint URL**: `https://seu-dominio.com/api/stripe-webhook`
- **Versão da API**: Mais recente (geralmente a padrão)
- **Eventos a escutar**: Selecione todos os eventos relevantes:
  - `checkout.session.completed`
  - `invoice.paid`
  - `subscription.created`
  - `subscription.updated`
  - `subscription.deleted`
  - `customer.subscription.trial_will_end` (para notificações de fim de período de teste)

### 3. Obtenha a Signing Secret

Após criar o endpoint, você verá uma "Signing Secret" (começa com `whsec_`). Copie este valor e adicione como variável de ambiente:

```
STRIPE_WEBHOOK_SECRET=whsec_seu_valor_aqui
```

### 4. Teste o Webhook

No painel do Stripe, você pode enviar eventos de teste para seu endpoint:

1. Clique no endpoint recém-criado
2. Selecione **Send test webhook**
3. Escolha o evento `checkout.session.completed`
4. Clique em **Send test webhook**

Verifique os logs do seu servidor para confirmar que o webhook foi recebido e processado corretamente.

## Tratamento de Eventos no Código

O webhook do Stripe está configurado para processar os seguintes eventos:

### Checkout Session Completed

Este evento é disparado quando um cliente completa o processo de checkout:

- O usuário é ativado no banco de dados
- Um usuário correspondente é criado no Firebase
- Um email de boas-vindas é enviado

### Invoice Paid

Este evento é disparado quando uma fatura é paga (relevante para assinaturas):

- A assinatura do usuário é marcada como ativa
- Se for o primeiro pagamento, o processo de ativação é semelhante ao checkout.session.completed

### Subscription Created/Updated/Deleted

Estes eventos são usados para manter o status da assinatura do usuário atualizado no banco de dados.

## Solução de Problemas

### Webhook não está sendo recebido

Verifique:
1. Se a URL do endpoint está correta e acessível publicamente
2. Se a chave `STRIPE_WEBHOOK_SECRET` está configurada corretamente
3. Se o servidor está configurado para processar o payload raw (já configurado em `server/index.ts`)

### Assinatura inválida

Se você vir erros de assinatura inválida:
1. Certifique-se de que está usando a chave de webhook correta
2. Verifique se o middleware `express.raw` está configurado antes de qualquer outro middleware para rotas de webhook

### Eventos duplicados

O Stripe pode enviar o mesmo evento várias vezes em caso de falha. O código deve ser idempotente para lidar com essa situação. No aplicativo atual, já existem verificações em `storage.ts` para garantir que operações não sejam duplicadas.

## Logs e Monitoramento

Para monitorar os webhooks em produção:

1. No painel do Stripe, vá para **Developers > Webhooks > [seu endpoint]**
2. Clique na guia **Eventos**
3. Aqui você pode ver todos os eventos enviados e suas respostas

Configure notificações de falha de webhooks no painel do Stripe em **Settings > Notifications**.