"use client";

import { useRef, useState, type FormEvent } from "react";
import { excluirConta } from "@/app/lib/usuarios-api";
import { useTransacoes } from "./TransacoesProvider";

export default function ExcluirConta() {
  const { usuario } = useTransacoes();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  const operacaoEmAndamento = useRef(false);

  async function confirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (operacaoEmAndamento.current || confirmacao !== "EXCLUIR") return;
    operacaoEmAndamento.current = true;
    setExcluindo(true);
    setErro("");
    try {
      await excluirConta(usuario.id);
      window.location.replace("/login");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível excluir sua conta.");
      operacaoEmAndamento.current = false;
      setExcluindo(false);
    }
  }

  return (
    <section aria-labelledby="excluir-conta-title" className="mt-6 border-t border-border pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 id="excluir-conta-title" className="text-sm font-bold">Encerrar minha conta</h3>
          <p className="mt-1 text-xs text-muted">Remove seu perfil, suas categorias e todas as transações.</p>
        </div>
        <button type="button" aria-haspopup="dialog" onClick={() => {
          setConfirmacao(""); setErro(""); dialogRef.current?.showModal();
        }} className="min-h-11 rounded-xl border border-negative px-4 text-sm font-bold text-negative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negative">
          Excluir conta
        </button>
      </div>
      <dialog ref={dialogRef} aria-labelledby="confirmar-exclusao-conta-title"
        onCancel={(event) => { if (excluindo) event.preventDefault(); }}
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-4 text-foreground sm:p-6 backdrop:bg-brand-plum/60">
        <h2 id="confirmar-exclusao-conta-title" className="font-heading text-xl font-extrabold">Excluir sua conta?</h2>
        <p className="mt-3 text-sm text-muted">Esta ação apaga permanentemente seus dados e lançamentos no Caixu. Não será possível desfazer.</p>
        <form onSubmit={confirmar} className="mt-5 space-y-4" aria-busy={excluindo}>
          <label htmlFor="confirmar-excluir-conta" className="block text-sm font-bold">Digite EXCLUIR para confirmar</label>
          <input id="confirmar-excluir-conta" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)}
            disabled={excluindo} autoComplete="off" spellCheck={false} required
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negative" />
          {erro && <p role="alert" className="text-sm font-bold text-negative">{erro}</p>}
          <footer className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
            <button type="button" disabled={excluindo} onClick={() => dialogRef.current?.close()}
              className="min-h-11 rounded-xl border border-border px-4 font-bold text-primary disabled:opacity-60">Cancelar</button>
            <button type="submit" disabled={excluindo || confirmacao !== "EXCLUIR"}
              className="min-h-11 rounded-xl bg-negative px-4 font-bold text-brand-cream disabled:cursor-not-allowed disabled:opacity-60">
              {excluindo ? "Excluindo..." : "Excluir definitivamente"}
            </button>
          </footer>
        </form>
      </dialog>
    </section>
  );
}
