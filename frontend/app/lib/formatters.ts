export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarSaldoInput(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function interpretarSaldoInput(texto: string): number | null {
  const valor = texto.trim();

  // Aceita 1000,50 ou 1.000,50, incluindo valores negativos.
  const formatoValido = /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(
    valor,
  );

  if (!formatoValido) {
    return null;
  }

  const semMilhares = valor.replace(/\./g, "");
  const negativo = semMilhares.startsWith("-");
  const [inteiro, decimal = ""] = semMilhares.replace(/^-/, "").split(",");

  if (inteiro.length > 13) {
    return null;
  }

  const centavos = Number(inteiro) * 100 + Number(decimal.padEnd(2, "0"));

  if (!Number.isSafeInteger(centavos)) {
    return null;
  }

  return (negativo ? -centavos : centavos) / 100;
}
