# Instruções para Ambiente de Produção

Este documento fornece instruções detalhadas para configurar e colocar o PlannerPro em produção.

## Pré-requisitos

Antes de começar, certifique-se de que você tem:

1. Acesso ao painel do Stripe com uma conta de produção ativa
2. Acesso ao console do Firebase
3. Conta no Brevo (antigo SendInBlue) para emails transacionais
4. Banco de dados PostgreSQL configurado para produção
5. Domínio personalizado (opcional, mas recomendado para produção)

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
1. No [Console do Firebase](https://console.firebase.google.com/), selecione seu projeto
2. Vá para **Configurações do Projeto > Contas de serviço**
3. Clique em **Gerar nova chave privada** para baixar o arquivo JSON de credenciais
4. Adicione o conteúdo desse arquivo como a variável de ambiente `FIREBASE_ADMIN_CREDENTIALS`
5. Na seção de **Autenticação > Sign-in method**, verifique se o método de Email/Senha está ativado
6. Em **Authorized Domains**, adicione o domínio da sua aplicação em produção

### Brevo (SendInBlue)
1. Faça login no [Painel do Brevo](https://app.brevo.com/)
2. Vá para **Settings > API Keys & Webhooks**
3. Gere uma nova chave de API v3 (se não existir)
4. Adicione a chave como variável de ambiente `BREVO_API_KEY`
5. Configurações importantes:
   - Verifique seu domínio de envio em **Settings > Senders & IPs**
   - Configure os templates de email para transações importantes

## Variáveis de Ambiente para Produção

Configure as seguintes variáveis de ambiente no Replit:

```
# Configuração de ambiente
NODE_ENV=production

# Stripe (Produção)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_LIFETIME=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_APP_ID=1:12345:web:abc123...
FIREBASE_ADMIN_CREDENTIALS={"type":"service_account","project_id":"..."}

# Brevo
BREVO_API_KEY=xkeysib-...

# Banco de Dados (já deve estar configurado no Replit)
# DATABASE_URL=postgresql://...
```

## Configuração de Domínio Personalizado (Opcional)

Para um ambiente de produção profissional, recomendamos configurar um domínio personalizado:

1. No Replit, vá para **Settings > Custom Domains**
2. Adicione seu domínio e siga as instruções para configurar os registros DNS
3. Uma vez configurado, atualize as seguintes configurações:
   - URLs de callback no Stripe
   - Domínios autorizados no Firebase
   - Domínios verificados no Brevo

## Configuração de Webhook do Stripe

1. No painel do Stripe, vá para **Developers > Webhooks**
2. Clique em **Add endpoint**
3. Configure a URL do seu webhook: `https://seu-dominio.com/api/stripe-webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end` (para notificações antes do fim do trial)
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie a **Signing Secret** (começa com `whsec_`) e configure como `STRIPE_WEBHOOK_SECRET`

## Configuração de Emails Transacionais

Para garantir a entrega confiável de emails, configure adequadamente:

1. No painel do Brevo, verifique se seu domínio de email está autenticado (SPF, DKIM, DMARC)
2. Teste o envio de emails para diferentes provedores (Gmail, Outlook, etc.)
3. Configure templates para os seguintes emails:
   - Boas-vindas após cadastro
   - Confirmação de pagamento
   - Aviso de término de período de trial
   - Falha em pagamento
   - Recuperação de senha

## Compilação e Implantação

Para compilar o código para produção, use os scripts incluídos:

```bash
# Método 1: Script completo de deploy
./deploy.sh

# Método 2: Compilação e inicialização separadas
npm run build
NODE_ENV=production npm start

# Método 3: Scripts separados
./deploy.sh
./start-production.sh
```

## Teste de Carga (Opcional)

Antes de lançar para o público, considere realizar testes de carga:

1. Use ferramentas como k6, Artillery ou JMeter
2. Teste os endpoints críticos (login, checkout, dashboard)
3. Identifique gargalos de performance
4. Otimize conforme necessário

## Verificando a Implantação

Após a implantação, execute uma verificação completa:

1. Teste de front-end:
   - Navegue pelo site em diferentes dispositivos e navegadores
   - Verifique a responsividade e elementos visuais
   - Teste os botões de CTA e formulários

2. Teste de pagamentos:
   - Complete um checkout completo com cartão de teste
   - Verifique se o usuário é criado corretamente no Firebase
   - Confirme que o webhook do Stripe é processado

3. Teste de emails:
   - Verifique se emails de boas-vindas são enviados
   - Teste a recuperação de senha
   - Verifique a formatação dos emails em diferentes clientes

4. Teste de autenticação:
   - Registre um novo usuário
   - Faça login com usuário existente
   - Teste o processo de recuperação de senha

## Backup e Recuperação de Desastres

Implemente uma estratégia de backup:

1. Configure backups automáticos do banco de dados:
   ```bash
   # Adicione ao cron para execução diária
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. Armazene backups em local seguro:
   - Serviço de armazenamento em nuvem (S3, Google Cloud Storage)
   - Repositório Git separado para configurações

3. Documente o processo de recuperação:
   - Como restaurar o banco de dados
   - Como reconfigurar as variáveis de ambiente
   - Como realizar o deploy em um novo ambiente

## Monitoramento em Produção

Configure um sistema de monitoramento abrangente:

1. **Monitoramento de Aplicação**
   - Configure alertas para erros do servidor
   - Monitore tempos de resposta e disponibilidade
   - Use uma ferramenta como Sentry para rastreamento de erros

2. **Monitoramento de Pagamentos**
   - Configure alertas no Stripe para falhas de pagamento
   - Monitore tentativas de fraude
   - Acompanhe taxas de conversão e abandono de checkout

3. **Monitoramento de Emails**
   - Acompanhe taxas de entrega e abertura no Brevo
   - Configure alertas para falhas de envio
   - Monitore reclamações de spam

4. **Monitoramento de Usuários**
   - Acompanhe estatísticas de autenticação no Firebase
   - Monitore tentativas de login mal-sucedidas
   - Acompanhe a atividade de usuários e retenção

## Manutenção Contínua

Estabeleça uma rotina de manutenção:

1. **Atualizações de Segurança**
   - Mantenha dependências atualizadas
   - Revise alertas de segurança
   - Aplique patches conforme necessário

2. **Verificação de Performance**
   - Monitore uso de recursos
   - Otimize consultas de banco de dados
   - Ajuste configurações de cache

3. **Tratamento de Problemas de Pagamento**
   - Processos para falhas de pagamento
   - Comunicação com clientes sobre problemas de cartão
   - Recuperação de assinaturas canceladas

## Troubleshooting

Em caso de problemas, siga estas etapas:

1. **Problemas de Servidor**
   - Verifique os logs do servidor (`npm logs`)
   - Confirme que todas as variáveis de ambiente estão configuradas
   - Verifique a conectividade com banco de dados e serviços externos

2. **Problemas de Pagamento**
   - Verifique os logs e eventos no painel do Stripe
   - Confirme se os webhooks estão sendo recebidos corretamente
   - Teste manualmente o processo de checkout

3. **Problemas de Email**
   - Verifique os logs de envio no Brevo
   - Teste o envio manual através da página `/teste-email`
   - Verifique a autenticação de domínio e reputação do remetente

4. **Problemas de Autenticação**
   - Verifique os logs no console do Firebase
   - Confirme que os domínios estão autorizados
   - Teste o processo de login com contas de teste

## Recursos Adicionais

- [Documentação do Stripe](https://stripe.com/docs)
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Brevo](https://developers.brevo.com/)
- [Guia de deploy do Replit](https://docs.replit.com/hosting/deployments/about-deployments)
- [Guia de escalabilidade do PostgreSQL](https://www.postgresql.org/docs/current/high-availability.html)