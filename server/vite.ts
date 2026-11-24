import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Prévia de link (WhatsApp, Instagram, Facebook): os robôs não rodam o React, então leem as tags og:
  // direto do HTML. A página /indique recebe título, descrição e imagem próprios.
  const indexPath = path.resolve(distPath, "index.html");
  const htmlIndique = fs.readFileSync(indexPath, "utf-8")
    .replace(/<title>[^<]*<\/title>/, "<title>Indique e ganhe 25% · Planner Organiza</title>")
    .replace(/(<meta property="og:title" content=")[^"]*/, "$1Indique o Planner e ganhe 25% por 12 meses")
    .replace(/(<meta property="og:description" content=")[^"]*/, "$1Programa de afiliadas: 25% de cada pagamento da indicada, por Pix todo mês. Quem usa o seu código ganha 10% off no plano anual.")
    .replace(/(<meta property="og:url" content=")[^"]*/, "$1https://plannerorganiza.com.br/indique")
    .replace(/(<meta property="og:image" content=")[^"]*/, "$1https://plannerorganiza.com.br/og-indique.jpg?v=1")
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, "$1Programa de afiliadas do Planner Organiza: ganhe 25% por 12 meses");
  app.get(/^\/indique\/?$/, (_req, res) => {
    res.type("html").send(htmlIndique);
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}
