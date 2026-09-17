import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.js';
import { HttpError } from './http-error.js';

let client: SupabaseClient<Database> | null = null;

/**
 * Devuelve el cliente de Supabase (se crea la primera vez que se usa).
 * Si faltan variables de entorno responde 500 con un mensaje claro
 * en lugar de tumbar la función al arrancar.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new HttpError(500, 'El servidor no está configurado: faltan SUPABASE_URL o SUPABASE_SECRET_KEY');
  }

  client = createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}
