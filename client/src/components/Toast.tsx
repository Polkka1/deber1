import { useEffect } from 'react';
import type { Notice } from '../types/api';

interface ToastProps {
  notice: Notice | null;
  onDismiss: () => void;
}

const DURATION_MS = 3500;

export function Toast({ notice, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(onDismiss, DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [notice, onDismiss]);

  return (
    <div className="toast-region" aria-live="polite">
      {notice && (
        <div key={notice.id} className={`toast toast--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          <span>{notice.message}</span>
          <button type="button" className="toast__close" onClick={onDismiss} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
