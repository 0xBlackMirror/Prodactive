"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useStore } from "@/lib/store";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { settings } = useStore();

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-color", settings?.themeColor || "zinc");
  }, [settings?.themeColor]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
