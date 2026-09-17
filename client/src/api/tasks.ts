import { request } from './client';
import { isDeletedTask, isTask, isTaskList } from './guards';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';

export const tasksApi = {
  list(signal?: AbortSignal): Promise<Task[]> {
    return request('/api/tasks', isTaskList, { signal });
  },

  create(input: CreateTaskInput): Promise<Task> {
    return request('/api/tasks', isTask, { method: 'POST', body: input });
  },

  update(id: string, changes: UpdateTaskInput): Promise<Task> {
    return request(`/api/tasks/${encodeURIComponent(id)}`, isTask, { method: 'PUT', body: changes });
  },

  remove(id: string): Promise<{ id: string }> {
    return request(`/api/tasks/${encodeURIComponent(id)}`, isDeletedTask, { method: 'DELETE' });
  },
};
