import { StateCreator } from 'zustand';

export type WithUndo = {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

export const withUndo = <T extends object>(
  config: StateCreator<T, [], []>
): StateCreator<T & WithUndo, [], []> => (set, get, api) => {
  let past: string[] = [];
  let future: string[] = [];
  let isUndoRedo = false;

  const modifiedSet: typeof set = (args, replace) => {
    if (!isUndoRedo) {
      const currentState = get();
      // Omit functions and undo state from the snapshot to save memory
      const snapshot = Object.keys(currentState).reduce((acc, key) => {
        if (typeof (currentState as any)[key] !== 'function') {
          (acc as any)[key] = (currentState as any)[key];
        }
        return acc;
      }, {} as any);
      past.push(JSON.stringify(snapshot));
      if (past.length > 50) past.shift(); // keep last 50
      future = [];
    }
    (set as any)(args, replace);
  };

  const undo = () => {
    if (past.length > 0) {
      isUndoRedo = true;
      const currentState = get();
      const snapshot = Object.keys(currentState).reduce((acc, key) => {
        if (typeof (currentState as any)[key] !== 'function') {
          (acc as any)[key] = (currentState as any)[key];
        }
        return acc;
      }, {} as any);
      future.push(JSON.stringify(snapshot));
      
      const previousState = JSON.parse(past.pop()!);
      set(previousState);
      isUndoRedo = false;
    }
  };

  const redo = () => {
    if (future.length > 0) {
      isUndoRedo = true;
      const currentState = get();
      const snapshot = Object.keys(currentState).reduce((acc, key) => {
        if (typeof (currentState as any)[key] !== 'function') {
          (acc as any)[key] = (currentState as any)[key];
        }
        return acc;
      }, {} as any);
      past.push(JSON.stringify(snapshot));
      
      const nextState = JSON.parse(future.pop()!);
      set(nextState);
      isUndoRedo = false;
    }
  };

  const canUndo = () => past.length > 0;
  const canRedo = () => future.length > 0;

  return {
    ...config(modifiedSet, get, api),
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
