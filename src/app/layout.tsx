import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/components/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PM Multi-Tool",
  description: "The ultimate tool for Product Managers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <ToastProvider>
              <KeyboardShortcuts>
                <AppShell>
                  {children}
                </AppShell>
              </KeyboardShortcuts>
            </ToastProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
