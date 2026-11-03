export type TransacaoDemo = {
  id: number;
  descricao: string;
  valor: number;
  dataTransacao: string;
  tipoMovimento: "RECEITA" | "DESPESA";
  categoriaId?: number;
  modalidade?: "UNICA" | "RECORRENTE" | "PARCELADA";
  grupoId?: string;
  numeroOcorrencia?: number;
  totalOcorrencias?: number;
  frequencia?: "MENSAL" | "SEMANAL";
};

export const dataReferencia = "2026-11-02";
export const saldoInicial = 1000;

export const transacoesDemo: TransacaoDemo[] = [
  {
    id: 1,
    descricao: "Salário",
    valor: 3000,
    dataTransacao: "2026-11-01",
    tipoMovimento: "RECEITA",
  },
  {
    id: 2,
    descricao: "Despesas do início do mês",
    valor: 1550,
    dataTransacao: "2026-11-02",
    tipoMovimento: "DESPESA",
  },
  {
    id: 3,
    descricao: "Aluguel",
    valor: 4000,
    dataTransacao: "2026-11-05",
    tipoMovimento: "DESPESA",
  },
  {
    id: 4,
    descricao: "Internet",
    valor: 130,
    dataTransacao: "2026-11-10",
    tipoMovimento: "DESPESA",
  },
  {
    id: 5,
    descricao: "Trabalho extra",
    valor: 2000,
    dataTransacao: "2026-11-15",
    tipoMovimento: "RECEITA",
  },
  {
    id: 6,
    descricao: "Contas da casa",
    valor: 260,
    dataTransacao: "2026-11-20",
    tipoMovimento: "DESPESA",
  },
];

function calcularSaldo(transacoes: TransacaoDemo[]) {
  return transacoes.reduce(
    (saldo, transacao) =>
      saldo +
      (transacao.tipoMovimento === "RECEITA"
        ? transacao.valor
        : -transacao.valor),
    saldoInicial,
  );
}

export const saldoAtual = calcularSaldo(
  transacoesDemo.filter(
    (transacao) => transacao.dataTransacao <= dataReferencia,
  ),
);

export const saldoProjetado = calcularSaldo(transacoesDemo);

export const ultimasTransacoes = transacoesDemo
  .filter((transacao) => transacao.dataTransacao <= dataReferencia)
  .sort((a, b) => b.dataTransacao.localeCompare(a.dataTransacao))
  .slice(0, 5);

export const despesasFuturas = transacoesDemo
  .filter(
    (transacao) =>
      transacao.tipoMovimento === "DESPESA" &&
      transacao.dataTransacao > dataReferencia,
  )
  .sort((a, b) => a.dataTransacao.localeCompare(b.dataTransacao));
