import { useMemo, useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { Toast } from './components/Toast';
import { filterTasks, sortTasks } from './utils/tasks';
import type { TaskFilter } from './types/task';

function App() {
  const { tasks, listState, pendingIds, notice, dismissNotice, reload, createTask, updateTask, deleteTask } =
    useTasks();
  const [filter, setFilter] = useState<TaskFilter>('todas');

  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const visible = useMemo(() => filterTasks(sorted, filter), [sorted, filter]);
  const counts = useMemo<Record<TaskFilter, number>>(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return { todas: tasks.length, pendientes: tasks.length - completed, completadas: completed };
  }, [tasks]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Gestor de Tareas</h1>
        <p className="app__subtitle">
          {listState.status === 'success'
            ? `${counts.pendientes} pendiente${counts.pendientes === 1 ? '' : 's'} · ${counts.completadas} completada${counts.completadas === 1 ? '' : 's'}`
            : 'Organiza tus pendientes del día'}
        </p>
      </header>

      <main className="app__main">
        <section className="card" aria-labelledby="new-task-title">
          <h2 id="new-task-title">Nueva tarea</h2>
          <TaskForm submitLabel="Agregar tarea" submittingLabel="Guardando…" onSubmit={createTask} resetOnSuccess />
        </section>

        <section className="card" aria-labelledby="list-title">
          <div className="card__header">
            <h2 id="list-title">Mis tareas</h2>
            {listState.status === 'success' && <TaskFilters value={filter} counts={counts} onChange={setFilter} />}
          </div>
          <TaskList
            tasks={visible}
            totalCount={tasks.length}
            filter={filter}
            listState={listState}
            pendingIds={pendingIds}
            onRetry={reload}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        </section>
      </main>

      <Toast notice={notice} onDismiss={dismissNotice} />
    </div>
  );
}

export default App;
