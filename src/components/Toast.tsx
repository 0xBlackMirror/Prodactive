"use client";

import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
}

export function Toast({ message, onUndo }: ToastProps) {
  return (
    <div className="flex items-center gap-3 bg-foreground text-background px-4 py-3 rounded-lg shadow-lg">
      <Check className="w-4 h-4 text-green-400" />
      <span className="text-sm font-medium">{message}</span>
      {onUndo && (
        <button 
          onClick={onUndo}
          className="text-xs font-bold bg-background/20 hover:bg-background/30 px-3 py-1.5 rounded ml-2 transition-colors uppercase tracking-wider"
        >
          Undo
        </button>
      )}
    </div>
  );
}

// Simple toast provider concept
type ToastMessage = { id: string, message: string, onUndo?: () => void };

let nextId = 0;
let addToastFn: (toast: ToastMessage) => void = () => {};

export const toast = (message: string, onUndo?: () => void) => {
  const id = (++nextId).toString();
  addToastFn({ id, message, onUndo });
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  React.useEffect(() => {
    addToastFn = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };
  }, []);

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast 
              message={t.message} 
              onUndo={t.onUndo ? () => {
                t.onUndo!();
                setToasts((prev) => prev.filter(toast => toast.id !== t.id));
              } : undefined} 
            />
          </div>
        ))}
      </div>
    </>
  );
}
