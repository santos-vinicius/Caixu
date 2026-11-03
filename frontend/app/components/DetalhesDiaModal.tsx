"use client";

import { useEffect, useRef } from "react";

import type { TransacaoDemo } from "@/app/lib/demo-data";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";

type DetalhesDiaModalProps = {
  data: string;
  transacoes: TransacaoDemo[];
  onClose: () => void;
};

export default function DetalhesDiaModal({
  data,
  transacoes,
  onClose,
}: DetalhesDiaModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={(event) => {
        if (!event.currentTarget.open) {
          onClose();
        }
      }}
      aria-labelledby="detalhes-dia-title"
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto 
      rounded-3xl border border-border bg-surface p-6 text-foreground backdrop:bg-brand-plum/60"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="detalhes-dia-title"
            className="font-heading text-2xl font-extrabold"
          >
            Movimentações do dia
          </h2>

          <p className="mt-1 text-sm text-muted">{formatarData(data)}</p>
        </div>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Fechar detalhes"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border 
          text-xl text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ×
        </button>
      </header>

      {transacoes.length === 0 ? (
        <p className="mt-6 text-muted">
          Nenhuma movimentação cadastrada para este dia.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {transacoes.map((transacao) => {
            const receita = transacao.tipoMovimento === "RECEITA";

            return (
              <li
                key={transacao.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold wrap-break-word">
                    {transacao.descricao}
                  </p>

                  <p className="text-sm text-muted">
                    {receita ? "Receita" : "Despesa"}
                  </p>
                </div>

                <p
                  className={`font-bold tabular-nums ${
                    receita ? "text-income" : "text-expense"
                  }`}
                >
                  {receita ? "+" : "−"} {formatarMoeda(transacao.valor)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </dialog>
  );
}
