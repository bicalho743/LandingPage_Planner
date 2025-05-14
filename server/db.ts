import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

// Verifica se temos uma URL de banco de dados válida
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Conectando ao banco de dados PostgreSQL...");

// Configura o pool de conexão com o PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Para evitar erros de SSL com serviços remotos
  },
  // Configurações para evitar timeout durante desenvolvimento
  connectionTimeoutMillis: 30000, // 30 segundos timeout
  query_timeout: 30000,
  statement_timeout: 30000,
  idle_in_transaction_session_timeout: 30000
});

// Teste de conexão
pool.query('SELECT 1')
  .then(() => {
    console.log("✅ Conectado com sucesso ao PostgreSQL!");
  })
  .catch(err => {
    console.error(`❌ Falha ao conectar ao PostgreSQL: ${err.message}`);
  });

// Exporta a conexão do Drizzle
export const db = drizzle(pool, { schema });