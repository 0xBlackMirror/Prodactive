"use client";

import { useEffect, useState } from "react";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading Workspace...</div>;
  }

  return <>{children}</>;
}
