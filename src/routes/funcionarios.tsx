import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Award, Crown, Medal, Trophy, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtBRL, useDB } from "@/lib/store";
import { PageHeader, StatCard } from "@/components/Shared";
import { PasswordGate } from "@/components/PasswordGate";

export const Route = createFileRoute("/funcionarios")({
  head: () => ({
    meta: [
      { title: "Funcionários — AutoStock" },
      { name: "description", content: "Equipe de vendas, ranking mensal e desempenho individual." },
    ],
  }),
  component: () => (
    <PasswordGate
      storageKey="gate-equipe"
      expected="equipe123"
      title="Área da Equipe"
      description="Acesso restrito aos funcionários de vendas. Informe a senha para continuar."
    >
      <Funcionarios />
    </PasswordGate>
  ),
});

function Funcionarios() {
  const db = useDB();
  const now = new Date();

  const ranking = useMemo(() => {
    return db.vendedores
      .map((vend) => {
        const vendas = db.vendas.filter((v) => v.vendedorId === vend.id);
        const mesAtual = vendas.filter((v) => {
          const d = new Date(v.data);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const receitaTotal = vendas.reduce((s, v) => s + v.precoFinal, 0);
        const receitaMes = mesAtual.reduce((s, v) => s + v.precoFinal, 0);
        const comissaoMes = receitaMes * (vend.comissaoPct / 100);
        return {
          vend,
          totalVendas: vendas.length,
          vendasMes: mesAtual.length,
          receitaTotal,
          receitaMes,
          comissaoMes,
        };
      })
      .sort((a, b) => b.vendasMes - a.vendasMes || b.totalVendas - a.totalVendas);
  }, [db, now]);

  const totalEquipe = ranking.reduce((s, r) => s + r.totalVendas, 0);
  const receitaMesEquipe = ranking.reduce((s, r) => s + r.receitaMes, 0);

  const chartData = ranking.map((r) => ({ nome: r.vend.nome.split(" ")[0], vendas: r.totalVendas }));

  return (
    <div>
      <PageHeader title="Equipe de Vendas" subtitle="Ranking mensal, comissões e desempenho da equipe" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Vendedores Ativos" value={db.vendedores.length} icon={Users} accent="primary" />
        <StatCard label="Vendas no Mês" value={ranking.reduce((s, r) => s + r.vendasMes, 0)} icon={Trophy} accent="accent" />
        <StatCard label="Receita do Mês" value={fmtBRL(receitaMesEquipe)} icon={Award} accent="success" />
        <StatCard label="Vendas Totais" value={totalEquipe} icon={Medal} accent="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold mb-1">Ranking — Vendas por Vendedor</h3>
          <p className="text-xs text-muted-foreground mb-5">Total de vendas realizadas no histórico</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.015 270)" />
              <XAxis type="number" stroke="oklch(0.7 0.02 270)" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="nome" stroke="oklch(0.7 0.02 270)" fontSize={12} width={80} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.014 270)", border: "1px solid oklch(0.3 0.015 270)", borderRadius: 8 }} />
              <Bar dataKey="vendas" fill="oklch(0.62 0.22 25)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Pódio do mês</h3>
          </div>
          <ol className="space-y-3">
            {ranking.slice(0, 3).map((r, i) => (
              <li key={r.vend.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: i === 0 ? "var(--gradient-primary)" : i === 1 ? "oklch(0.55 0.02 270)" : "oklch(0.45 0.06 30)",
                    color: "white",
                  }}
                >{i + 1}º</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.vend.nome}</div>
                  <div className="text-xs text-muted-foreground">{r.vendasMes} venda(s) no mês</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Comissão</div>
                  <div className="font-semibold text-accent text-sm">{fmtBRL(r.comissaoMes)}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold">Detalhamento por funcionário</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30">
                <th className="py-3 px-6">#</th>
                <th className="py-3 px-4">Funcionário</th>
                <th className="py-3 px-4">Cargo</th>
                <th className="py-3 px-4 text-center">Vendas (mês)</th>
                <th className="py-3 px-4 text-center">Vendas (total)</th>
                <th className="py-3 px-4 text-right">Receita do mês</th>
                <th className="py-3 px-6 text-right">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.vend.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20">
                  <td className="py-3 px-6 font-bold text-muted-foreground">{i + 1}º</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold">{r.vend.nome}</div>
                    <div className="text-xs text-muted-foreground">{r.vend.email}</div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{r.vend.cargo}</td>
                  <td className="py-3 px-4 text-center font-bold text-primary">{r.vendasMes}</td>
                  <td className="py-3 px-4 text-center">{r.totalVendas}</td>
                  <td className="py-3 px-4 text-right">{fmtBRL(r.receitaMes)}</td>
                  <td className="py-3 px-6 text-right font-semibold text-accent">{fmtBRL(r.comissaoMes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}