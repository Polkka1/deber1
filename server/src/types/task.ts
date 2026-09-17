export const PRIORITIES = ['baja', 'media', 'alta'] as const;

export type Priority = (typeof PRIORITIES)[number];

/** Tarea tal como se guarda en la tabla `tasks` y se devuelve por la API. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  /** Fecha en formato YYYY-MM-DD */
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/** Campos que acepta POST /api/tasks */
export interface CreateTaskInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
}

/** Campos que acepta PUT /api/tasks/:id (todos opcionales) */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
  completed?: boolean;
}

/** Formato de toda respuesta exitosa */
export interface ApiSuccess<T> {
  data: T;
}

/** Formato de toda respuesta de error */
export interface ApiError {
  error: {
    message: string;
    details?: string[];
  };
}
