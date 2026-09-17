import { useCallback, useEffect, useState } from 'react';
import { tasksApi } from '../api/tasks';
import { getErrorMessage, isAbortError } from '../api/client';
import type { MutationResult, Notice, RequestState } from '../types/api';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';

export interface UseTasksResult {
  tasks: Task[];
  /** Estado de la carga inicial de la lista */
  listState: RequestState;
  /** Ids de tareas con una petición en curso (editar, completar, borrar) */
  pendingIds: ReadonlySet<string>;
  notice: Notice | null;
  dismissNotice: () => void;
  reload: () => void;
  createTask: (input: CreateTaskInput) => Promise<MutationResult>;
  updateTask: (id: string, changes: UpdateTaskInput, successMessage: string) => Promise<MutationResult>;
  deleteTask: (id: string) => Promise<MutationResult>;
}

let noticeCounter = 0;

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [listState, setListState] = useState<RequestState>({ status: 'loading' });
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // GET: carga la lista al montar y cada vez que se pide "reintentar"
  useEffect(() => {
    const controller = new AbortController();

    tasksApi
      .list(controller.signal)
      .then((data) => {
        setTasks(data);
        setListState({ status: 'success' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setListState({ status: 'error', message: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => {
    setListState({ status: 'loading' });
    setReloadKey((key) => key + 1);
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const notify = useCallback((kind: Notice['kind'], message: string) => {
    noticeCounter += 1;
    setNotice({ id: noticeCounter, kind, message });
  }, []);

  const setPending = useCallback((id: string, pending: boolean) => {
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  // POST
  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<MutationResult> => {
      try {
        const created = await tasksApi.create(input);
        setTasks((current) => [created, ...current]);
        notify('success', 'Tarea creada');
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getErrorMessage(error) };
      }
    },
    [notify],
  );

  // PUT
  const updateTask = useCallback(
    async (id: string, changes: UpdateTaskInput, successMessage: string): Promise<MutationResult> => {
      setPending(id, true);
      try {
        const updated = await tasksApi.update(id, changes);
        setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
        notify('success', successMessage);
        return { ok: true };
      } catch (error) {
        const message = getErrorMessage(error);
        notify('error', `No se pudo actualizar: ${message}`);
        return { ok: false, message };
      } finally {
        setPending(id, false);
      }
    },
    [notify, setPending],
  );

  // DELETE
  const deleteTask = useCallback(
    async (id: string): Promise<MutationResult> => {
      setPending(id, true);
      try {
        await tasksApi.remove(id);
        setTasks((current) => current.filter((task) => task.id !== id));
        notify('success', 'Tarea eliminada');
        return { ok: true };
      } catch (error) {
        const message = getErrorMessage(error);
        notify('error', `No se pudo eliminar: ${message}`);
        return { ok: false, message };
      } finally {
        setPending(id, false);
      }
    },
    [notify, setPending],
  );

  return { tasks, listState, pendingIds, notice, dismissNotice, reload, createTask, updateTask, deleteTask };
}
