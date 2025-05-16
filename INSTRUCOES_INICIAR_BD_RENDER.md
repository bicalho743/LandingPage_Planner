# Instruções para Inicializar o Banco de Dados no Render

O problema da página em branco foi identificado: a conexão com o banco de dados está funcionando, mas as tabelas necessárias não existem no banco de dados do Neon. 

## Opção 1: Usar o SQL Console do Neon

1. Faça login no [Neon.tech](https://console.neon.tech/)
2. Acesse seu projeto "Planner Organizer Produção"
3. Na barra lateral, clique em "SQL Editor"
4. Copie e cole o conteúdo do arquivo `db-init.sql` gerado
5. Execute o script para criar todas as tabelas

## Opção 2: Usar o psql com URL de Conexão

Se preferir usar a linha de comando:

```bash
# Certifique-se de ter o cliente psql instalado
psql postgres://[seu_usuario]:[sua_senha]@[endpoint-neon]/neondb -f db-init.sql
```

## Opção 3: Adicionar Inicialização Automática no Render

1. No Render, crie um novo serviço do tipo "Background Worker"
2. Use o mesmo repositório do seu aplicativo principal
3. Em "Build Command", use: `npm install`
4. Em "Start Command", use: `psql $DATABASE_URL -f db-init.sql`
5. Adicione as mesmas variáveis de ambiente que você configurou no serviço web

## Depois de Inicializar o Banco de Dados

Após criar as tabelas, redeploy seu aplicativo no Render. O erro "relation users does not exist" desaparecerá, e seu site deve carregar corretamente.

## Verificação

Para confirmar que as tabelas foram criadas corretamente, você pode executar o seguinte SQL no console do Neon:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Este comando listará todas as tabelas públicas no seu banco de dados.