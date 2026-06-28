import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, TrendingDown, TrendingUp, Wallet, Download } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { actions, fmtBRL, fmtDate, useDB } from "@/lib/store";
import { PageHeader, StatCard } from "@/components/Shared";
import { PasswordGate } from "@/components/PasswordGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Despesa } from "@/lib/types";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — AutoStock" },
      { name: "description", content: "Controle financeiro mensal, lucros e relatórios gerenciais." },
    ],
  }),
  component: () => (
    <PasswordGate
      storageKey="gate-financeiro"
      expected="financeiro123"
      title="Área Financeira"
      description="Dados sigilosos da revenda. Apenas para o setor financeiro."
    >
      <Financeiro />
    </PasswordGate>
  ),
});

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function Financeiro() {
  const db = useDB();

  const mensal = useMemo(() => {
    const map = new Map<string, { mes: string; receita: number; despesa: number; lucro: number }>();
    db.vendas.forEach((v) => {
      const k = monthKey(v.data);
      const veh = db.veiculos.find((x) => x.id === v.veiculoId);
      const lucroVenda = veh ? v.precoFinal - veh.precoCusto : 0;
      const cur = map.get(k) ?? { mes: k, receita: 0, despesa: 0, lucro: 0 };
      cur.receita += v.precoFinal;
      cur.lucro += lucroVenda;
      map.set(k, cur);
    });
    db.despesas.forEach((d) => {
      const k = monthKey(d.data);
      const cur = map.get(k) ?? { mes: k, receita: 0, despesa: 0, lucro: 0 };
      cur.despesa += d.valor;
      cur.lucro -= d.valor;
      map.set(k, cur);
    });
    return Array.from(map.values()).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [db]);

  const totais = useMemo(() => {
    const receita = db.vendas.reduce((s, v) => s + v.precoFinal, 0);
    const despesa = db.despesas.reduce((s, d) => s + d.valor, 0);
    const lucroBruto = db.vendas.reduce((s, v) => {
      const veh = db.veiculos.find((x) => x.id === v.veiculoId);
      return s + (veh ? v.precoFinal - veh.precoCusto : 0);
    }, 0);
    return { receita, despesa, lucroLiquido: lucroBruto - despesa, lucroBruto };
  }, [db]);

  function exportar() {
    const header = ["Mês", "Receita", "Despesa", "Lucro"].join(",");
    const body = mensal.map((m) => [m.mes, m.receita, m.despesa, m.lucro].join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Controle Financeiro"
        subtitle="Receitas, despesas e lucros consolidados mês a mês"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportar} className="border-border">
              <Download className="h-4 w-4 mr-1" /> Relatório
            </Button>
            <NovaDespesaDialog />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Receita Total" value={fmtBRL(totais.receita)} icon={ArrowUpRight} accent="success" />
        <StatCard label="Despesas" value={fmtBRL(totais.despesa)} icon={ArrowDownRight} accent="primary" />
        <StatCard label="Lucro Bruto" value={fmtBRL(totais.lucroBruto)} hint="Receita - custo dos veículos" icon={TrendingUp} accent="accent" />
        <StatCard label="Lucro Líquido" value={fmtBRL(totais.lucroLiquido)} hint="Após despesas" icon={Wallet} accent="info" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 mb-8 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold mb-1">Evolução mensal</h3>
        <p className="text-xs text-muted-foreground mb-5">Comparativo de receita, despesa e lucro por mês</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mensal}>
            <defs>
              <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.17 155)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.7 0.17 155)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gDespesa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.74 0.16 60)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.74 0.16 60)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.015 270)" />
            <XAxis dataKey="mes" stroke="oklch(0.7 0.02 270)" fontSize={12} />
            <YAxis stroke="oklch(0.7 0.02 270)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number) => fmtBRL(v)}
              contentStyle={{ background: "oklch(0.21 0.014 270)", border: "1px solid oklch(0.3 0.015 270)", borderRadius: 8 }}
            />
            <Area type="monotone" dataKey="receita" stroke="oklch(0.7 0.17 155)" fill="url(#gReceita)" strokeWidth={2} name="Receita" />
            <Area type="monotone" dataKey="despesa" stroke="oklch(0.62 0.22 25)" fill="url(#gDespesa)" strokeWidth={2} name="Despesa" />
            <Area type="monotone" dataKey="lucro" stroke="oklch(0.74 0.16 60)" fill="url(#gLucro)" strokeWidth={2} name="Lucro" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" /><h3 className="font-semibold">Lucro por venda</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 px-6">Veículo</th>
                  <th className="py-3 px-4 text-right">Venda</th>
                  <th className="py-3 px-6 text-right">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {db.vendas.map((v) => {
                  const veh = db.veiculos.find((x) => x.id === v.veiculoId);
                  const lucro = veh ? v.precoFinal - veh.precoCusto : 0;
                  return (
                    <tr key={v.id} className="border-b border-border/40 last:border-0">
                      <td className="py-2.5 px-6">{veh ? `${veh.marca} ${veh.modelo}` : "—"}</td>
                      <td className="py-2.5 px-4 text-right">{fmtBRL(v.precoFinal)}</td>
                      <td className="py-2.5 px-6 text-right font-semibold text-success">{fmtBRL(lucro)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" /><h3 className="font-semibold">Despesas</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 px-6">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-6 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {db.despesas.map((d) => (
                  <tr key={d.id} className="border-b border-border/40 last:border-0">
                    <td className="py-2.5 px-6">{d.descricao}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{d.categoria}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{fmtDate(d.data)}</td>
                    <td className="py-2.5 px-6 text-right font-semibold text-destructive">- {fmtBRL(d.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATS: Despesa["categoria"][] = ["Aluguel", "Salários", "Marketing", "Manutenção", "Outros"];

function NovaDespesaDialog() {
  const [open, setOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [categoria, setCategoria] = useState<Despesa["categoria"]>("Outros");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    actions.addDespesa({ descricao, valor, categoria, data: new Date().toISOString() });
    setOpen(false);
    setDescricao(""); setValor(0); setCategoria("Outros");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-primary-foreground border-0" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle>Registrar despesa</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</label>
            <Input required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-input border-border mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Categoria</label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as Despesa["categoria"]) }>
              <SelectTrigger className="bg-input border-border mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Valor (R$)</label>
            <Input type="number" required value={valor} onChange={(e) => setValor(+e.target.value)} className="bg-input border-border mt-1" />
          </div>
          <DialogFooter>
            <Button type="submit" className="text-primary-foreground border-0" style={{ background: "var(--gradient-primary)" }}>
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}