# Planner Organiza: página de vendas (landing)

Responda em português, passo a passo e sem jargão. O README.md tem as seções da página e a medição.
Trabalho no PC: ver bicalho743/meu-enxoval-em-dia/docs/CLAUDE-NO-PC.md

## O que é
- **Site** (não é app de loja): React + Vite (TypeScript) com servidor Express (`server/index.ts`).
  Página única em `client/src/pages/LandingPage.tsx`, estilos em `client/src/index.css`.
- Domínio: **plannerorganiza.com.br** (e www). Os botões levam ao sistema em **app.plannerorganiza.com.br**
  (repositório bicalho743/PlannerOrganizer).
- Render: serviço `srv-d0jkn5l6ubrc73aijqgg` (workspace `tea-cvupfb7diees73e9o96g`). **Publica sozinho a cada push na
  `main`**: avise a dona antes, porque vai ao ar na hora.
- Sem RevenueCat, Supabase ou Expo aqui. Medição: Google Analytics e Pixel do Meta em `client/index.html`.

## Rodar
- `npm install` e `npm run dev` (porta do Express). Build de produção: `npm run build` e `npm run start`.
- `GET /api/app-assets` (server/index.ts): lista os arquivos do Streamlit para a landing pré-carregar o app.

## Peças principais
- `client/src/components/TelasReais.tsx`: demonstração com telas reais (Computador · Android · iPhone), 7 passos e o
  PDF real em 6 cores. Imagens em `client/public/telas/` (app_*, web_*, pdf_*.webp).
- Fotos de fundo das seções: `client/public/secao-*.jpg` (Unsplash). Vídeos: `client/public/videos/` e o tour de
  1min30 (deitado e em pé).
- Abertura do app: `preaquecerApp` (baixa os arquivos do app antes) e o aviso "Abrindo o seu Planner…" ao tocar.
- Todos os botões de cadastro abrem as boas-vindas completas do app (decisão da dona, 25/11/2026).
- Como as telas reais e o vídeo são gerados: PlannerOrganizer/scripts/telas_reais/LEIAME.md.

## Onde paramos (26/11/2026)
- Tudo publicado na `main` (igual à branch `claude/dreamy-bohr-1tib91`). Nada em andamento.
- Planos na página já com os preços de 23/11/2026: mensal R$ 59,90, trimestral R$ 149,90 e anual R$ 479,90.
  (O README ainda cita os antigos R$ 39,90 / R$ 199,90: vale o código.)
- Páginas /indique e /indique/termos (programa de afiliadas, 25% por 12 meses) estão no ar.
