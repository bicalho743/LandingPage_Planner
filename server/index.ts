import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import registerRouter from "./register";
import stripeWebhookRouter from "./stripe-webhook";
import syncUsersRouter from "./sync-users";

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
console.log("✅ Routers de registro, webhook do Stripe, e sincronização de usuários adicionados");

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
