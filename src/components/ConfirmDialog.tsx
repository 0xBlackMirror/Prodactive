import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg max-w-sm w-full p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full flex-shrink-0 ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-500'}`}>
            {variant === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold leading-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 border border-input rounded-md text-sm hover:bg-accent"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              variant === 'danger' 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
