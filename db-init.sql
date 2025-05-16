-- Script para criar as tabelas necessárias no banco de dados

-- Criação de tipos enumerados (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('monthly', 'annual', 'lifetime');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pendente', 'ativo', 'bloqueado');
    END IF;
END
$$;

-- Tabela users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  firebase_uid TEXT,
  status user_status DEFAULT 'pendente',
  senha_hash TEXT DEFAULT '',
  data_cadastro TIMESTAMP DEFAULT NOW(),
  trial_start TIMESTAMP,
  trial_end TIMESTAMP
);

-- Tabela subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  status subscription_status DEFAULT 'active',
  inicio_assinatura TIMESTAMP DEFAULT NOW(),
  fim_assinatura TIMESTAMP,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  last_payment TIMESTAMP
);

-- Tabela leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  data_cadastro TIMESTAMP DEFAULT NOW(),
  convertido BOOLEAN DEFAULT FALSE
);

-- Tabela contacts
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT NOT NULL,
  data_envio TIMESTAMP DEFAULT NOW()
);

-- Tabela tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_conclusao TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);