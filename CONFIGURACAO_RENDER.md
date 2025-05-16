# Configuração do Deploy no Render

Para garantir que a aplicação funcione corretamente no Render, siga estas instruções de configuração:

## 1. Configuração do Banco de Dados

No painel do Render, adicione as seguintes variáveis de ambiente:

```
DATABASE_URL=postgres://AcessoPlanner_owner:***@ep-bold-dream-a5zrfji-pooler.us-east-2.aws.neon.tech/AcessoPlannerTailwind
PGHOST=ep-bold-dream-a5zrfji-pooler.us-east-2.aws.neon.tech
PGUSER=AcessoPlanner_owner
PGPASSWORD=sua_senha_aqui
PGDATABASE=AcessoPlannerTailwind
PGPORT=5432
```

Certifique-se de substituir `sua_senha_aqui` pela senha real do seu banco de dados.

## 2. Configuração do Firebase

Adicione também as seguintes variáveis de ambiente para o Firebase:

```
FIREBASE_ADMIN_CREDENTIALS=json_stringificado_das_credenciais
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_PROJECT_ID=seu_project_id
```

## 3. Configuração do Stripe

Adicione as credenciais do Stripe:

```
STRIPE_PUBLIC_KEY=sua_chave_publica
STRIPE_SECRET_KEY=sua_chave_secreta
STRIPE_WEBHOOK_SECRET=seu_webhook_secret
VITE_STRIPE_PUBLIC_KEY=sua_chave_publica
STRIPE_PRICE_MONTHLY=seu_preco_mensal
STRIPE_PRICE_ANNUAL=seu_preco_anual
STRIPE_PRICE_LIFETIME=seu_preco_lifetime
```

## 4. Configuração do Brevo

```
BREVO_API_KEY=sua_chave_api
```

## 5. Node Environment

```
NODE_ENV=production
```

## 6. Configuração do Build

Em "Build Command", use:

```
npm install; npm run build
```

Em "Start Command", use:

```
npm run start
```

---

Após configurar todas estas variáveis de ambiente, reimplante a aplicação para que as mudanças tenham efeito.

Se ainda encontrar problemas, verifique os logs do Render para diagnóstico adicional.