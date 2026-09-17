import express from 'express';
import cors, { type CorsOptions } from 'cors';
import { tasksRouter } from './routes/tasks.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { isSupabaseConfigured } from './lib/supabase.js';

function corsOrigin(): CorsOptions['origin'] {
  const raw = process.env.CLIENT_ORIGIN?.trim();
  if (!raw) return 'http://localhost:5173';
  if (raw === '*') return '*';
  // Acepta la URL con o sin "/" final
  return raw.split(',').map((origin) => origin.trim().replace(/\/+$/, ''));
}

const app = express();

app.use(cors({ origin: corsOrigin() }));
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
  res.json({ name: 'Gestor de Tareas API', endpoints: ['/api/health', '/api/tasks'] });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: isSupabaseConfigured() ? 'configured' : 'missing-env' });
});

app.use('/api/tasks', tasksRouter);

app.use(notFound);
app.use(errorHandler);

// Vercel usa este export por defecto como función serverless.
export default app;
