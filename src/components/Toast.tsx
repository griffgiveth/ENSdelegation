import { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-white border border-ens-blue-light shadow-xl shadow-ens-blue/10 text-ens-blue-dark px-6 py-4 rounded-2xl flex items-center gap-3 max-w-sm">
        <CheckCircle size={20} className="text-ens-blue flex-shrink-0" />
        <span className="font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-ens-blue-pale p-1 rounded-lg transition-colors flex-shrink-0"
        >
          <X size={16} className="text-ens-blue-dark/40" />
        </button>
      </div>
    </div>
  );
}
