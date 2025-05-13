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

// Configuração inicial do cliente de banco de dados
let dbClient = pool;

// Função assíncrona para teste de conexão com fallback
async function setupDatabaseConnection() {
  try {
    console.log("⏳ Testando conexão com o PostgreSQL no Render...");
    
    // Definimos um timeout para a consulta de teste
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout ao conectar com PostgreSQL no Render")), 8000);
    });
    
    // Executamos a consulta com timeout
    try {
      await Promise.race([
        pool.query('SELECT 1'),
        timeoutPromise
      ]);
      
      console.log("✅ Conectado com sucesso ao PostgreSQL no Render!");
      dbClient = pool;
      return;
    } catch (err: any) {
      console.error(`❌ Falha ao conectar ao PostgreSQL no Render: ${err.message}`);
      console.log("⏳ Tentando usar Neon.tech como fallback...");
    }
    
    // Se chegou aqui, a conexão com Render falhou, tentando Neon
    if (!NEON_DB_URL) {
      console.error("❌ URL do Neon não configurada! Não é possível usar fallback.");
      // Continuamos usando o pool original mesmo com erro
      return;
    }
    
    try {
      console.log("⏳ Inicializando conexão com Neon.tech...");
      const neonPool = new NeonPool({ connectionString: NEON_DB_URL });
      
      // Teste rápido na conexão do Neon
      await neonPool.query('SELECT 1');
      
      console.log("✅ Conectado com sucesso ao Neon.tech!");
      dbClient = neonPool;
    } catch (neonErr: any) {
      console.error(`❌ Falha também ao conectar com Neon.tech: ${neonErr.message}`);
      console.log("⚠️ Usando o pool do Render mesmo com problemas de conexão");
      // Mantém o pool original, mesmo com erro
    }
  } catch (setupErr) {
    console.error("❌ Erro crítico na configuração do banco de dados:", setupErr);
  }
}

// Inicia a tentativa de conexão, mas não espera por ela para evitar bloqueio no startup
setupDatabaseConnection().catch(err => {
  console.error("❌ Erro não tratado na configuração do banco de dados:", err);
});

export const db = drizzle(dbClient, { schema });