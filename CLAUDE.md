# Planner Organiza: página de vendas (site)

Responda em português, passo a passo e sem jargão. O README.md tem as seções da página em detalhe.

Trabalho no PC: ver bicalho743/meu-enxoval-em-dia/docs/CLAUDE-NO-PC.md (guia de migração para o Claude Code do PC Windows "Notebook_Solano").

## Tipo e ids
- **Site** React + Vite (TypeScript) com servidor Express (`server/index.ts`). Página única em
  `client/src/pages/LandingPage.tsx`, estilos em `client/src/index.css`. Não tem app de loja (o app é bicalho743/planner-app;
  o sistema e a API são bicalho743/PlannerOrganizer).
- Domínio: plannerorganiza.com.br (e www); `promo.plannerorganiza.com.br` redireciona (301) para o domínio principal.
- Render: serviço `Pagina_de_vendas_planner` = srv-d0jkn5l6ubrc73aijqgg (workspace tea-cvupfb7diees73e9o96g),
  **publica sozinho a cada push na `main`**. Avise sempre que mudar algo, pois vai ao ar na hora.
- Variáveis no Render (só os nomes): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY/ANNUAL/LIFETIME
  (e as _TEST), DATABASE_URL, FIREBASE_ADMIN_CREDENTIALS, BREVO_API_KEY, SMTP_USER, SMTP_PASS; no build VITE_FIREBASE_*.
- Firebase: `planner-organizer-68a23`. Codemagic, Expo, RevenueCat e Supabase: não usa.

## Rodar e publicar
- `npm install` e `npm run dev` (local); `npm run build` gera `dist/`. Publicar = push na `main` (Render faz o resto).
- Trabalhe numa branch e leve para a `main` quando estiver conferido no celular e no computador.

## Textos e artes
- Imagens e vídeos da página: `client/public/` (vídeos de tela em `client/public/videos/`). Prints da landing e imagens
  de origem: bicalho743/planner-app, pasta `marketing/site/`.
- Prévia de link (WhatsApp/redes): tags og no topo do `<head>` e prévia própria para `/indique`.

## Onde paramos (26/11/2026)
- **No ar (25/11):** telas reais (app Android/iPhone e site) na demonstração e no Como funciona; vídeo de 1min30 refeito;
  topo com fotos de ambientes se alternando; "Entrar" abre as boas-vindas do app e "Já tem conta? Entrar" vai ao login.
- **Nada em andamento** (main limpa em fd84730).
- **Decidir:** o README ainda diz planos R$ 39,90 / R$ 199,90; o app registra preços novos desde 23/11 (mensal R$ 59,90,
  trimestral R$ 149,90, anual R$ 479,90) e a indicação usa anual R$ 429,90 (24/11). Conferir o que a página mostra e
  atualizar o README.
