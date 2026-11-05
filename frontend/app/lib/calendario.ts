import type { Transacao } from "./transacoes";

export type DiaFinanceiro = {
  data: string;
  entradas: number;
  saidas: number;
  saldoAcumulado: number;
  futuro: boolean;
};

type CalendarioParams = {
  ano: number;
  mes: number;
  saldoInicial: number;
  transacoes: Transacao[];
  dataReferencia: string;
};

export function gerarCalendario({
  ano,
  mes,
  saldoInicial,
  transacoes,
  dataReferencia,
}: CalendarioParams): DiaFinanceiro[] {
  const prefixo = `${ano}-${String(mes).padStart(2, "0")}`;
  const primeiroDia = `${prefixo}-01`;
  const quantidadeDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate();

  // Acumula em centavos para evitar imprecisões de ponto flutuante.
  let saldoCentavos = Math.round(saldoInicial * 100);

  const movimentos = new Map<string, { entradas: number; saidas: number }>();

  for (const transacao of transacoes) {
    const valorCentavos = Math.round(transacao.valor * 100);
    const receita = transacao.tipoMovimento === "RECEITA";

    if (transacao.dataTransacao < primeiroDia) {
      saldoCentavos += receita ? valorCentavos : -valorCentavos;
      continue;
    }

    if (!transacao.dataTransacao.startsWith(`${prefixo}-`)) {
      continue;
    }

    const dia = movimentos.get(transacao.dataTransacao) ?? {
      entradas: 0,
      saidas: 0,
    };

    if (receita) {
      dia.entradas += valorCentavos;
    } else {
      dia.saidas += valorCentavos;
    }

    movimentos.set(transacao.dataTransacao, dia);
  }

  const dias: DiaFinanceiro[] = [];

  for (let numeroDia = 1; numeroDia <= quantidadeDias; numeroDia++) {
    const data = `${prefixo}-${String(numeroDia).padStart(2, "0")}`;

    const movimento = movimentos.get(data) ?? {
      entradas: 0,
      saidas: 0,
    };

    saldoCentavos += movimento.entradas - movimento.saidas;

    dias.push({
      data,
      entradas: movimento.entradas / 100,
      saidas: movimento.saidas / 100,
      saldoAcumulado: saldoCentavos / 100,
      futuro: data > dataReferencia,
    });
  }

  return dias;
}
