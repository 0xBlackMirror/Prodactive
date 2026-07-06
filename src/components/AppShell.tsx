"use client";

import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, ListTodo, Map, Inbox, Settings, Package, Menu, ChevronLeft, ChevronRight, X, ChevronDown, Check, BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings } = useStore();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Feature Planner", href: "/features", icon: ListTodo },
    { name: "Roadmap", href: "/roadmap", icon: Map },
    { name: "Releases", href: "/releases", icon: Package },
    { name: "Daily Missions", href: "/missions", icon: CheckSquare },
    { name: "Customer Requests", href: "/requests", icon: Inbox },
    { name: "PM Playbook", href: "/playbook", icon: BookOpen },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 flex-shrink-0 border-r border-border bg-card flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className={`flex h-16 items-center border-b border-border gap-3 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
          {settings?.productLogoBase64 && (
            <img 
              src={settings.productLogoBase64} 
              alt="Logo" 
              className="w-8 h-8 object-contain rounded flex-shrink-0"
            />
          )}
          {!isCollapsed && (
            <span className="text-lg font-bold truncate">PM Multi-Tool</span>
          )}
          <button 
            className="md:hidden absolute right-4 p-1 hover:bg-accent rounded"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link 
            href="/settings"
            title={isCollapsed ? "Settings" : undefined}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isCollapsed ? 'justify-center px-0' : 'px-3'
            } ${
              pathname === "/settings"
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors mt-2"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-muted-foreground capitalize hidden md:block">
              {pathname === "/" ? "Dashboard" : pathname.replace("/", "")}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* Workspace Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                className="flex items-center gap-2 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors"
              >
                Local Workspace
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {isWorkspaceDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsWorkspaceDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50 py-1">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspaces</p>
                    </div>
                    <button 
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      onClick={() => setIsWorkspaceDropdownOpen(false)}
                    >
                      <span>Local Workspace</span>
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                    <div className="border-t border-border mt-1 pt-1">
                      <Link 
                        href="/settings"
                        className="w-full flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        onClick={() => setIsWorkspaceDropdownOpen(false)}
                      >
                        Manage Workspaces...
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
