"use client";

import type { Dispatch, SetStateAction } from "react";

import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import {
  gerarPlanejamento,
  type Frequencia,
  type Modalidade,
  type PlanejamentoRascunho,
} from "@/app/lib/planejamento";

type PlanejamentoTransacaoProps = {
  tipoMovimento: "DESPESA" | "RECEITA";
  planejamento: PlanejamentoRascunho;
  onChange: Dispatch<SetStateAction<PlanejamentoRascunho>>;
};

export default function PlanejamentoTransacao({
  tipoMovimento,
  planejamento,
  onChange,
}: PlanejamentoTransacaoProps) {
  const { modalidade, frequencia, valor, primeiraData, quantidade } =
    planejamento;

  const receita = tipoMovimento === "RECEITA";
  const parcelada = modalidade === "PARCELADA";
  const recorrente = modalidade === "RECORRENTE";

  const ocorrencias = gerarPlanejamento({
    modalidade,
    frequencia,
    valor,
    primeiraData,
    quantidade: Number(quantidade),
  });

  const total =
    ocorrencias.reduce(
      (soma, ocorrencia) => soma + Math.round(ocorrencia.valor * 100),
      0,
    ) / 100;

  const pergunta = receita
    ? "Como você receberá esse valor?"
    : "Como esse gasto será lançado?";

  const rotuloValor = parcelada
    ? receita
      ? "Valor total a receber (R$)"
      : "Valor total da compra (R$)"
    : modalidade === "UNICA"
      ? receita
        ? "Valor a receber (R$)"
        : "Valor do gasto (R$)"
      : receita
        ? "Valor de cada recebimento (R$)"
        : "Valor de cada gasto (R$)";

  const rotuloData =
    modalidade === "UNICA"
      ? receita
        ? "Data do recebimento"
        : "Data do gasto"
      : receita
        ? "Data do primeiro recebimento"
        : parcelada
          ? "Data da primeira parcela"
          : "Data do primeiro gasto";

  const rotuloQuantidade = receita
    ? "Quantidade de recebimentos"
    : parcelada
      ? "Quantidade de parcelas"
      : "Quantidade de gastos";

  const ajuda = parcelada
    ? receita
      ? "O valor total será dividido em recebimentos mensais. A quantidade inclui o primeiro recebimento."
      : "O valor total da compra será dividido em parcelas mensais. A quantidade inclui a primeira parcela."
    : recorrente
      ? receita
        ? "O valor informado será recebido a cada período, como um salário. A quantidade inclui o primeiro recebimento."
        : "O valor informado será repetido a cada período, como um aluguel. A quantidade inclui o primeiro gasto."
      : receita
        ? "Será registrado um único recebimento."
        : "Será registrado um único gasto.";

  const unidade = receita
    ? ocorrencias.length === 1
      ? "recebimento"
      : "recebimentos"
    : parcelada
      ? ocorrencias.length === 1
        ? "parcela"
        : "parcelas"
      : ocorrencias.length === 1
        ? "gasto"
        : "gastos";

  const campoClasse =
    "h-12 w-full rounded-xl border-2 border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="mt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="modalidade" className="text-sm font-bold">
            {pergunta}
          </label>

          <select
            id="modalidade"
            value={modalidade}
            onChange={(event) =>
              onChange((atual) => ({
                ...atual,
                modalidade: event.target.value as Modalidade,
              }))
            }
            aria-describedby="planejamento-ajuda"
            className={campoClasse}
          >
            <option value="UNICA">Uma única vez</option>

            <option value="RECORRENTE">
              {receita ? "Recebimento recorrente" : "Gasto recorrente"}
            </option>

            <option value="PARCELADA">
              {receita ? "Receber em partes" : "Compra parcelada"}
            </option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="planejamento-valor" className="text-sm font-bold">
            {rotuloValor}
          </label>

          <input
            id="planejamento-valor"
            type="text"
            inputMode="decimal"
            value={valor}
            required
            onChange={(event) =>
              onChange((atual) => ({
                ...atual,
                valor: event.target.value,
              }))
            }
            placeholder="Ex.: 1200,00"
            aria-describedby="planejamento-ajuda"
            className={campoClasse}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="primeira-data" className="text-sm font-bold">
            {rotuloData}
          </label>

          <input
            id="primeira-data"
            type="date"
            value={primeiraData}
            required
            onChange={(event) =>
              onChange((atual) => ({
                ...atual,
                primeiraData: event.target.value,
              }))
            }
            className={campoClasse}
          />
        </div>

        {modalidade !== "UNICA" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="quantidade" className="text-sm font-bold">
              {rotuloQuantidade}
            </label>

            <input
              id="quantidade"
              type="number"
              min="1"
              max="120"
              step="1"
              value={quantidade}
              required
              onChange={(event) =>
                onChange((atual) => ({
                  ...atual,
                  quantidade: event.target.value,
                }))
              }
              className={campoClasse}
            />
          </div>
        )}

        {recorrente && (
          <div className="flex flex-col gap-2">
            <label htmlFor="frequencia" className="text-sm font-bold">
              {receita ? "Frequência do recebimento" : "Frequência do gasto"}
            </label>

            <select
              id="frequencia"
              value={frequencia}
              onChange={(event) =>
                onChange((atual) => ({
                  ...atual,
                  frequencia: event.target.value as Frequencia,
                }))
              }
              className={campoClasse}
            >
              <option value="MENSAL">Mensal</option>
              <option value="SEMANAL">Semanal</option>
            </select>
          </div>
        )}
      </div>

      <p id="planejamento-ajuda" className="mt-3 text-sm text-muted">
        {ajuda}
      </p>

      <section
        aria-labelledby="previa-title"
        className="mt-6 border-t border-border pt-5"
      >
        <h3 id="previa-title" className="font-bold">
          Confira antes de adicionar
        </h3>

        {ocorrencias.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Informe uma data válida, um valor positivo com até duas casas
            decimais e, quando necessário, uma quantidade inteira entre 1 e 120.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              {ocorrencias.length} {unidade} ·{" "}
              {receita ? "Total a receber" : "Total a pagar"}:{" "}
              {formatarMoeda(total)}
            </p>

            <details className="mt-3 rounded-xl border border-border">
              <summary className="cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                Conferir datas e valores
              </summary>

              <div className="px-4 pb-3">
                <ol className="caixu-scrollbar mt-3 max-h-64 divide-y divide-border overflow-y-auto">
                  {ocorrencias.map((ocorrencia) => {
                    const identificacao = receita
                      ? "Recebimento"
                      : parcelada
                        ? "Parcela"
                        : "Gasto";

                    return (
                      <li
                        key={ocorrencia.numero}
                        className="flex flex-wrap justify-between gap-3 py-3 text-sm"
                      >
                        <span>
                          {identificacao} {ocorrencia.numero}
                          {modalidade !== "UNICA" &&
                            ` de ${ocorrencias.length}`}{" "}
                          · {formatarData(ocorrencia.data)}
                        </span>

                        <strong
                          className={`tabular-nums ${
                            receita ? "text-positive" : "text-negative"
                          }`}
                        >
                          {receita ? "+" : "−"}{" "}
                          {formatarMoeda(ocorrencia.valor)}
                        </strong>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </details>
          </>
        )}

        <p className="mt-4 text-xs text-muted">
          Os lançamentos serão adicionados ao confirmar o formulário.
        </p>
      </section>
    </div>
  );
}
