import { useState } from 'react';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import type { MutationResult } from '../types/api';
import { PRIORITY_LABELS, formatDate, isOverdue, toFormValues } from '../utils/tasks';
import { TaskForm } from './TaskForm';
import { Spinner } from './Spinner';

interface TaskItemProps {
  task: Task;
  isPending: boolean;
  onUpdate: (id: string, changes: UpdateTaskInput, successMessage: string) => Promise<MutationResult>;
  onDelete: (id: string) => Promise<MutationResult>;
}

export function TaskItem({ task, isPending, onUpdate, onDelete }: TaskItemProps) {
  // Estado local del componente: modo edición y confirmación de borrado
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const overdue = isOverdue(task);

  function handleToggle() {
    const message = task.completed ? 'Tarea marcada como pendiente' : '¡Tarea completada!';
    void onUpdate(task.id, { completed: !task.completed }, message);
  }

  async function handleSave(input: CreateTaskInput): Promise<MutationResult> {
    const result = await onUpdate(task.id, input, 'Tarea actualizada');
    if (result.ok) setIsEditing(false);
    return result;
  }

  async function handleDelete() {
    const result = await onDelete(task.id);
    if (!result.ok) setIsConfirmingDelete(false);
  }

  if (isEditing) {
    return (
      <li className="task task--editing">
        <TaskForm
          initialValues={toFormValues(task)}
          submitLabel="Guardar cambios"
          submittingLabel="Guardando…"
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
          compact
        />
      </li>
    );
  }

  return (
    <li className={`task${task.completed ? ' task--done' : ''}${isPending ? ' task--pending' : ''}`}>
      <label className="task__check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={isPending}
          aria-label={task.completed ? `Marcar "${task.title}" como pendiente` : `Completar "${task.title}"`}
        />
        <span className="task__checkmark" aria-hidden="true" />
      </label>

      <div className="task__body">
        <h3 className="task__title">{task.title}</h3>
        {task.description && <p className="task__description">{task.description}</p>}
        <div className="task__meta">
          <span className={`badge badge--${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
          {task.due_date && (
            <span className={`task__due${overdue ? ' task__due--overdue' : ''}`}>
              {overdue ? 'Vencida: ' : 'Vence: '}
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>

      <div className="task__actions">
        {isPending ? (
          <Spinner size="small" label="Guardando" />
        ) : isConfirmingDelete ? (
          <>
            <span className="task__confirm">¿Eliminar?</span>
            <button type="button" className="btn btn--danger btn--small" onClick={handleDelete}>
              Sí
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setIsConfirmingDelete(false)}>
              No
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setIsEditing(true)}>
              Editar
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--small btn--danger-text"
              onClick={() => setIsConfirmingDelete(true)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </li>
  );
}
