import { PRIORITIES, type Priority, type Task } from '../types/task';
import type { ApiErrorBody } from '../types/api';

/** Función que comprueba en tiempo de ejecución que un valor tiene el tipo T. */
export type Guard<T> = (value: unknown) => value is T;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

export function isPriority(value: unknown): value is Priority {
  return PRIORITIES.some((priority) => priority === value);
}

export function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isNullableString(value.description) &&
    isPriority(value.priority) &&
    isNullableString(value.due_date) &&
    typeof value.completed === 'boolean' &&
    typeof value.created_at === 'string' &&
    typeof value.updated_at === 'string'
  );
}

export function isTaskList(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask);
}

export function isDeletedTask(value: unknown): value is { id: string } {
  return isRecord(value) && typeof value.id === 'string';
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value)) return false;
  const error = value.error;
  return isRecord(error) && typeof error.message === 'string';
}
