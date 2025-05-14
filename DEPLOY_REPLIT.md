# Deploy do PlannerPro no Replit

Este guia fornece instruções específicas para implantar o PlannerPro em produção utilizando o Replit.

## Preparação para o Deploy

### 1. Configure as Variáveis de Ambiente de Produção

No Replit, vá para "Secrets" (no menu da esquerda) e adicione as seguintes variáveis:

#### Stripe (Produção)
- `NODE_ENV`: Defina como `production`
- `STRIPE_SECRET_KEY`: Sua chave secreta de produção do Stripe (começa com `sk_live_`)
- `STRIPE_PUBLIC_KEY`: Sua chave pública de produção do Stripe (começa com `pk_live_`)
- `STRIPE_PRICE_MONTHLY`: ID do preço mensal em produção (começa com `price_`)
- `STRIPE_PRICE_ANNUAL`: ID do preço anual em produção (começa com `price_`)
- `STRIPE_PRICE_LIFETIME`: ID do preço vitalício em produção (começa com `price_`)
- `STRIPE_WEBHOOK_SECRET`: Chave secreta do webhook do Stripe (começa com `whsec_`)

#### Firebase
Certifique-se de que todas as variáveis do Firebase estejam configuradas:
- `FIREBASE_ADMIN_CREDENTIALS`: JSON com as credenciais do Firebase Admin
- `VITE_FIREBASE_API_KEY`: Chave de API do Firebase
- `VITE_FIREBASE_PROJECT_ID`: ID do projeto Firebase
- `VITE_FIREBASE_APP_ID`: ID do aplicativo Firebase

#### Brevo (Email Marketing)
- `BREVO_API_KEY`: Sua chave de API do Brevo para emails transacionais

### 2. Configure o Comando de Inicialização

No Replit, vá para as configurações do seu projeto e defina o comando de inicialização:

```
npm run start
```

## Processo de Build e Deploy

### 1. Compile o Projeto para Produção

Execute o script de build que criamos:

```
./deploy.sh
```

Este script irá:
- Verificar se as variáveis de ambiente necessárias estão configuradas
- Compilar o frontend usando Vite
- Compilar o backend usando ESBuild
- Iniciar o servidor em modo de produção

Alternativamente, você pode executar o processo de build manualmente:

```
npm run build
```

### 2. Inicie o Servidor em Modo de Produção

Para iniciar o servidor em modo de produção:

```
npm run start
```

## Configuração do Webhook do Stripe

Após o deploy, é necessário configurar o webhook do Stripe para apontar para o seu aplicativo em produção:

1. Obtenha a URL do seu aplicativo (por exemplo, `https://seuprojeto.utilizador.repl.co`)
2. Configure o webhook no Stripe conforme detalhado no arquivo `STRIPE_WEBHOOK.md`
3. Adicione a URL completa do webhook: `https://seuprojeto.utilizador.repl.co/api/stripe-webhook`

## Monitoramento e Logs

Para monitorar seu aplicativo em produção no Replit:

1. Verifique os logs do console no Replit para diagnosticar problemas
2. Monitore os webhooks do Stripe no painel do Stripe
3. Verifique as estatísticas de envio de email no painel do Brevo

## Troubleshooting para o Replit

### Problemas de Memória

Se o aplicativo estiver consumindo muita memória:

1. Verifique se não há vazamentos de memória no código
2. Considere atualizar para um plano do Replit com mais recursos

### O Aplicativo Para de Responder

O Replit pode colocar seu aplicativo em "sleep" após períodos de inatividade. Para manter o aplicativo sempre ativo:

1. Configure um serviço de "ping" como UptimeRobot para fazer requisições regulares
2. Atualize para um plano do Replit que ofereça tempo de atividade contínuo

### Problemas com Webhooks

Se os webhooks do Stripe não estiverem funcionando:

1. Verifique se a URL do webhook está correta
2. Confirme que o aplicativo está acessível publicamente
3. Verifique se os logs mostram erros relacionados ao webhook

## Considerações para Produção

Para um ambiente de produção robusto, considere:

1. Configurar backups regulares do banco de dados
2. Implementar monitoramento de saúde do aplicativo
3. Configurar alertas para falhas de pagamento ou problemas de servidor