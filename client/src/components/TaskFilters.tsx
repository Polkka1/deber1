import type { TaskFilter } from '../types/task';

interface TaskFiltersProps {
  value: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (filter: TaskFilter) => void;
}

const OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'completadas', label: 'Completadas' },
];

export function TaskFilters({ value, counts, onChange }: TaskFiltersProps) {
  return (
    <div className="filters" role="group" aria-label="Filtrar tareas">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`filters__btn${value === option.value ? ' filters__btn--active' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label} <span className="filters__count">{counts[option.value]}</span>
        </button>
      ))}
    </div>
  );
}
