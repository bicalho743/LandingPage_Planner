# PlannerPro Organizer

Uma plataforma completa de organização pessoal com sistema de assinatura usando Stripe e autenticação via Firebase.

## Funcionalidades

- Landing page com apresentação do produto
- Sistema de planos de assinatura (Mensal, Anual e Vitalício)
- Período de trial de 7 dias para planos de assinatura
- Integração com Stripe para processamento de pagamentos
- Autenticação de usuários via Firebase
- Sistema de captura de leads com integração ao Brevo
- Emails transacionais automatizados
- Dashboard para gerenciamento de tarefas

## Tecnologias Utilizadas

- Frontend: React com Tailwind CSS e shadcn/ui
- Backend: Node.js com Express
- Banco de Dados: PostgreSQL com Drizzle ORM
- Pagamentos: Stripe
- Autenticação: Firebase Authentication
- Email Marketing: Brevo (antigo SendInBlue)

## Arquitetura da Aplicação

- **Frontend**: Single-page Application (SPA) em React
- **Backend**: API RESTful em Express
- **Fluxo de pagamento**: Checkout hospedado pelo Stripe com webhooks para processamento
- **Autenticação**: Firebase para gerenciamento de usuários
- **Persistência**: PostgreSQL com Drizzle ORM para modelagem e migrações

## Como Executar o Projeto

### Desenvolvimento

Iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

### Produção

Para compilar e executar em produção, siga estas etapas:

#### 1. Configure as variáveis de ambiente de produção

Certifique-se de que todas as variáveis necessárias estejam configuradas. Você pode verificar isso executando:

```bash
node verificar-env.js
```

#### 2. Método 1: Use o script de deploy completo

O script de deploy automatiza todo o processo de compilação e inicialização:

```bash
# Tornar o script executável (necessário apenas uma vez)
chmod +x deploy.sh

# Executar o deploy
./deploy.sh
```

#### 3. Método 2: Processo manual

Alternativamente, você pode executar as etapas manualmente:

```bash
# Compilar o projeto para produção
npm run build

# Iniciar o servidor em modo de produção
NODE_ENV=production npm run start
```

#### 4. Método 3: Usar scripts separados para build e inicialização

```bash
# Compilar para produção
./deploy.sh

# Iniciar o servidor em produção (em outro terminal ou depois de terminar o build)
./start-production.sh
```

#### 5. Verificação de Funcionamento

Após o deploy, verifique:
- O acesso à página inicial
- A integração com Stripe através de um pagamento de teste
- O funcionamento dos webhooks
- O envio de emails via Brevo

### Configurar Webhooks do Stripe

Para testar o webhook do Stripe localmente, você pode usar o script fornecido:

```bash
# Tornar o script executável (necessário apenas uma vez)
chmod +x start-stripe.sh

# Executar o script
node run-stripe-webhook.js
```

O script detectará automaticamente a porta em que o servidor está rodando e iniciará o Stripe CLI.

## Documentação Adicional

Para informações detalhadas sobre como configurar o ambiente de produção, consulte os seguintes documentos:

- [PRODUCAO.md](PRODUCAO.md) - Guia geral para produção
- [DEPLOY_REPLIT.md](DEPLOY_REPLIT.md) - Instruções específicas para deploy no Replit
- [STRIPE_WEBHOOK.md](STRIPE_WEBHOOK.md) - Guia para configuração do webhook do Stripe
- [CHECKLIST_PRODUCAO.md](CHECKLIST_PRODUCAO.md) - Lista de verificação para ambiente de produção

## Ambientes de Teste e Produção

O sistema suporta ambos os ambientes do Stripe (teste e produção):

- Em desenvolvimento (`NODE_ENV=development`), ele usa as chaves de teste
- Em produção (`NODE_ENV=production`), ele usa as chaves de produção

## Ferramentas de Teste e Diagnóstico

O projeto inclui várias ferramentas para testes e diagnóstico:

- `/webhook-manual` - Ferramenta para testar webhooks manualmente
- `/testar-stripe` - Interface para testar a integração com o Stripe
- `/teste-email` - Ferramenta para testar o envio de emails via Brevo
- `/teste-webhook` - Simulador de webhooks do Stripe para testes

## Secrets Necessários

O projeto requer as seguintes variáveis de ambiente:

### Stripe
- `STRIPE_SECRET_KEY` - Chave secreta de produção do Stripe
- `STRIPE_TEST_SECRET_KEY` - Chave secreta de teste do Stripe
- `STRIPE_WEBHOOK_SECRET` - Chave secreta do webhook do Stripe
- `STRIPE_PRICE_MONTHLY` - ID do preço mensal (produção)
- `STRIPE_PRICE_ANNUAL` - ID do preço anual (produção)
- `STRIPE_PRICE_LIFETIME` - ID do preço vitalício (produção)
- `STRIPE_PRICE_MONTHLY_TEST` - ID do preço mensal (teste)
- `STRIPE_PRICE_ANNUAL_TEST` - ID do preço anual (teste)
- `STRIPE_PRICE_LIFETIME_TEST` - ID do preço vitalício (teste)

### Firebase
- `VITE_FIREBASE_API_KEY` - Chave de API do Firebase
- `VITE_FIREBASE_PROJECT_ID` - ID do projeto Firebase
- `VITE_FIREBASE_APP_ID` - ID do aplicativo Firebase
- `FIREBASE_ADMIN_CREDENTIALS` - Credenciais da conta de serviço (JSON)

### Brevo (Email Marketing)
- `BREVO_API_KEY` - Chave de API do Brevo para emails transacionais