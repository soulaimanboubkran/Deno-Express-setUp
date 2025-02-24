// @deno-types="npm:@types/express@4"
import express, { NextFunction, Request, Response } from "npm:express";
import cors from "npm:cors";
import helmet from 'npm:helmet';
import rateLimit from 'npm:express-rate-limit';
import morgan from 'npm:morgan';
import { testDatabaseConnection, pool, closePool } from './db/client.ts';

const app = express();

// Initialize database connection
await testDatabaseConnection().catch(err => {
  console.error('Failed to connect to database:', err);
  // Continue running the app even if initial DB connection fails
});

// Basic middleware setup
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Custom request logger
const reqLogger = function (req: Request, _res: Response, next: NextFunction) {
  console.log(`${req.method} request to "${req.url}" by ${req.hostname}`);
  next();
};
app.use(reqLogger);

const port: number = Number(Deno.env.get("APP_PORT")) || 3000;

// Routes
app.get("/", (_req: Request, res: Response): void => {
  res.send("Hello from Deno and Express!");
});

// Health check endpoint with improved error handling
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const result = await pool.queryObject('SELECT NOW()');
    res.status(200).json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0]
    });
  } catch (err) {
    console.error('Database health check failed:', err);
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Generic error handler middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: Deno.env.get('NODE_ENV') === 'development' ? err.message : 'Something went wrong!'
  });
});

// Graceful shutdown handler
async function handleShutdown() {
  console.log("\nReceived shutdown signal...");
  
  try {
    await closePool();
    console.log("Database connections closed.");
    
    server.close(() => {
      console.log("HTTP server closed.");
      Deno.exit(0);
    });

    // Force exit if server hasn't closed in 5 seconds
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      Deno.exit(1);
    }, 5000);
  } catch (err) {
    console.error("Error during shutdown:", err);
    Deno.exit(1);
  }
}

// Only add SIGINT listener (Ctrl+C) for Windows compatibility
Deno.addSignalListener("SIGINT", handleShutdown);

// Start server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});