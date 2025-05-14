# Testes de Integração do PlannerPro

Este documento explica como executar e interpretar os testes de integração para garantir que o PlannerPro esteja corretamente configurado e integrado com todos os serviços de terceiros.

## Pré-requisitos

Antes de executar os testes, certifique-se de que:

1. Você possui todas as variáveis de ambiente corretamente configuradas
2. O build do projeto foi realizado com sucesso
3. Você está testando no ambiente correto (desenvolvimento ou produção)

## Scripts de Teste Disponíveis

### Teste Completo do Sistema

Para executar todos os testes de integração de uma vez:

```bash
./run-integration-tests.sh
```

Este script interativo permite escolher quais testes executar:
- Todos os testes
- Apenas testes do Stripe
- Apenas testes do Firebase
- Apenas testes do Brevo
- Apenas testes de banco de dados

### Testes Individuais

Se preferir executar testes específicos separadamente:

1. **Testes gerais do sistema**:
   ```bash
   ./integration-tests.sh
   ```

2. **Testes do Stripe**:
   ```bash
   NODE_ENV=production node test-stripe-integration.js
   ```

3. **Testes do Firebase**:
   ```bash
   NODE_ENV=production node test-firebase-integration.js
   ```

4. **Testes do Brevo (Email)**:
   ```bash
   NODE_ENV=production node test-brevo-integration.js
   ```

## Interpretando os Resultados

### Indicadores Visuais

- ✅ Verde: Teste foi bem-sucedido
- ⚠️ Amarelo: Aviso ou possível problema
- ❌ Vermelho: Falha no teste

### Ordem de Prioridade de Erros

Se você encontrar falhas nos testes, recomendamos resolvê-las na seguinte ordem:

1. **Banco de Dados**: Problemas no banco de dados afetam todo o sistema
2. **Firebase**: Problemas de autenticação impedem o acesso ao sistema
3. **Stripe**: Problemas de pagamento impedem novos clientes
4. **Brevo**: Problemas de email podem afetar a comunicação, mas não impedem o uso do sistema

## Testes Manuais Adicionais

Além dos testes automatizados, recomendamos realizar os seguintes testes manuais:

### Fluxo de Checkout

1. Acesse a landing page
2. Escolha um plano e clique para assinar
3. Complete o checkout usando um cartão de teste do Stripe
   - Para sucesso: 4242 4242 4242 4242
   - Para testar falha: 4000 0000 0000 0002
4. Verifique se recebeu o email de confirmação
5. Tente fazer login com a conta criada

### Fluxo de Trial

1. Escolha um plano com período de trial
2. Complete o checkout
3. Verifique se o acesso é concedido imediatamente
4. Verifique os logs para confirmar que o período de trial foi configurado corretamente

### Webhook do Stripe

Para testar o webhook do Stripe manualmente:

1. Acesse o Dashboard do Stripe > Desenvolvedores > Webhooks
2. Selecione o webhook do ambiente que está testando
3. Clique em "Send test webhook"
4. Selecione o evento "checkout.session.completed"
5. Envie o evento e monitore os logs do servidor

## Solução de Problemas Comuns

### Problemas de Conexão com o Banco de Dados

- Verifique se a variável `DATABASE_URL` está corretamente configurada
- Certifique-se de que o banco de dados está acessível a partir do servidor
- Verifique se as credenciais estão corretas

### Problemas de Autenticação do Firebase

- Verifique se `FIREBASE_ADMIN_CREDENTIALS` contém o JSON completo e válido
- Confirme que o domínio do seu aplicativo está na lista de domínios autorizados no Firebase
- Verifique se as credenciais têm permissões suficientes

### Problemas com o Stripe

- Verifique se você está usando a chave API correta para o ambiente (teste/produção)
- Confirme que os IDs de preço estão corretamente configurados
- Verifique se o webhook está configurado com a URL correta e a assinatura secreta

### Problemas com o Brevo

- Verifique se a chave de API tem permissões suficientes
- Confirme se o domínio do remetente está verificado

## Logs e Monitoramento

Durante os testes, monitore os logs do servidor para identificar problemas específicos:

```bash
NODE_ENV=production node dist/index.js
```

## Após os Testes

Após concluir os testes com sucesso, recomendamos:

1. Atualizar o arquivo CHECKLIST_PRODUCAO.md marcando os itens testados
2. Fazer um backup do banco de dados antes de prosseguir com o deploy final
3. Documentar quaisquer etapas adicionais necessárias para o seu ambiente específico