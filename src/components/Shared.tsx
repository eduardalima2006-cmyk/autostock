import { cn } from "@/lib/utils";
import type { StatusVeiculo, Categoria } from "@/lib/types";
import { Car, Truck, Zap, Square, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "success" | "info";
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    success: "text-success bg-success/10",
    info: "text-info bg-info/10",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold mt-2">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colorMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: StatusVeiculo }) {
  const map = {
    disponivel: { label: "Disponível", cls: "bg-success/15 text-success border-success/30" },
    vendido: { label: "Vendido", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    reservado: { label: "Reservado", cls: "bg-warning/15 text-warning border-warning/30" },
  } as const;
  const c = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border", c.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

const catIcons: Record<Categoria, LucideIcon> = {
  SUV: Car,
  Sedan: Car,
  Hatch: Square,
  Picape: Truck,
  Esportivo: Zap,
};

export function CategoriaPill({ categoria }: { categoria: Categoria }) {
  const Icon = catIcons[categoria];
  const colorMap: Record<Categoria, string> = {
    SUV: "bg-chart-4/15 text-chart-4 border-chart-4/30",
    Sedan: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    Hatch: "bg-chart-5/15 text-chart-5 border-chart-5/30",
    Picape: "bg-accent/15 text-accent border-accent/30",
    Esportivo: "bg-primary/15 text-primary border-primary/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border", colorMap[categoria])}>
      <Icon className="h-3 w-3" />
      {categoria}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export { Crown };