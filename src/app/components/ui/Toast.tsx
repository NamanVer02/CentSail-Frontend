'use client';

import { useState, useEffect } from 'react';
import { toast, Toast as ToastType } from '@/lib/utils/toast';

export default function Toast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const getToastStyles = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg max-w-sm
            transform transition-all duration-300 ease-in-out
            ${getToastStyles(toastItem.type)}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toastItem.message}</span>
            <button
              onClick={() => toast.remove(toastItem.id)}
              className="ml-3 text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
