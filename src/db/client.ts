import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { drizzle } from 'npm:drizzle-orm/node-postgres';
import * as schema from './schema.ts';
import dotenv from 'npm:dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'];
for (const envVar of requiredEnvVars) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create a PostgreSQL connection pool with TCP connection settings
export const pool = new Pool({
  user: Deno.env.get('POSTGRES_USER'),
  password: Deno.env.get('POSTGRES_PASSWORD'),
  database: Deno.env.get('POSTGRES_DB'),
  hostname: 'localhost', // Use hostname instead of host
  port: parseInt(Deno.env.get('POSTGRES_PORT') || '5432'),
  tls: false, // Disable TLS for local development
}, 10);

// Initialize Drizzle ORM with the connection pool and schema
export const db = drizzle(pool, { schema });

// Enhanced database connection test
export const testDatabaseConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.queryObject('SELECT version()');
    console.log('Successfully connected to PostgreSQL:', result.rows[0]);
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  } finally {
    if (client) {
      try {
        await client.release();
      } catch (releaseErr) {
        console.error('Error releasing client:', releaseErr);
      }
    }
  }
};

// Graceful shutdown function
export const closePool = async () => {
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (err) {
    console.error('Error closing database pool:', err);
    throw err;
  }
};