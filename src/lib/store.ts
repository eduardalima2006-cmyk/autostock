import { useSyncExternalStore } from "react";
import type { Veiculo, Vendedor, Venda, Despesa } from "./types";

interface DB {
  veiculos: Veiculo[];
  vendedores: Vendedor[];
  vendas: Venda[];
  despesas: Despesa[];
}

const KEY = "revenda-db-v1";
const isBrowser = typeof window !== "undefined";

const uid = () => Math.random().toString(36).slice(2, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

function seed(): DB {
  const vendedores: Vendedor[] = [
    { id: "v1", nome: "Carlos Mendes", cargo: "Vendedor Sênior", email: "carlos@revenda.com", comissaoPct: 3 },
    { id: "v2", nome: "Juliana Souza", cargo: "Vendedora", email: "juliana@revenda.com", comissaoPct: 2.5 },
    { id: "v3", nome: "Rafael Lima", cargo: "Vendedor", email: "rafael@revenda.com", comissaoPct: 2.5 },
    { id: "v4", nome: "Patrícia Alves", cargo: "Gerente de Vendas", email: "patricia@revenda.com", comissaoPct: 4 },
  ];

  const veiculos: Veiculo[] = [
    { id: "c1", modelo: "Compass Limited", marca: "Jeep", ano: 2023, categoria: "SUV", cor: "Preto", km: 12000, precoCusto: 135000, precoVenda: 168000, status: "vendido", dataEntrada: daysAgo(60) },
    { id: "c2", modelo: "Corolla XEi", marca: "Toyota", ano: 2024, categoria: "Sedan", cor: "Prata", km: 8000, precoCusto: 145000, precoVenda: 172000, status: "disponivel", dataEntrada: daysAgo(20) },
    { id: "c3", modelo: "HB20 Comfort", marca: "Hyundai", ano: 2023, categoria: "Hatch", cor: "Branco", km: 25000, precoCusto: 62000, precoVenda: 78000, status: "vendido", dataEntrada: daysAgo(55) },
    { id: "c4", modelo: "Hilux SRX", marca: "Toyota", ano: 2024, categoria: "Picape", cor: "Cinza", km: 5000, precoCusto: 280000, precoVenda: 335000, status: "disponivel", dataEntrada: daysAgo(15) },
    { id: "c5", modelo: "Camaro SS", marca: "Chevrolet", ano: 2022, categoria: "Esportivo", cor: "Amarelo", km: 18000, precoCusto: 320000, precoVenda: 389000, status: "disponivel", dataEntrada: daysAgo(10) },
    { id: "c6", modelo: "Tracker LTZ", marca: "Chevrolet", ano: 2024, categoria: "SUV", cor: "Vermelho", km: 9000, precoCusto: 115000, precoVenda: 142000, status: "vendido", dataEntrada: daysAgo(40) },
    { id: "c7", modelo: "Civic Touring", marca: "Honda", ano: 2023, categoria: "Sedan", cor: "Preto", km: 14000, precoCusto: 155000, precoVenda: 188000, status: "reservado", dataEntrada: daysAgo(25) },
    { id: "c8", modelo: "Polo Highline", marca: "Volkswagen", ano: 2024, categoria: "Hatch", cor: "Azul", km: 6000, precoCusto: 88000, precoVenda: 108000, status: "disponivel", dataEntrada: daysAgo(8) },
    { id: "c9", modelo: "Ranger XLT", marca: "Ford", ano: 2023, categoria: "Picape", cor: "Branco", km: 22000, precoCusto: 220000, precoVenda: 268000, status: "vendido", dataEntrada: daysAgo(70) },
    { id: "c10", modelo: "Kicks Exclusive", marca: "Nissan", ano: 2024, categoria: "SUV", cor: "Prata", km: 7000, precoCusto: 105000, precoVenda: 128000, status: "disponivel", dataEntrada: daysAgo(5) },
    { id: "c11", modelo: "Mustang GT", marca: "Ford", ano: 2022, categoria: "Esportivo", cor: "Vermelho", km: 12000, precoCusto: 380000, precoVenda: 455000, status: "vendido", dataEntrada: daysAgo(80) },
    { id: "c12", modelo: "Onix LT", marca: "Chevrolet", ano: 2024, categoria: "Hatch", cor: "Branco", km: 4000, precoCusto: 72000, precoVenda: 89000, status: "disponivel", dataEntrada: daysAgo(3) },
    { id: "c13", modelo: "Compass Sport", marca: "Jeep", ano: 2024, categoria: "SUV", cor: "Cinza", km: 6000, precoCusto: 125000, precoVenda: 155000, status: "vendido", dataEntrada: daysAgo(35) },
    { id: "c14", modelo: "Yaris XL", marca: "Toyota", ano: 2023, categoria: "Hatch", cor: "Vermelho", km: 19000, precoCusto: 78000, precoVenda: 95000, status: "vendido", dataEntrada: daysAgo(45) },
    { id: "c15", modelo: "S10 High Country", marca: "Chevrolet", ano: 2024, categoria: "Picape", cor: "Preto", km: 11000, precoCusto: 260000, precoVenda: 315000, status: "disponivel", dataEntrada: daysAgo(12) },
  ];

  const vendas: Venda[] = [
    { id: uid(), veiculoId: "c1", vendedorId: "v1", cliente: "Marcos Pereira", precoFinal: 165000, data: daysAgo(50) },
    { id: uid(), veiculoId: "c3", vendedorId: "v2", cliente: "Ana Costa", precoFinal: 77000, data: daysAgo(48) },
    { id: uid(), veiculoId: "c6", vendedorId: "v1", cliente: "João Silva", precoFinal: 141000, data: daysAgo(30) },
    { id: uid(), veiculoId: "c9", vendedorId: "v4", cliente: "Construtora ZK", precoFinal: 265000, data: daysAgo(65) },
    { id: uid(), veiculoId: "c11", vendedorId: "v1", cliente: "Bruno Tavares", precoFinal: 450000, data: daysAgo(75) },
    { id: uid(), veiculoId: "c13", vendedorId: "v3", cliente: "Lúcia Ramos", precoFinal: 153000, data: daysAgo(28) },
    { id: uid(), veiculoId: "c14", vendedorId: "v2", cliente: "Felipe Nunes", precoFinal: 94000, data: daysAgo(40) },
  ];

  const despesas: Despesa[] = [
    { id: uid(), descricao: "Aluguel do pátio", valor: 18000, data: daysAgo(5), categoria: "Aluguel" },
    { id: uid(), descricao: "Folha de pagamento", valor: 42000, data: daysAgo(5), categoria: "Salários" },
    { id: uid(), descricao: "Campanha digital", valor: 6500, data: daysAgo(12), categoria: "Marketing" },
    { id: uid(), descricao: "Manutenção dos veículos", valor: 4200, data: daysAgo(18), categoria: "Manutenção" },
    { id: uid(), descricao: "Aluguel do pátio", valor: 18000, data: daysAgo(35), categoria: "Aluguel" },
    { id: uid(), descricao: "Folha de pagamento", valor: 41000, data: daysAgo(35), categoria: "Salários" },
    { id: uid(), descricao: "Aluguel do pátio", valor: 18000, data: daysAgo(65), categoria: "Aluguel" },
    { id: uid(), descricao: "Folha de pagamento", valor: 40000, data: daysAgo(65), categoria: "Salários" },
  ];

  return { veiculos, vendedores, vendas, despesas };
}

function load(): DB {
  if (!isBrowser) return { veiculos: [], vendedores: [], vendas: [], despesas: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

let db: DB | null = null;
const listeners = new Set<() => void>();

function getDB(): DB {
  if (!db) db = load();
  return db;
}

function persist() {
  if (isBrowser && db) localStorage.setItem(KEY, JSON.stringify(db));
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const emptyDB: DB = { veiculos: [], vendedores: [], vendas: [], despesas: [] };

export function useDB(): DB {
  return useSyncExternalStore(
    subscribe,
    () => getDB(),
    () => emptyDB,
  );
}

export const actions = {
  addVeiculo(v: Omit<Veiculo, "id">) {
    const d = getDB();
    d.veiculos.unshift({ ...v, id: uid() });
    persist();
  },
  updateVeiculoStatus(id: string, status: Veiculo["status"]) {
    const d = getDB();
    const i = d.veiculos.findIndex((x) => x.id === id);
    if (i >= 0) d.veiculos[i].status = status;
    persist();
  },
  removeVeiculo(id: string) {
    const d = getDB();
    d.veiculos = d.veiculos.filter((x) => x.id !== id);
    persist();
  },
  addVenda(v: Omit<Venda, "id" | "data"> & { data?: string }) {
    const d = getDB();
    const venda: Venda = { ...v, id: uid(), data: v.data ?? new Date().toISOString() };
    d.vendas.unshift(venda);
    const veh = d.veiculos.find((x) => x.id === v.veiculoId);
    if (veh) veh.status = "vendido";
    persist();
  },
  addDespesa(x: Omit<Despesa, "id">) {
    const d = getDB();
    d.despesas.unshift({ ...x, id: uid() });
    persist();
  },
  addVendedor(x: Omit<Vendedor, "id">) {
    const d = getDB();
    d.vendedores.unshift({ ...x, id: uid() });
    persist();
  },
  resetSeed() {
    db = seed();
    persist();
  },
};

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });