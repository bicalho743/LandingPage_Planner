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
NODE_ENV=production npm run start
```

Ou se preferir, você pode usar o script de produção:

```
./start-production.sh
```

### 3. Verifique suas variáveis de ambiente

Execute o verificador de ambiente para garantir que tudo está configurado corretamente:

```
node verificar-env.js
```

## Processo de Build e Deploy

### 1. Build do Projeto

No shell do Replit, execute:

```bash
# Tornar o script executável (necessário apenas uma vez)
chmod +x deploy.sh

# Executar o build sem iniciar o servidor
NODE_ENV=production npm run build
```

### 2. Deploy no Replit

Após ter feito o build com sucesso, você pode fazer o deploy através do botão "Deploy" no Replit.

Antes de fazer o deploy, verifique se:

1. O build foi concluído com sucesso
2. Todas as variáveis de ambiente estão configuradas
3. O comando de inicialização está definido corretamente

### 3. Verificação Pós-Deploy

Após o deploy, verifique:

- Se a aplicação está funcionando corretamente
- Se a URL de produção está acessível
- Se você pode acessar o dashboard administrativo

## Configuração do Webhook do Stripe

Após o deploy, é necessário configurar o webhook do Stripe para apontar para o seu aplicativo em produção:

1. Obtenha a URL do seu aplicativo (por exemplo, `https://planner-pro.utilizador.repl.co`)
2. Configure o webhook no Stripe conforme detalhado no arquivo `STRIPE_WEBHOOK.md`
3. Adicione a URL completa do webhook: `https://planner-pro.utilizador.repl.co/api/stripe-webhook`
4. Teste o webhook usando a ferramenta de teste do Stripe

## Lista de Verificação Final para Produção

- [ ] Build concluído com sucesso
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Webhook do Stripe configurado com a URL de produção
- [ ] Domínio do Firebase atualizado com URL de produção
- [ ] Banco de dados configurado e acessível
- [ ] Comando de inicialização definido corretamente
- [ ] Deploy realizado com sucesso
- [ ] Site acessível via URL de produção
- [ ] Processo de pagamento testado
- [ ] Webhooks recebendo eventos corretamente
- [ ] Emails sendo enviados corretamente

## Monitoramento e Logs

Para monitorar seu aplicativo em produção no Replit:

1. Verifique os logs do console no Replit
2. Monitore os eventos e webhooks no painel do Stripe
3. Verifique o tráfego e logs de autenticação no console do Firebase
4. Monitore o envio e entrega de emails no painel do Brevo

## Troubleshooting Comum

### Problemas de Memória ou Timeout

Se o aplicativo estiver consumindo muita memória ou apresentando timeouts:

1. Verifique os logs para identificar operações intensivas
2. Ajuste os limites de timeout no código, se necessário
3. Atualize para um plano do Replit com mais recursos

### Aplicativo em "Sleep"

O Replit pode colocar seu aplicativo em "sleep" após períodos de inatividade:

1. Configure um serviço de "ping" como UptimeRobot
2. Atualize para um plano do Replit com tempo de atividade contínuo

### Webhooks Não Funcionando

Se os webhooks do Stripe não funcionarem em produção:

1. Verifique se a URL está correta no painel do Stripe
2. Confirme que a chave de assinatura do webhook está configurada
3. Verifique os logs para erros de autenticação do webhook
4. Teste com a ferramenta "Send test webhook" do Stripe

## Suporte e Manutenção

Para manter seu aplicativo funcionando corretamente:

1. Realize backups regulares do banco de dados
2. Mantenha suas dependências atualizadas
3. Monitore a utilização de recursos no Replit
4. Configure alertas para eventos importantes (falhas de pagamento, erros críticos)
5. Teste regularmente o fluxo completo de registro e pagamento