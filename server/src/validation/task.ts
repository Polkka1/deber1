import { z } from 'zod';
import { PRIORITIES, type CreateTaskInput, type UpdateTaskInput } from '../types/task.js';

const title = z
  .string({ error: 'El título debe ser texto' })
  .trim()
  .min(1, 'El título es obligatorio')
  .max(120, 'El título no puede superar 120 caracteres');

// Cadena vacía => null, para poder "borrar" la descripción
const description = z
  .string({ error: 'La descripción debe ser texto' })
  .trim()
  .max(500, 'La descripción no puede superar 500 caracteres')
  .transform((value) => (value === '' ? null : value))
  .nullable();

const priority = z.enum(PRIORITIES, { error: 'La prioridad debe ser baja, media o alta' });

const dueDate = z.iso.date({ error: 'La fecha límite debe tener formato YYYY-MM-DD' }).nullable();

export const idParamSchema = z.uuid({ error: 'El id de la tarea no es válido' });

export const createTaskSchema = z.object({
  title,
  description: description.optional(),
  priority: priority.optional(),
  due_date: dueDate.optional(),
}) satisfies z.ZodType<CreateTaskInput>;

export const updateTaskSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    priority: priority.optional(),
    due_date: dueDate.optional(),
    completed: z.boolean({ error: 'completed debe ser true o false' }).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    error: 'Debes enviar al menos un campo para actualizar',
  }) satisfies z.ZodType<UpdateTaskInput>;
