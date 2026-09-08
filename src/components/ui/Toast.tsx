import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

let toastId = 0;
const listeners: ((toast: ToastData) => void)[] = [];

export function showToast(message: string, type: ToastType = 'success') {
  const toast: ToastData = { id: String(++toastId), type, message };
  listeners.forEach((l) => l(toast));
}

const typeConfig: Record<ToastType, { icon: ReactNode; bg: string }> = {
  success: { icon: <CheckCircle2 className="w-5 h-5 text-success-600" />, bg: 'bg-success-50 border-success-200' },
  error: { icon: <XCircle className="w-5 h-5 text-error-600" />, bg: 'bg-error-50 border-error-200' },
  info: { icon: <Info className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' },
  warning: { icon: <AlertCircle className="w-5 h-5 text-accent-600" />, bg: 'bg-accent-50 border-accent-200' },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const listener = (toast: ToastData) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg slide-up pointer-events-auto',
              config.bg
            )}
          >
            {config.icon}
            <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
