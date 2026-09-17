import { useId, useState, type FormEvent } from 'react';
import { PRIORITIES, type CreateTaskInput, type TaskFormValues } from '../types/task';
import type { MutationResult, RequestState } from '../types/api';
import { EMPTY_FORM, PRIORITY_LABELS, toTaskInput } from '../utils/tasks';
import { Spinner } from './Spinner';
import { isPriority } from '../api/guards';

interface TaskFormProps {
  initialValues?: TaskFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: CreateTaskInput) => Promise<MutationResult>;
  onCancel?: () => void;
  /** Limpia el formulario tras guardar (útil al crear, no al editar) */
  resetOnSuccess?: boolean;
  compact?: boolean;
}

export function TaskForm({
  initialValues = EMPTY_FORM,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
  resetOnSuccess = false,
  compact = false,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [submitState, setSubmitState] = useState<RequestState>({ status: 'idle' });
  const fieldId = useId();

  const isSubmitting = submitState.status === 'loading';

  function setField<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (submitState.status === 'error') setSubmitState({ status: 'idle' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.title.trim()) {
      setSubmitState({ status: 'error', message: 'El título es obligatorio' });
      return;
    }

    setSubmitState({ status: 'loading' });
    const result = await onSubmit(toTaskInput(values));

    if (result.ok) {
      setSubmitState({ status: 'success' });
      if (resetOnSuccess) setValues(EMPTY_FORM);
    } else {
      setSubmitState({ status: 'error', message: result.message });
    }
  }

  return (
    <form className={`task-form${compact ? ' task-form--compact' : ''}`} onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={`${fieldId}-title`}>Título *</label>
        <input
          id={`${fieldId}-title`}
          name="title"
          value={values.title}
          onChange={(event) => setField('title', event.target.value)}
          maxLength={120}
          placeholder="¿Qué necesitas hacer?"
          disabled={isSubmitting}
          autoFocus={compact}
          required
        />
      </div>

      <div className="field">
        <label htmlFor={`${fieldId}-description`}>Descripción</label>
        <textarea
          id={`${fieldId}-description`}
          name="description"
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
          maxLength={500}
          rows={compact ? 2 : 3}
          placeholder="Detalles opcionales"
          disabled={isSubmitting}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${fieldId}-priority`}>Prioridad</label>
          <select
            id={`${fieldId}-priority`}
            name="priority"
            value={values.priority}
            onChange={(event) => {
              const { value } = event.target;
              if (isPriority(value)) setField('priority', value);
            }}
            disabled={isSubmitting}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={`${fieldId}-due`}>Fecha límite</label>
          <input
            id={`${fieldId}-due`}
            type="date"
            name="due_date"
            value={values.due_date}
            onChange={(event) => setField('due_date', event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {submitState.status === 'error' && (
        <p className="form-error" role="alert">
          {submitState.message}
        </p>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="small" /> {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
