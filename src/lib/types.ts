export type Categoria = "SUV" | "Sedan" | "Hatch" | "Picape" | "Esportivo";
export type StatusVeiculo = "disponivel" | "vendido" | "reservado";

export interface Veiculo {
  id: string;
  modelo: string;
  marca: string;
  ano: number;
  categoria: Categoria;
  cor: string;
  km: number;
  precoCusto: number;
  precoVenda: number;
  status: StatusVeiculo;
  dataEntrada: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  comissaoPct: number; // %
}

export interface Venda {
  id: string;
  veiculoId: string;
  vendedorId: string;
  cliente: string;
  precoFinal: number;
  data: string; // ISO
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: "Aluguel" | "Salários" | "Marketing" | "Manutenção" | "Outros";
}