import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error.js';
import type { ApiError } from '../types/task.js';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

function hasStatus(error: unknown): error is { status: number; type?: string } {
  return typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number';
}

// Express reconoce un middleware de errores por tener 4 parámetros.
export function errorHandler(error: unknown, _req: Request, res: Response<ApiError>, _next: NextFunction): void {
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => issue.message);
    res.status(400).json({ error: { message: details[0] ?? 'Datos inválidos', details } });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { message: error.message, details: error.details } });
    return;
  }

  // JSON mal formado en el body (lanzado por express.json)
  if (hasStatus(error) && error.type === 'entity.parse.failed') {
    res.status(400).json({ error: { message: 'El cuerpo de la petición no es JSON válido' } });
    return;
  }

  console.error('Error no controlado:', error);
  res.status(500).json({ error: { message: 'Error interno del servidor' } });
}
