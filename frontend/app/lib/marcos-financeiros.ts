import type { DiaFinanceiro } from "./calendario";

export function selecionarMarcos(
  dias: DiaFinanceiro[],
  dataReferencia: string,
): DiaFinanceiro[] {
  const ultimoDia = dias[dias.length - 1];

  if (!ultimoDia) {
    return [];
  }

  function variacaoCentavos(dia: DiaFinanceiro) {
    return Math.round(dia.entradas * 100) - Math.round(dia.saidas * 100);
  }

  // O fechamento terá sua própria posição, evitando duplicação.
  const candidatos = dias.filter(
    (dia) =>
      dia.data > dataReferencia &&
      dia.data < ultimoDia.data &&
      variacaoCentavos(dia) !== 0,
  );

  const primeiraQuedaNegativa = dias.find((dia, indice) => {
    const anterior = dias[indice - 1];

    return (
      dia.data > dataReferencia &&
      dia.data < ultimoDia.data &&
      anterior !== undefined &&
      anterior.saldoAcumulado >= 0 &&
      dia.saldoAcumulado < 0
    );
  });

  const porImpacto = [...candidatos].sort(
    (a, b) =>
      Math.abs(variacaoCentavos(b)) - Math.abs(variacaoCentavos(a)) ||
      a.data.localeCompare(b.data),
  );

  const selecionados = primeiraQuedaNegativa
    ? [
        primeiraQuedaNegativa,
        ...porImpacto.filter((dia) => dia.data !== primeiraQuedaNegativa.data),
      ]
    : porImpacto;

  return selecionados.slice(0, 3).sort((a, b) => a.data.localeCompare(b.data));
}
