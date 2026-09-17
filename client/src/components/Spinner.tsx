interface SpinnerProps {
  size?: 'small' | 'large';
  label?: string;
}

export function Spinner({ size = 'large', label }: SpinnerProps) {
  return (
    <span className={`spinner spinner--${size}`} role="status" aria-label={label ?? 'Cargando'}>
      <span className="spinner__circle" aria-hidden="true" />
    </span>
  );
}
