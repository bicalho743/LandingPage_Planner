# PlannerPro Organizer

Uma plataforma completa de organização pessoal com sistema de assinatura usando Stripe e autenticação via Firebase.

## Funcionalidades

- Landing page com apresentação do produto
- Sistema de planos de assinatura (Mensal, Anual e Vitalício)
- Integração com Stripe para pagamentos
- Autenticação de usuários via Firebase
- Dashboard para gerenciamento de tarefas

## Tecnologias Utilizadas

- Frontend: React com Tailwind CSS e shadcn/ui
- Backend: Node.js com Express
- Banco de Dados: PostgreSQL com Drizzle ORM
- Pagamentos: Stripe
- Autenticação: Firebase Authentication

## Como Executar o Projeto

### Iniciar o Servidor

O servidor usa um sistema de detecção automática de portas. Se a porta 5000 estiver ocupada, ele tentará a próxima porta disponível.

```bash
npm run dev
```

### Configurar Webhooks do Stripe (Desenvolvimento)

Para testar o webhook do Stripe localmente, você pode usar o script fornecido:

```bash
# Tornar o script executável (necessário apenas uma vez)
chmod +x start-stripe.sh

# Executar o script
node run-stripe-webhook.js
```

O script detectará automaticamente a porta em que o servidor está rodando (entre 5000 e 5100) e iniciará o Stripe CLI, encaminhando eventos para o endpoint correto.

### Ambientes de Teste e Produção

O sistema suporta ambos os ambientes do Stripe (teste e produção):

- Em desenvolvimento, ele usa as chaves de teste e IDs de preço de teste
- Em produção, ele usa as chaves de produção e IDs de preço de produção

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