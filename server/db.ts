import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

// Define the DATABASE_URL for Render
process.env.DATABASE_URL = 'postgresql://planner_user:senha_segura@db-planner-organizer.onrender.com:5432/PlannerOrganizer_db';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configura o pool de conexão com o PostgreSQL no Render
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Para evitar erros de SSL com o Render
  }
});

export const db = drizzle(pool, { schema });