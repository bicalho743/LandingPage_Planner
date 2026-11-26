# Planner Organiza: landing e cadastro (plannerorganiza.com.br)

Responda em português, passo a passo e sem jargão.

Trabalho no PC: ver bicalho743/meu-enxoval-em-dia/docs/CLAUDE-NO-PC.md

## O que é
- **Tipo:** site React (Vite, `client/`) com servidor Node/Express (`server/`). Não é app de loja (o app fica em
  `bicalho743/planner-app`; a API e o sistema web em `bicalho743/PlannerOrganizer`).
- **Publicação:** Render, serviço `plannerorganiza` (`render.yaml`: `npm run build` e `npm run start`). Conferir no
  painel do Render se o autoDeploy está ligado antes de mexer na `main`.
- **E-mails:** pelo Brevo. API em `server/brevo.ts` (remetente) e SMTP em `server/routes.ts` (e-mail de boas-vindas).
- **Banco:** Postgres no Neon (`DATABASE_URL`). Pagamento: Stripe. Login: Firebase.
- Expo, Codemagic, RevenueCat e lojas: não se aplicam a este repositório.

## Textos e artes
- Páginas em `client/src/pages/` (Suporte, ExcluirConta, cancelado etc.) e componentes em `client/src/components/`.
- Vídeos e imagens da demonstração em `client/public/`.

## Onde paramos (26/11/2026)
- **URGENTE: senha do banco exposta.** `server/db.ts` (linha 8) e alguns `.md` de instruções do Render trazem a
  `DATABASE_URL` do Neon com a senha, e o repositório é **público**. Falta: trocar a senha no Neon, colocar a nova só
  na variável `DATABASE_URL` do Render e tirar a senha do código (ela continua no histórico do Git, por isso a troca é
  obrigatória).
- **Remetente novo dos e-mails:** branch `claude/remetente-candeiatec` (fora da `main`) troca o remetente de
  `contato@plannerorganiza.com.br` (API) e `suporte@plannerpro.com` (SMTP, domínio que não é nosso) para
  `contato@candeiatec.com.br`. **Só levar para a `main` depois** de o remetente estar verificado no Brevo (e, de
  preferência, o domínio candeiatec.com.br autenticado), senão os e-mails param.
- **19/11:** contatos públicos (Suporte, Excluir conta, rodapé, cancelamento, formulário) trocados para
  `contato@candeiatec.com.br`; saíram e-mails de modelo de outros domínios.
- **Brevo pela API:** a chave salva na nuvem foi recusada ("Key not found"); provavelmente era a chave SMTP
  (`xsmtpsib-`) e não a de API (`xkeysib-`). No PC, usar o site do Brevo pelo Chrome.
- **Decisões pendentes:** autenticar candeiatec.com.br no Brevo; quando publicar o remetente novo.

## Regras
- Repositório público: nunca colocar chaves, senhas ou dados de clientes.
- Mudança na `main` pode ir ao ar na hora (Render): avisar antes.
