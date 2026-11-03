import type { TransacaoDemo } from "./demo-data";

export type EscopoExclusao = "SOMENTE_ESTA" | "ESTA_E_PROXIMAS";

export function selecionarParaExclusao(
  transacoes: TransacaoDemo[],
  id: number,
  escopo: EscopoExclusao,
): TransacaoDemo[] {
  const selecionada = transacoes.find((transacao) => transacao.id === id);

  if (!selecionada) {
    return [];
  }

  const numeroInicial = selecionada.numeroOcorrencia;

  const possuiSequencia =
    selecionada.grupoId !== undefined &&
    numeroInicial !== undefined &&
    (selecionada.modalidade === "PARCELADA" ||
      selecionada.modalidade === "RECORRENTE");

  if (escopo === "SOMENTE_ESTA" || !possuiSequencia) {
    return [selecionada];
  }

  return transacoes.filter(
    (transacao) =>
      transacao.id === selecionada.id ||
      (transacao.grupoId === selecionada.grupoId &&
        transacao.numeroOcorrencia !== undefined &&
        transacao.numeroOcorrencia >= numeroInicial),
  );
}
