export type Empresa = {
  id?: string;

  nomeEmpresa: string;

  responsavel: "Pedro" | "Jean" | "Jeff" | "Natalia" | "Clarice" | "";

  tipo: "Fast" | "Safety" | "";

  dataEntrada: string;

  alerta?: boolean;

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
  departamento: string;
  responsavel: string;
  createdAt?: number;
  dataOcorrencia: number;
  updatedAt?: number;
  temaOcorrencia?: string[];
  atualizacoes?: Atualizacao[];
};

export type OcorrenciaForm = {
  empresa: string;
  tipo: string;
  descricao: string;
  departamento: string;
  responsavel: string;
  dataOcorrencia: string;
  horaOcorrencia?: string;
  temaOcorrencia?: string[];
};

export type Atualizacao = {
  descricao: string;
  updatedAt: number;
  responsavel?: string;
};

export interface Historico {
  id?: string;

  empresaId: string;

  tipo: string;

  descricao?: string;

  data: string;

  createdAt?: number;

  updatedAt?: number;
}
