export type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  dataTransacao: string;
  tipoMovimento: "RECEITA" | "DESPESA";
  categoriaId?: number;
  metodoPagamento?: string | null;
  status?: string | null;
  modalidade?: "UNICA" | "RECORRENTE" | "PARCELADA";
  grupoId?: string;
  numeroOcorrencia?: number;
  totalOcorrencias?: number;
  frequencia?: "MENSAL" | "SEMANAL";
  criadoEm?: string;
};
export type NovaTransacao = Omit<Transacao, "id" | "criadoEm">;
