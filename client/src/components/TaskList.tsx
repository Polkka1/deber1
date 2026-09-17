import type { MutationResult, RequestState } from '../types/api';
import type { Task, TaskFilter, UpdateTaskInput } from '../types/task';
import { TaskItem } from './TaskItem';
import { Spinner } from './Spinner';

interface TaskListProps {
  tasks: Task[];
  totalCount: number;
  filter: TaskFilter;
  listState: RequestState;
  pendingIds: ReadonlySet<string>;
  onRetry: () => void;
  onUpdate: (id: string, changes: UpdateTaskInput, successMessage: string) => Promise<MutationResult>;
  onDelete: (id: string) => Promise<MutationResult>;
}

const EMPTY_MESSAGES: Record<TaskFilter, string> = {
  todas: 'Aún no tienes tareas. ¡Crea la primera!',
  pendientes: 'No tienes tareas pendientes. 🎉',
  completadas: 'Todavía no has completado ninguna tarea.',
};

export function TaskList({ tasks, totalCount, filter, listState, pendingIds, onRetry, onUpdate, onDelete }: TaskListProps) {
  // Estado: cargando
  if (listState.status === 'loading' || listState.status === 'idle') {
    return (
      <div className="state state--loading">
        <Spinner label="Cargando tareas" />
        <p>Cargando tareas…</p>
      </div>
    );
  }

  // Estado: error
  if (listState.status === 'error') {
    return (
      <div className="state state--error" role="alert">
        <p className="state__title">No se pudieron cargar las tareas</p>
        <p>{listState.message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  // Estado: éxito (con o sin datos)
  if (tasks.length === 0) {
    return (
      <div className="state state--empty">
        <p>{totalCount === 0 ? EMPTY_MESSAGES.todas : EMPTY_MESSAGES[filter]}</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isPending={pendingIds.has(task.id)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
