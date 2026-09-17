import { Router, type Request, type Response } from 'express';
import type { PostgrestError } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase.js';
import { HttpError } from '../lib/http-error.js';
import { createTaskSchema, idParamSchema, updateTaskSchema } from '../validation/task.js';
import type { ApiSuccess, Task } from '../types/task.js';

type IdParams = { id: string };

export const tasksRouter = Router();

function databaseError(error: PostgrestError): HttpError {
  console.error('Error de Supabase:', error);
  return new HttpError(502, 'No se pudo completar la operación en la base de datos');
}

function taskNotFound(): HttpError {
  return new HttpError(404, 'La tarea no existe');
}

// GET /api/tasks — lista todas las tareas (pendientes primero, luego las más recientes)
tasksRouter.get('/', async (_req: Request, res: Response<ApiSuccess<Task[]>>) => {
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('*')
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw databaseError(error);
  res.json({ data });
});

// GET /api/tasks/:id — obtiene una tarea
tasksRouter.get('/:id', async (req: Request<IdParams>, res: Response<ApiSuccess<Task>>) => {
  const id = idParamSchema.parse(req.params.id);
  const { data, error } = await getSupabase().from('tasks').select('*').eq('id', id).maybeSingle();

  if (error) throw databaseError(error);
  if (!data) throw taskNotFound();
  res.json({ data });
});

// POST /api/tasks — crea una tarea
tasksRouter.post('/', async (req: Request, res: Response<ApiSuccess<Task>>) => {
  const input = createTaskSchema.parse(req.body);
  const { data, error } = await getSupabase().from('tasks').insert(input).select('*').single();

  if (error) throw databaseError(error);
  res.status(201).json({ data });
});

// PUT /api/tasks/:id — actualiza campos de una tarea (incluye marcar completada)
tasksRouter.put('/:id', async (req: Request<IdParams>, res: Response<ApiSuccess<Task>>) => {
  const id = idParamSchema.parse(req.params.id);
  const changes = updateTaskSchema.parse(req.body);
  const { data, error } = await getSupabase().from('tasks').update(changes).eq('id', id).select('*').maybeSingle();

  if (error) throw databaseError(error);
  if (!data) throw taskNotFound();
  res.json({ data });
});

// DELETE /api/tasks/:id — elimina una tarea
tasksRouter.delete('/:id', async (req: Request<IdParams>, res: Response<ApiSuccess<{ id: string }>>) => {
  const id = idParamSchema.parse(req.params.id);
  const { data, error } = await getSupabase().from('tasks').delete().eq('id', id).select('id').maybeSingle();

  if (error) throw databaseError(error);
  if (!data) throw taskNotFound();
  res.json({ data });
});
