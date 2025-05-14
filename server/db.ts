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

const isProduction = process.env.NODE_ENV === 'production';
console.log(`Conectando ao banco de dados PostgreSQL (Ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'})...`);

// Configura o pool de conexão com o PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Para evitar erros de SSL com serviços remotos
  },
  // Configurações otimizadas por ambiente
  connectionTimeoutMillis: isProduction ? 60000 : 30000, // Timeout maior em produção
  query_timeout: isProduction ? 60000 : 30000,
  statement_timeout: isProduction ? 60000 : 30000,
  idle_in_transaction_session_timeout: isProduction ? 60000 : 30000,
  // Pool de conexões otimizado para produção
  max: isProduction ? 20 : 10, // Mais conexões em produção
  min: isProduction ? 5 : 2,  // Mínimo de conexões em produção
  idleTimeoutMillis: isProduction ? 30000 : 10000 // Timeout de conexões ociosas
});

// Monitora eventos do pool de conexões
pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente PostgreSQL:', err);
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