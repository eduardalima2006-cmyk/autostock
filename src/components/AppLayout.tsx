import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Car, LayoutDashboard, Package, ShoppingCart, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/estoque", label: "Estoque", icon: Package },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/funcionarios", label: "Funcionários", icon: Users, restricted: "Equipe" },
  { to: "/financeiro", label: "Financeiro", icon: Wallet, restricted: "Financeiro" },
] as const;

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">AutoStock</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Revenda Pro
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                )}
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {"restricted" in item && item.restricted && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary uppercase tracking-wider">
                    {item.restricted}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground">
          <div className="rounded-lg p-3 bg-sidebar-accent/40">
            <div className="font-semibold text-sidebar-foreground mb-1">Dica</div>
            Senhas demo: <span className="text-primary">equipe123</span> /{" "}
            <span className="text-accent">financeiro123</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {/* mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">AutoStock</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {nav.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "text-xs px-2 py-1 rounded-md whitespace-nowrap",
                  pathname === i.to ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}