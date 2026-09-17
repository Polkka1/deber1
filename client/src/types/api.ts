/** Respuesta exitosa de la API: { data: T } */
export interface ApiSuccess<T> {
  data: T;
}

/** Respuesta de error de la API: { error: { message, details? } } */
export interface ApiErrorBody {
  error: {
    message: string;
    details?: string[];
  };
}

/** Estado de una petición de red. */
export type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string };

/** Resultado de una operación que modifica datos (crear, editar, borrar). */
export type MutationResult = { ok: true } | { ok: false; message: string };

/** Aviso temporal que se muestra al usuario. */
export interface Notice {
  id: number;
  kind: 'success' | 'error';
  message: string;
}
