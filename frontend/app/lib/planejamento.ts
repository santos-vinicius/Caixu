export type Modalidade = "UNICA" | "RECORRENTE" | "PARCELADA";
export type Frequencia = "MENSAL" | "SEMANAL";

export type PlanejamentoRascunho = {
  modalidade: Modalidade;
  frequencia: Frequencia;
  valor: string;
  primeiraData: string;
  quantidade: string;
};

export function criarPlanejamentoInicial(): PlanejamentoRascunho {
  return {
    modalidade: "UNICA",
    frequencia: "MENSAL",
    valor: "",
    primeiraData: "",
    quantidade: "2",
  };
}

type PlanejamentoParams = {
  modalidade: Modalidade;
  frequencia: Frequencia;
  valor: string;
  primeiraData: string;
  quantidade: number;
};

export type Ocorrencia = {
  numero: number;
  data: string;
  valor: number;
};

export function gerarPlanejamento({
  modalidade,
  frequencia,
  valor,
  primeiraData,
  quantidade,
}: PlanejamentoParams): Ocorrencia[] {
  const quantidadeFinal = modalidade === "UNICA" ? 1 : quantidade;

  // Limite inicial da prévia: até 120 ocorrências.
  if (
    !Number.isInteger(quantidadeFinal) ||
    quantidadeFinal < 1 ||
    quantidadeFinal > 120 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(primeiraData) ||
    !/^\d+([.,]\d{1,2})?$/.test(valor)
  ) {
    return [];
  }

  const valorCentavos = Math.round(Number(valor.replace(",", ".")) * 100);

  if (!Number.isSafeInteger(valorCentavos) || valorCentavos <= 0) {
    return [];
  }

  // Nenhuma parcela pode ficar abaixo de um centavo.
  if (modalidade === "PARCELADA" && valorCentavos < quantidadeFinal) {
    return [];
  }

  const [ano, mes, dia] = primeiraData.split("-").map(Number);
  const inicio = new Date(Date.UTC(ano, mes - 1, dia));

  if (inicio.toISOString().slice(0, 10) !== primeiraData) {
    return [];
  }

  const parcelaBase = Math.floor(valorCentavos / quantidadeFinal);
  const resto = valorCentavos % quantidadeFinal;

  return Array.from({ length: quantidadeFinal }, (_, indice) => {
    let data: Date;

    if (modalidade === "RECORRENTE" && frequencia === "SEMANAL") {
      data = new Date(Date.UTC(ano, mes - 1, dia + indice * 7));
    } else {
      const ultimoDia = new Date(Date.UTC(ano, mes + indice, 0)).getUTCDate();

      data = new Date(
        Date.UTC(ano, mes - 1 + indice, Math.min(dia, ultimoDia)),
      );
    }

    const centavos =
      modalidade === "PARCELADA"
        ? parcelaBase + (indice < resto ? 1 : 0)
        : valorCentavos;

    return {
      numero: indice + 1,
      data: data.toISOString().slice(0, 10),
      valor: centavos / 100,
    };
  });
}
