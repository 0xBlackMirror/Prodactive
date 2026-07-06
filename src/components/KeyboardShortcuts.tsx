"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { toast } from './Toast';

export function KeyboardShortcuts({ children }: { children: React.ReactNode }) {
  const { undo, redo, canUndo, canRedo } = useStore();
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === '?') {
        setShowCheatSheet(true);
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo()) {
            redo();
            toast("Redo successful");
          }
        } else {
          if (canUndo()) {
            undo();
            toast("Undo successful");
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <>
      {children}
      {showCheatSheet && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-sm w-full p-6 space-y-6 relative">
            <button 
              onClick={() => setShowCheatSheet(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Focus Search</span>
                <kbd className="bg-muted px-2 py-1 rounded text-xs font-mono">/</kbd>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Undo</span>
                <kbd className="bg-muted px-2 py-1 rounded text-xs font-mono">⌘/Ctrl + Z</kbd>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Redo</span>
                <kbd className="bg-muted px-2 py-1 rounded text-xs font-mono">⌘/Ctrl + Shift + Z</kbd>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Show this menu</span>
                <kbd className="bg-muted px-2 py-1 rounded text-xs font-mono">?</kbd>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
