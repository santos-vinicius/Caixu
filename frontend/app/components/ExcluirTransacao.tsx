"use client";

import { useRef, useState } from "react";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import type { TransacaoDemo } from "@/app/lib/demo-data";
import {
  selecionarParaExclusao,
  type EscopoExclusao,
} from "@/app/lib/exclusao-transacoes";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";

type ExcluirTransacaoProps = {
  transacao: TransacaoDemo;
  onDeleted: (mensagem: string) => void;
};

export default function ExcluirTransacao({
  transacao,
  onDeleted,
}: ExcluirTransacaoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);

  const [escopo, setEscopo] = useState<EscopoExclusao>("SOMENTE_ESTA");

  const { transacoes, excluirTransacao } = useTransacoes();

  const tituloId = `excluir-titulo-${transacao.id}`;
  const descricaoId = `excluir-descricao-${transacao.id}`;

  const proximas = selecionarParaExclusao(
    transacoes,
    transacao.id,
    "ESTA_E_PROXIMAS",
  );

  const quantidade = selecionarParaExclusao(
    transacoes,
    transacao.id,
    escopo,
  ).length;

  function abrirModal() {
    setEscopo("SOMENTE_ESTA");
    dialogRef.current?.showModal();
    cancelarRef.current?.focus();
  }

  function confirmarExclusao() {
    dialogRef.current?.close();

    onDeleted(
      quantidade === 1
        ? "Lançamento excluído. Os saldos foram atualizados."
        : `${quantidade} lançamentos excluídos. Os saldos foram atualizados.`,
    );

    excluirTransacao(transacao.id, escopo);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        aria-haspopup="dialog"
        aria-label={`Excluir ${transacao.descricao} de ${formatarData(
          transacao.dataTransacao,
        )}`}
        className="min-h-11 rounded-xl px-3 text-sm font-bold text-negative hover:bg-negative-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negative"
      >
        Excluir
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={tituloId}
        aria-describedby={descricaoId}
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-4 text-foreground sm:p-6 backdrop:bg-brand-plum/60"
      >
        <h2 id={tituloId} className="font-heading text-2xl font-extrabold">
          Excluir lançamento?
        </h2>

        <p id={descricaoId} className="mt-3 text-sm text-muted">
          Confira quais lançamentos deseja remover. Os anteriores à ocorrência
          selecionada serão mantidos.
        </p>

        <div className="mt-5 rounded-xl border border-border bg-background p-4">
          <p className="font-bold wrap-break-word">{transacao.descricao}</p>

          <p className="mt-1 text-sm text-muted">
            {formatarData(transacao.dataTransacao)}
          </p>

          {transacao.modalidade === "PARCELADA" && (
            <p className="mt-1 text-sm text-muted">
              {transacao.tipoMovimento === "RECEITA"
                ? "Recebimento"
                : "Parcela"}{" "}
              {transacao.numeroOcorrencia} de {transacao.totalOcorrencias}
            </p>
          )}

          <p className="mt-2 font-extrabold tabular-nums">
            {transacao.tipoMovimento === "RECEITA" ? "+" : "−"}{" "}
            {formatarMoeda(transacao.valor)}
          </p>
        </div>

        {proximas.length > 1 && (
          <fieldset className="mt-5">
            <legend className="text-sm font-bold">O que deseja excluir?</legend>

            <div className="mt-3 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
                <input
                  type="radio"
                  name={`escopo-${transacao.id}`}
                  value="SOMENTE_ESTA"
                  checked={escopo === "SOMENTE_ESTA"}
                  onChange={() => setEscopo("SOMENTE_ESTA")}
                  className="size-4 accent-negative"
                />
                <span className="text-sm font-bold">
                  Somente esta ocorrência
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
                <input
                  type="radio"
                  name={`escopo-${transacao.id}`}
                  value="ESTA_E_PROXIMAS"
                  checked={escopo === "ESTA_E_PROXIMAS"}
                  onChange={() => setEscopo("ESTA_E_PROXIMAS")}
                  className="size-4 accent-negative"
                />

                <span className="text-sm">
                  <span className="block font-bold">Esta e as próximas</span>
                  <span className="text-muted">
                    {proximas.length} lançamentos deste mesmo grupo.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        )}

        <p role="status" className="mt-4 text-sm font-bold text-negative">
          {quantidade === 1
            ? "1 lançamento será excluído."
            : `${quantidade} lançamentos serão excluídos.`}
        </p>

        <footer className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelarRef}
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="min-h-12 rounded-xl border border-border px-4 font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmarExclusao}
            className="min-h-12 rounded-xl bg-negative px-4 font-bold text-brand-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negative"
          >
            Excluir {quantidade === 1 ? "lançamento" : "lançamentos"}
          </button>
        </footer>
      </dialog>
    </>
  );
}
