import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, FileText, Download } from "lucide-react";
import { actions, fmtBRL, fmtDate, useDB } from "@/lib/store";
import { CategoriaPill, PageHeader } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas — AutoStock" },
      { name: "description", content: "Histórico de vendas, lucros e emissão de relatórios gerenciais." },
    ],
  }),
  component: Vendas,
});

function Vendas() {
  const db = useDB();

  const rows = useMemo(() => {
    return db.vendas.map((v) => {
      const veh = db.veiculos.find((x) => x.id === v.veiculoId);
      const vend = db.vendedores.find((x) => x.id === v.vendedorId);
      const lucro = veh ? v.precoFinal - veh.precoCusto : 0;
      return { v, veh, vend, lucro };
    });
  }, [db]);

  const totalReceita = rows.reduce((s, r) => s + r.v.precoFinal, 0);
  const totalLucro = rows.reduce((s, r) => s + r.lucro, 0);

  function exportarCSV() {
    const header = ["Data", "Veículo", "Categoria", "Cliente", "Vendedor", "Valor", "Lucro"].join(",");
    const body = rows.map((r) => [
      fmtDate(r.v.data),
      r.veh ? `${r.veh.marca} ${r.veh.modelo}` : "—",
      r.veh?.categoria ?? "—",
      r.v.cliente,
      r.vend?.nome ?? "—",
      r.v.precoFinal,
      r.lucro,
    ].join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-vendas-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Registro de vendas, lucros e exportação de relatórios"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarCSV} className="border-border">
              <Download className="h-4 w-4 mr-1" /> Exportar CSV
            </Button>
            <NovaVendaDialog />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total de Vendas</div>
          <div className="text-2xl font-bold mt-2">{rows.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Receita Acumulada</div>
          <div className="text-2xl font-bold mt-2 text-accent">{fmtBRL(totalReceita)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Lucro Bruto</div>
          <div className="text-2xl font-bold mt-2 text-success">{fmtBRL(totalLucro)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Histórico de vendas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30">
                <th className="py-3 px-6">Data</th>
                <th className="py-3 px-4">Veículo</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Vendedor</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-6 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.v.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20">
                  <td className="py-3 px-6 text-muted-foreground">{fmtDate(r.v.data)}</td>
                  <td className="py-3 px-4 font-medium">{r.veh ? `${r.veh.marca} ${r.veh.modelo}` : "—"}</td>
                  <td className="py-3 px-4">{r.veh && <CategoriaPill categoria={r.veh.categoria} />}</td>
                  <td className="py-3 px-4">{r.v.cliente}</td>
                  <td className="py-3 px-4 text-muted-foreground">{r.vend?.nome ?? "—"}</td>
                  <td className="py-3 px-4 text-right font-semibold">{fmtBRL(r.v.precoFinal)}</td>
                  <td className="py-3 px-6 text-right font-semibold text-success">{fmtBRL(r.lucro)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Nenhuma venda registrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NovaVendaDialog() {
  const db = useDB();
  const [open, setOpen] = useState(false);
  const disponiveis = db.veiculos.filter((v) => v.status !== "vendido");
  const [veiculoId, setVeiculoId] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [cliente, setCliente] = useState("");
  const [preco, setPreco] = useState(0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!veiculoId || !vendedorId) return;
    actions.addVenda({ veiculoId, vendedorId, cliente, precoFinal: preco });
    setOpen(false);
    setVeiculoId(""); setVendedorId(""); setCliente(""); setPreco(0);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-primary-foreground border-0" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4 mr-1" /> Registrar Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle>Nova venda</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Veículo</label>
            <Select value={veiculoId} onValueChange={(v) => {
              setVeiculoId(v);
              const veh = db.veiculos.find((x) => x.id === v);
              if (veh) setPreco(veh.precoVenda);
            }}>
              <SelectTrigger className="bg-input border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {disponiveis.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Vendedor</label>
            <Select value={vendedorId} onValueChange={setVendedorId}>
              <SelectTrigger className="bg-input border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {db.vendedores.map((v) => <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</label>
            <Input required value={cliente} onChange={(e) => setCliente(e.target.value)} className="bg-input border-border mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Preço final (R$)</label>
            <Input type="number" required value={preco} onChange={(e) => setPreco(+e.target.value)} className="bg-input border-border mt-1" />
          </div>
          <DialogFooter>
            <Button type="submit" className="text-primary-foreground border-0" style={{ background: "var(--gradient-primary)" }}>
              Confirmar venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}