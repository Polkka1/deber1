export const PRIORITIES = ['baja', 'media', 'alta'] as const;

export type Priority = (typeof PRIORITIES)[number];

/** Tarea tal como la devuelve la API. */
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

/** Cuerpo de POST /api/tasks */
export interface CreateTaskInput {
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
}

/** Cuerpo de PUT /api/tasks/:id (todos los campos son opcionales) */
export type UpdateTaskInput = Partial<CreateTaskInput> & { completed?: boolean };

/** Valores del formulario: los inputs HTML siempre manejan strings. */
export interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  due_date: string;
}

export type TaskFilter = 'todas' | 'pendientes' | 'completadas';
