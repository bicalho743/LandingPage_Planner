import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import ws from 'ws';

const { Pool } = pg;

// Mantém o suporte ao Neon como fallback
neonConfig.webSocketConstructor = ws;

// Define as duas opções de conexão (Render e Neon)
const RENDER_DB_URL = 'postgresql://planner_user:senha_segura@db-planner-organizer.onrender.com:5432/PlannerOrganizer_db';
const NEON_DB_URL = process.env.DATABASE_URL || '';

// Verifica se temos uma URL de banco de dados válida
if (!RENDER_DB_URL && !NEON_DB_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Tentando conectar ao banco de dados PostgreSQL no Render...");

// Configura o pool de conexão primário com o PostgreSQL no Render
export const pool = new Pool({
  connectionString: RENDER_DB_URL,
  ssl: {
    rejectUnauthorized: false // Para evitar erros de SSL com o Render
  },
  connectionTimeoutMillis: 10000, // 10 segundos timeout
  query_timeout: 10000,
  statement_timeout: 10000
});

// Teste a conexão e configure o fallback se necessário
let dbClient;
let useNeonFallback = false;

try {
  // Teste rápido de conexão com o Render
  pool.query('SELECT 1')
    .then(() => {
      console.log("✅ Conectado com sucesso ao PostgreSQL no Render!");
      useNeonFallback = false;
    })
    .catch((err) => {
      console.error("❌ Erro ao conectar ao PostgreSQL no Render:", err.message);
      useNeonFallback = true;
      console.log("Usando fallback para Neon.tech...");
    });
  
  // Inicialmente, usamos o pool do Render
  dbClient = pool;
} catch (err) {
  console.error("❌ Erro ao configurar pool do Render:", err.message);
  useNeonFallback = true;
}

// Se estiver usando fallback para Neon
if (useNeonFallback && NEON_DB_URL) {
  console.log("Usando banco de dados Neon.tech como fallback");
  const neonPool = new NeonPool({ connectionString: NEON_DB_URL });
  dbClient = neonPool;
}

export const db = drizzle(dbClient, { schema });