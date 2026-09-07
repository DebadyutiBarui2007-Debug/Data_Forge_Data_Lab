import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

async function startServer() {
  const app = express();
  // Cloud Run injects PORT environment variable. Default to 3000.
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = '0.0.0.0';

  // Basic security and headers middleware for Cloud Run
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // JSON and URL-encoded body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cloud Run & GCP Load Balancer Health Probes
  app.get(['/health', '/api/health', '/liveness', '/readiness'], (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'dataforge-bdh-lab',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime())
    });
  });

  // Example API route namespace for server-side logic
  app.get('/api/info', (req: Request, res: Response) => {
    res.json({
      name: 'DataForge BDH Lab',
      version: '1.0.0',
      description: "Pathway's Dragon Hatchling (BDH) & BDH-CQ Architecture Lab",
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Vite Middleware for Development vs Static Asset Serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[Server] Running in DEVELOPMENT mode with Vite Middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Handle unknown API requests with a clean 404 JSON response before static fallback
    app.use('/api/*', (req: Request, res: Response) => {
      res.status(404).json({ error: 'API route not found' });
    });

    // Static asset serving with cache control headers
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true
      })
    );

    app.use(express.static(distPath, { index: false }));

    // SPA fallback route
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    console.log('[Server] Running in PRODUCTION mode serving static build from:', distPath);
  }

  // Start HTTP listener
  const server = app.listen(PORT, HOST, () => {
    console.log(`[Cloud Run Ready] Server listening on http://${HOST}:${PORT} (PID: ${process.pid})`);
  });

  // Graceful Shutdown for Cloud Run container lifecycle management
  const gracefulShutdown = (signal: string) => {
    console.log(`[Cloud Run Shutdown] Received ${signal}. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('[Cloud Run Shutdown] Closed all remaining active connections. Exiting process.');
      process.exit(0);
    });

    // Force shutdown after 10s if connections remain open
    setTimeout(() => {
      console.error('[Cloud Run Shutdown] Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Fatal Server Startup Error]:', err);
  process.exit(1);
});
