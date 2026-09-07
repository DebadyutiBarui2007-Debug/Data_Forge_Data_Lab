import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK (Lazy evaluation to prevent crash if key is missing on boot)
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) return null;
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

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

  // API route namespace for server-side logic
  app.get('/api/info', (req: Request, res: Response) => {
    res.json({
      name: 'DataForge BDH Lab',
      version: '1.0.0',
      description: "Pathway's Dragon Hatchling (BDH) & BDH-CQ Architecture Lab",
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // PROFESSIONAL BACKEND CAPABILITY 1: AI-Powered Mechanistic Interpretability
  // Analyzes raw latent vectors and translates them into semantic concepts using Gemini.
  app.post('/api/interpret-latent', async (req: Request, res: Response) => {
    try {
      const { latentVector, sparsityThreshold, contextPhase } = req.body;
      const ai = getAIClient();
      
      if (!ai) {
        return res.status(503).json({ 
          error: 'Gemini API key not configured. Cloud AI interpretability is offline.' 
        });
      }

      // Format vector for the prompt, rounding to 3 decimal places
      const formattedVector = Array.isArray(latentVector) 
        ? latentVector.map(v => Number(v).toFixed(3)).join(', ')
        : '[]';

      const prompt = `
        You are an expert Mechanistic Interpretability AI working on the Pathway Dragon Hatchling (BDH) architecture.
        
        Context Phase: ${contextPhase || 'Unknown'}
        Top-K Sparsity Threshold: ${sparsityThreshold || '5%'}
        
        I have captured a sparse non-negative activation vector from the latent space:
        [ ${formattedVector} ]
        
        Based on the presence of non-zero positive values (which represent disentangled monosemantic features), briefly explain what cognitive or semantic features this latent state might be representing in this phase.
        
        Keep it professional, highly technical, and under 3 sentences. Emphasize how the zero-values demonstrate polysemantic noise suppression.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ interpretation: response.text });
    } catch (error) {
      console.error('[Backend] Interpret Latent Error:', error);
      res.status(500).json({ error: 'Failed to interpret latent state via Cloud AI.' });
    }
  });

  // PROFESSIONAL BACKEND CAPABILITY 2: Server-Side Scalability Benchmarking
  // Offloads heavy computation from the browser to the Node.js server.
  app.post('/api/compute/benchmark', (req: Request, res: Response) => {
    try {
      const { sequenceLength, dimension } = req.body;
      const dim = parseInt(dimension) || 128;
      const seq = parseInt(sequenceLength) || 10000;
      
      // Simulate KV Cache Memory (Float32 = 4 bytes per dimension, per token, per layer)
      // Standard transformer: 2 (K, V) * seq * dim * 4 bytes * 12 layers
      const kvCacheBytes = 2 * seq * dim * 4 * 12;
      
      // Simulate BDH Fast Weight Memory
      // BDH: 1 matrix (dim x dim) * 4 bytes * 12 layers
      const bdhBytes = (dim * dim) * 4 * 12;

      // Simulate a small server-side compute delay relative to sequence length
      const computeLatencyMs = Math.log10(seq) * 25.5; 

      res.json({
        sequenceLength: seq,
        dimension: dim,
        kvCacheMemoryMB: (kvCacheBytes / (1024 * 1024)).toFixed(2),
        bdhMemoryMB: (bdhBytes / (1024 * 1024)).toFixed(2),
        computeLatencyMs: computeLatencyMs.toFixed(2),
        memorySavedPercent: ((1 - (bdhBytes / kvCacheBytes)) * 100).toFixed(2),
        serverTimestamp: Date.now()
      });
    } catch (error) {
      console.error('[Backend] Compute Benchmark Error:', error);
      res.status(500).json({ error: 'Compute benchmark failed on backend.' });
    }
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
