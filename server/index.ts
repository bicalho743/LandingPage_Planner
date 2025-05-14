import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import registerRouter from "./register";
import stripeWebhookRouter from "./stripe-webhook";
import syncUsersRouter from "./sync-users";
import migrationsRouter from "./migrations";
import trialRouter from "./trial";
import { pool } from "./db";

const app = express();

// Webhook configurado para aceitar payload RAW
// IMPORTANTE: Este middleware deve vir ANTES de express.json()
console.log("✅ Configurando middleware raw para Stripe webhook");
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

// Outros middlewares para parsing de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Registrando os novos routers
app.use(registerRouter);
app.use(stripeWebhookRouter);
app.use(syncUsersRouter);
app.use(migrationsRouter);
app.use(trialRouter);
console.log("✅ Routers de registro, webhook do Stripe, sincronização de usuários, trial e migração adicionados");

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Função para aplicar migrações automaticamente
  async function applyMigrations() {
    try {
      console.log('⏳ Aplicando migrações do banco de dados...');
      
      // 1. Verificar se a coluna 'status' existe na tabela 'users'
      const checkStatusColumn = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
      `;
      
      const statusExists = await pool.query(checkStatusColumn);
      
      if (statusExists.rows.length === 0) {
        console.log('⏳ Adicionando coluna status à tabela users...');
        // Adicionar coluna status
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente'
        `);
        console.log('✅ Coluna status adicionada com sucesso!');
      } else {
        console.log('✅ Coluna status já existe na tabela users.');
      }
      
      // 2. Verificar se a coluna 'senha_hash' existe na tabela 'users'
      const checkSenhaHashColumn = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'senha_hash'
      `;
      
      const senhaHashExists = await pool.query(checkSenhaHashColumn);
      
      if (senhaHashExists.rows.length === 0) {
        console.log('⏳ Adicionando coluna senha_hash à tabela users...');
        // Adicionar coluna senha_hash
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN senha_hash TEXT DEFAULT ''
        `);
        console.log('✅ Coluna senha_hash adicionada com sucesso!');
      } else {
        console.log('✅ Coluna senha_hash já existe na tabela users.');
      }
      
      console.log('✅ Migrações aplicadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao aplicar migrações:', error);
    }
  }

  // Aplicar migrações antes de iniciar o servidor
  await applyMigrations();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Função para encontrar uma porta livre automaticamente
  let port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`🚨 Porta ${port} já está em uso. Tentando porta ${port + 1}...`);
      port++;
      server.listen(port, "0.0.0.0");
    } else {
      console.error("❌ Erro ao iniciar o servidor:", err);
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Servidor rodando na porta ${port}`);
  });
})();
