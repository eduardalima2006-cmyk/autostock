import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { actions, fmtBRL, fmtDate, useDB } from "@/lib/store";
import type { Categoria, StatusVeiculo, Veiculo } from "@/lib/types";
import { CategoriaPill, PageHeader, StatusBadge } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — AutoStock" },
      { name: "description", content: "Controle de entrada e saída de veículos organizados por categoria." },
    ],
  }),
  component: Estoque,
});

const CATEGORIAS: Categoria[] = ["SUV", "Sedan", "Hatch", "Picape", "Esportivo"];

const statusBorder: Record<StatusVeiculo, string> = {
  disponivel: "border-l-success",
  vendido: "border-l-destructive",
  reservado: "border-l-warning",
};

function Estoque() {
  const db = useDB();
  const [busca, setBusca] = useState("");
  const [catFilter, setCatFilter] = useState<Categoria | "todas">("todas");
  const [statusFilter, setStatusFilter] = useState<StatusVeiculo | "todos">("todos");

  const filtrados = useMemo(() => {
    return db.veiculos.filter((v) => {
      if (catFilter !== "todas" && v.categoria !== catFilter) return false;
      if (statusFilter !== "todos" && v.status !== statusFilter) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!`${v.marca} ${v.modelo} ${v.cor}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [db.veiculos, catFilter, statusFilter, busca]);

  const porCategoria = useMemo(() => {
    const groups: Record<string, Veiculo[]> = {};
    filtrados.forEach((v) => {
      groups[v.categoria] = groups[v.categoria] || [];
      groups[v.categoria].push(v);
    });
    return groups;
  }, [filtrados]);

  return (
    <div>
      <PageHeader
        title="Estoque de Veículos"
        subtitle="Controle de entrada e saída, organizado por categoria"
        action={<NovoVeiculoDialog />}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por marca, modelo, cor…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
        <Select value={catFilter} onValueChange={(v) => setCatFilter(v as Categoria | "todas")}>
          <SelectTrigger className="w-44 bg-input border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusVeiculo | "todos")}>
          <SelectTrigger className="w-44 bg-input border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="disponivel">Disponível</SelectItem>
            <SelectItem value="reservado">Reservado</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.keys(porCategoria).length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          Nenhum veículo encontrado com esses filtros.
        </div>
      )}

      <div className="space-y-8">
        {CATEGORIAS.filter((c) => porCategoria[c]?.length).map((cat) => (
          <section key={cat}>
            <div className="flex items-center gap-3 mb-3">
              <CategoriaPill categoria={cat} />
              <span className="text-sm text-muted-foreground">
                {porCategoria[cat].length} {porCategoria[cat].length === 1 ? "veículo" : "veículos"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {porCategoria[cat].map((v) => (
                <article
                  key={v.id}
                  className={cn(
                    "rounded-2xl border border-border border-l-4 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:-translate-y-0.5",
                    statusBorder[v.status],
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">{v.marca}</div>
                      <div className="font-bold text-lg leading-tight">{v.modelo}</div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
                    <div><div className="text-foreground font-semibold">{v.ano}</div>Ano</div>
                    <div><div className="text-foreground font-semibold">{v.km.toLocaleString("pt-BR")} km</div>Rodados</div>
                    <div><div className="text-foreground font-semibold">{v.cor}</div>Cor</div>
                  </div>
                  <div className="flex items-end justify-between pt-3 border-t border-border">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Preço de venda</div>
                      <div className="text-xl font-bold text-accent">{fmtBRL(v.precoVenda)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-muted-foreground">Entrada</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(v.dataEntrada)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Select
                      value={v.status}
                      onValueChange={(s) => actions.updateVeiculoStatus(v.id, s as StatusVeiculo)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="reservado">Reservado</SelectItem>
                        <SelectItem value="vendido">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => actions.removeVeiculo(v.id)}
                      aria-label="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function NovoVeiculoDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    marca: "", modelo: "", ano: 2024, categoria: "SUV" as Categoria,
    cor: "", km: 0, precoCusto: 0, precoVenda: 0,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    actions.addVeiculo({
      ...form,
      status: "disponivel",
      dataEntrada: new Date().toISOString(),
    });
    setOpen(false);
    setForm({ marca: "", modelo: "", ano: 2024, categoria: "SUV", cor: "", km: 0, precoCusto: 0, precoVenda: 0 });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-primary-foreground border-0" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Veículo
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader><DialogTitle>Cadastrar veículo</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <Field label="Marca"><Input required value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} /></Field>
          <Field label="Modelo"><Input required value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} /></Field>
          <Field label="Ano"><Input type="number" required value={form.ano} onChange={(e) => setForm({ ...form, ano: +e.target.value })} /></Field>
          <Field label="Categoria">
            <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as Categoria })}>
              <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cor"><Input required value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} /></Field>
          <Field label="KM"><Input type="number" required value={form.km} onChange={(e) => setForm({ ...form, km: +e.target.value })} /></Field>
          <Field label="Preço de custo (R$)"><Input type="number" required value={form.precoCusto} onChange={(e) => setForm({ ...form, precoCusto: +e.target.value })} /></Field>
          <Field label="Preço de venda (R$)"><Input type="number" required value={form.precoVenda} onChange={(e) => setForm({ ...form, precoVenda: +e.target.value })} /></Field>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="submit" className="text-primary-foreground border-0" style={{ background: "var(--gradient-primary)" }}>
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-xs uppercase tracking-wider text-muted-foreground space-y-1.5 block">
      {label}
      <div className="[&_input]:bg-input [&_input]:border-border">{children}</div>
    </label>
  );
}