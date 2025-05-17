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

// Função para criar um novo pool de conexão
function createPool() {
  return new Pool({
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
    max: isProduction ? 10 : 5, // Reduzido para evitar sobrecarga
    min: isProduction ? 2 : 1,  // Mínimo de conexões em produção
    idleTimeoutMillis: isProduction ? 30000 : 10000 // Timeout de conexões ociosas
  });
}

// Cria o pool inicial
export let pool = createPool();

// Monitora eventos do pool de conexões
pool.on('error', (err: any, client) => {
  console.error('Erro inesperado no cliente PostgreSQL:', err);
  
  // Se o erro for de terminação por comando do administrador ou conexão perdida
  if (err.code === '57P01' || err.code === '08006' || err.code === '08001' || err.code === '08004') {
    console.log('Tentando reconectar ao banco de dados...');
    
    // Fecha o pool atual
    pool.end().catch((endErr: Error) => {
      console.error('Erro ao encerrar o pool:', endErr.message);
    });
    
    // Cria um novo pool após um pequeno delay
    setTimeout(() => {
      pool = createPool();
      testConnection();
    }, 5000);
  }
});

// Função para testar a conexão
function testConnection() {
  return pool.query('SELECT 1')
    .then(() => {
      console.log("✅ Conectado com sucesso ao PostgreSQL!");
      return true;
    })
    .catch(err => {
      console.error(`❌ Falha ao conectar ao PostgreSQL: ${err.message}`);
      return false;
    });
}

// Testa a conexão inicial
testConnection();

// Cria uma instância do Drizzle
export let db = drizzle(pool, { schema });

// Função para atualizar a instância do Drizzle após reconexão
export function updateDrizzleInstance() {
  db = drizzle(pool, { schema });
  return db;
}