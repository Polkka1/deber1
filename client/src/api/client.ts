import { isApiErrorBody, isRecord, type Guard } from './guards';

const API_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '')).replace(
  /\/+$/,
  '',
);

const TIMEOUT_MS = 15_000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

/** Error de red o de la API con un mensaje listo para mostrar al usuario. */
export class ApiClientError extends Error {
  /** Código HTTP, o null si ni siquiera hubo respuesta (sin conexión, timeout...) */
  readonly status: number | null;
  readonly details: string[];

  constructor(message: string, status: number | null, details: string[] = []) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
}

/**
 * Hace una petición a la API y devuelve `data` ya validado con `guard`.
 * Lanza ApiClientError en cualquier caso de fallo.
 */
export async function request<T>(path: string, guard: Guard<T>, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiClientError('La app no está configurada: falta la variable VITE_API_URL', null);
  }

  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error; // cancelada a propósito (p. ej. al desmontar)
    if (timeout.aborted) throw new ApiClientError('El servidor tardó demasiado en responder', null);
    throw new ApiClientError('No se pudo conectar con el servidor. Revisa tu conexión.', null);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiClientError(body.error.message, response.status, body.error.details ?? []);
    }
    throw new ApiClientError(`Error del servidor (${response.status})`, response.status);
  }

  const data = isRecord(body) ? body.data : undefined;
  if (!guard(data)) {
    throw new ApiClientError('El servidor devolvió una respuesta inesperada', response.status);
  }
  return data;
}
