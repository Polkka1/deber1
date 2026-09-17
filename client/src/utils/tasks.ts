import type { CreateTaskInput, Priority, Task, TaskFilter, TaskFormValues } from '../types/task';

export const PRIORITY_LABELS: Record<Priority, string> = { baja: 'Baja', media: 'Media', alta: 'Alta' };

export const EMPTY_FORM: TaskFormValues = { title: '', description: '', priority: 'media', due_date: '' };

export function toFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    due_date: task.due_date ?? '',
  };
}

export function toTaskInput(values: TaskFormValues): CreateTaskInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    priority: values.priority,
    due_date: values.due_date || null,
  };
}

/** Pendientes primero; dentro de cada grupo, las más recientes arriba. */
export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.created_at.localeCompare(a.created_at);
  });
}

export function filterTasks(tasks: readonly Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'pendientes':
      return tasks.filter((task) => !task.completed);
    case 'completadas':
      return tasks.filter((task) => task.completed);
    case 'todas':
      return [...tasks];
  }
}

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isOverdue(task: Task): boolean {
  return !task.completed && task.due_date !== null && task.due_date < todayIso();
}

/** "2026-09-17" -> "17 sept 2026" sin desfases de zona horaria */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}
