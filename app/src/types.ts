export type Empresa = {
  id?: string;
  nomeEmpresa: string;
  temaText: string;
  dataText: string;
  currentPhase: number;
  updatedAt: number;
};

export type Ocorrencia = {
  id?: string;
  empresa: string;
  tipo: string;
  descricao: string;
  canal: string;
  responsavel: string;
  status: "aberta" | "em_andamento" | "resolvida";
  createdAt?: number;
  updatedAt?: number;
};
