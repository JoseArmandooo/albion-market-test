// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Trophy,
  Bell,
  Settings,
  Activity,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { cn, timeAgo } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/alerts", label: "Alertas", icon: Bell },
];

export function Navbar() {
  const pathname = usePathname();
  const { syncStatus } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isSyncing = syncStatus.status === "syncing";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-profit/20 border border-profit/30 group-hover:bg-profit/30 transition-colors">
              <Zap className="h-4 w-4 text-profit" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-wide text-foreground">
                Albion
              </span>
              <span className="font-display text-lg font-bold tracking-wide text-profit ml-1">
                Market
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 font-display tracking-wide",
                    pathname === href
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Sync indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isSyncing
                    ? "bg-gold animate-pulse"
                    : syncStatus.status === "success"
                    ? "bg-profit"
                    : syncStatus.status === "error"
                    ? "bg-loss"
                    : "bg-muted-foreground"
                )}
              />
              <span className="text-xs text-muted-foreground font-mono">
                {isSyncing
                  ? "Sincronizando..."
                  : syncStatus.lastSync
                  ? timeAgo(syncStatus.lastSync)
                  : "Aguardando sync"}
              </span>
              {isSyncing && <Activity className="h-3 w-3 text-gold animate-pulse" />}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/90 px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 font-display",
                    pathname === href
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-[#0a0a0f] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Configurações</DialogTitle>
          </DialogHeader>
          <SettingsPanel onClose={() => setSettingsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
