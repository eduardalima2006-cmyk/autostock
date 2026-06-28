import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Car, DollarSign, Package, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDB, fmtBRL, fmtDate } from "@/lib/store";
import { PageHeader, StatCard, StatusBadge, CategoriaPill } from "@/components/Shared";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral — AutoStock" },
      { name: "description", content: "Dashboard com indicadores de estoque, vendas e categorias." },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = ["#e63946", "#f5a623", "#27ae60", "#3b82f6", "#a855f7"];

function Dashboard() {
  const db = useDB();

  const stats = useMemo(() => {
    const disponiveis = db.veiculos.filter((v) => v.status === "disponivel").length;
    const vendidos = db.veiculos.filter((v) => v.status === "vendido").length;
    const totalVendas = db.vendas.reduce((s, v) => s + v.precoFinal, 0);
    const valorEstoque = db.veiculos
      .filter((v) => v.status === "disponivel")
      .reduce((s, v) => s + v.precoVenda, 0);
    return { disponiveis, vendidos, totalVendas, valorEstoque, total: db.veiculos.length };
  }, [db]);

  // Categorias
  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    db.veiculos.forEach((v) => map.set(v.categoria, (map.get(v.categoria) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [db]);

  // Marcas com maior saída (top vendidos por marca)
  const marcasTop = useMemo(() => {
    const map = new Map<string, number>();
    db.vendas.forEach((v) => {
      const veh = db.veiculos.find((x) => x.id === v.veiculoId);
      if (veh) map.set(veh.marca, (map.get(veh.marca) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([marca, vendas]) => ({ marca, vendas }))
      .sort((a, b) => b.vendas - a.vendas);
  }, [db]);

  const ultimas = db.vendas.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Visão Geral"
        subtitle="Panorama do estoque, vendas e desempenho da revenda"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Veículos em Estoque" value={stats.disponiveis} hint={`${stats.total} no total`} icon={Package} accent="success" />
        <StatCard label="Vendidos" value={stats.vendidos} hint="Histórico" icon={Car} accent="primary" />
        <StatCard label="Receita Total" value={fmtBRL(stats.totalVendas)} hint={`${db.vendas.length} vendas`} icon={DollarSign} accent="accent" />
        <StatCard label="Valor em Estoque" value={fmtBRL(stats.valorEstoque)} hint="Preço de venda" icon={TrendingUp} accent="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold mb-1">Marcas com Maior Saída</h3>
          <p className="text-xs text-muted-foreground mb-5">Total de unidades vendidas por marca</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={marcasTop}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.015 270)" />
              <XAxis dataKey="marca" stroke="oklch(0.7 0.02 270)" fontSize={12} />
              <YAxis stroke="oklch(0.7 0.02 270)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "oklch(0.21 0.014 270)", border: "1px solid oklch(0.3 0.015 270)", borderRadius: 8 }}
              />
              <Bar dataKey="vendas" radius={[8, 8, 0, 0]}>
                {marcasTop.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold mb-1">Estoque por Categoria</h3>
          <p className="text-xs text-muted-foreground mb-5">Distribuição dos veículos disponíveis e vendidos</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={porCategoria} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                {porCategoria.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "oklch(0.21 0.014 270)", border: "1px solid oklch(0.3 0.015 270)", borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {porCategoria.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="font-semibold">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold mb-4">Últimas Vendas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 pr-4">Veículo</th>
                <th className="py-3 pr-4">Categoria</th>
                <th className="py-3 pr-4">Cliente</th>
                <th className="py-3 pr-4">Data</th>
                <th className="py-3 pr-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {ultimas.map((v) => {
                const veh = db.veiculos.find((x) => x.id === v.veiculoId);
                return (
                  <tr key={v.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{veh ? `${veh.marca} ${veh.modelo}` : "—"}</td>
                    <td className="py-3 pr-4">{veh && <CategoriaPill categoria={veh.categoria} />}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{v.cliente}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{fmtDate(v.data)}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-accent">{fmtBRL(v.precoFinal)}</td>
                  </tr>
                );
              })}
              {ultimas.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhuma venda registrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <StatusBadgeLegend />
    </div>
  );
}

function StatusBadgeLegend() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span>Legenda:</span>
      <StatusBadge status="disponivel" />
      <StatusBadge status="reservado" />
      <StatusBadge status="vendido" />
    </div>
  );
}
