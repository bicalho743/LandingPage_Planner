# Checklist para Ambiente de Produção

Use esta lista para verificar se todas as etapas necessárias para o ambiente de produção foram concluídas.

## Configuração das Chaves API

### Stripe
- [ ] Chave secreta de produção (`STRIPE_SECRET_KEY`) configurada
- [ ] Chave pública de produção (`STRIPE_PUBLIC_KEY`) configurada
- [ ] ID do preço mensal (`STRIPE_PRICE_MONTHLY`) configurado
- [ ] ID do preço anual (`STRIPE_PRICE_ANNUAL`) configurado
- [ ] ID do preço vitalício (`STRIPE_PRICE_LIFETIME`) configurado
- [ ] Webhook do Stripe configurado no painel do Stripe
- [ ] Chave secreta do webhook (`STRIPE_WEBHOOK_SECRET`) configurada

### Firebase
- [ ] Credenciais do Admin SDK (`FIREBASE_ADMIN_CREDENTIALS`) configuradas
- [ ] Chave de API do Firebase (`VITE_FIREBASE_API_KEY`) configurada
- [ ] ID do projeto Firebase (`VITE_FIREBASE_PROJECT_ID`) configurado
- [ ] ID do aplicativo Firebase (`VITE_FIREBASE_APP_ID`) configurado
- [ ] Domain do Replit adicionado à lista de domínios autorizados no Firebase

### Brevo (Email Marketing)
- [ ] Chave de API do Brevo (`BREVO_API_KEY`) configurada
- [ ] Lista de contatos no Brevo criada e ID verificado

## Ambiente de Produção

- [ ] `NODE_ENV` configurado como `production`
- [ ] Verificado que o código seleciona corretamente as chaves de produção
- [ ] Build de produção executado com sucesso
- [ ] Servidor inicia corretamente no modo de produção

## Funcionalidades em Produção

- [ ] Página inicial carrega corretamente
- [ ] Registro de usuário funciona
- [ ] Checkout do Stripe funciona com cartões de teste
- [ ] Webhook do Stripe recebe eventos corretamente
- [ ] Usuários são criados no Firebase após pagamento
- [ ] Emails são enviados via Brevo após registro/pagamento
- [ ] Login funciona corretamente com usuários recém-criados
- [ ] Sistema de assinaturas e trial funciona conforme esperado

## Testes de Integração

- [ ] Executado script completo de testes de integração (`./run-integration-tests.sh`)
- [ ] Verificada integração com banco de dados PostgreSQL
- [ ] Verificada integração com Stripe (API e Webhooks)
- [ ] Verificada integração com Firebase Authentication
- [ ] Verificada integração com Brevo para emails
- [ ] Testado fluxo completo de registro, pagamento e acesso
- [ ] Testado fluxo de trial com período de 7 dias
- [ ] Documentados os resultados dos testes

## Segurança

- [ ] Não há senhas ou chaves API hard-coded no código
- [ ] Todas as variáveis de ambiente sensíveis são carregadas de secrets
- [ ] Verificado que os webhooks validam a assinatura do Stripe
- [ ] Certificado SSL está em vigor (https)

## Monitoramento

- [ ] Alertas configurados para falhas de pagamento
- [ ] Logs do servidor acessíveis para diagnóstico
- [ ] Monitoramento de erros configurado

## Documentação

- [ ] `PRODUCAO.md` - Guia geral para produção
- [ ] `DEPLOY_REPLIT.md` - Instruções específicas para deploy no Replit
- [ ] `STRIPE_WEBHOOK.md` - Guia para configuração do webhook