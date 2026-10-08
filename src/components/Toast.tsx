import { CheckCircle2, X } from 'lucide-react';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-lg rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-2xl flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} aria-label="بستن">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;