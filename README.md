# Planner Organiza: página de vendas

Página de vendas do **Planner Organiza** em **plannerorganiza.com.br** (e `www`). Quem clica em "Começar grátis"
ou "Entrar" vai para o sistema em **app.plannerorganiza.com.br**, onde ficam o cadastro, o teste grátis de 7 dias e a
assinatura (Stripe). A arquitetura completa e as pendências gerais estão no README de `bicalho743/PlannerOrganizer`.

> Atualizado em novembro de 2026.

## Tecnologia

- React + Vite (TypeScript), página única em `client/src/pages/LandingPage.tsx`, estilos em `client/src/index.css`.
- Servidor Express (`server/index.ts`): entrega a página, força HTTPS e redireciona `promo.plannerorganiza.com.br`
  para o domínio principal (301), mantendo os parâmetros dos anúncios.
- Render: serviço `Pagina_de_vendas_planner`, publica sozinho a cada envio ao `main`.

## O que a página tem

| Seção | Detalhe |
|---|---|
| Topo | título que muda conforme o anúncio (`?tema=retorno|preco|financeiro|mei|agenda`), cadastro com e-mail, botões **Google Play** e **App Store** |
| Dores e tour em vídeo | vídeo em pé no celular e deitado no computador |
| Como funciona | 5 passos com **vídeos de tela do app** em moldura de celular (`client/public/videos/`), que tocam só quando aparecem |
| Funcionalidades e prévia da proposta | |
| Antes e depois | |
| Nossos compromissos | 7 dias grátis, suporte humano, LGPD, cancelamento sem multa; convite para contar a experiência (no lugar dos depoimentos, até haver relatos reais) |
| Planos | mensal R$ 39,90 e anual R$ 297, com o cupom ORGANIZA |
| Baixe o app | Android (Google Play) e iPhone (App Store) |
| Dúvidas | perguntas frequentes e WhatsApp |
| Rodapé | chamada final, termos, privacidade, suporte |

Páginas extras: **/suporte** (contato e respostas rápidas; é a URL de suporte nas lojas).

## Medição

- Google Analytics e Pixel do Meta (`client/index.html`). Cliques em cadastro, Google Play, App Store, WhatsApp e
  "Contar minha experiência" viram eventos (`rastrear()` em `LandingPage.tsx`).
- A origem da visita (tema do anúncio e UTMs) segue junto para o cadastro no sistema.

## Rodar e publicar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/ (página e servidor)
npm run start    # produção
```

O servidor pede `STRIPE_SECRET_KEY` e `DATABASE_URL` para subir (rotas antigas de checkout; a assinatura atual é
feita no sistema web).

## Pendências da página

- [ ] Depoimentos reais (com autorização) no lugar de "Nossos compromissos".
- [ ] Remover `promo` do Render e da Locaweb depois que os anúncios apontarem para o domínio principal.
- [ ] Limpar rotas e páginas antigas do servidor (checkout próprio, testes de webhook) que não são mais usadas.
