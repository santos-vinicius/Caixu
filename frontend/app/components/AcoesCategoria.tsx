"use client";

import { useRef, useState, type FormEvent } from "react";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import type { CategoriaDemo } from "@/app/lib/categorias-demo";

type AcoesCategoriaProps = {
  categoria: CategoriaDemo;
  onComplete: (mensagem: string) => void;
};

export default function AcoesCategoria({
  categoria,
  onComplete,
}: AcoesCategoriaProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);

  const { transacoes, renomearCategoria, excluirCategoria } = useTransacoes();

  const [acao, setAcao] = useState<"EDITAR" | "EXCLUIR">("EDITAR");
  const [nome, setNome] = useState(categoria.nomeCategoria);
  const [erro, setErro] = useState("");

  const prefixo = `categoria-${categoria.id}`;
  const editando = acao === "EDITAR";

  const vinculadas = transacoes.filter(
    (transacao) => transacao.categoriaId === categoria.id,
  ).length;

  function abrir(operacao: "EDITAR" | "EXCLUIR") {
    setAcao(operacao);
    setNome(categoria.nomeCategoria);
    setErro("");
    dialogRef.current?.showModal();
    cancelarRef.current?.focus();
  }

  function confirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editando) {
      const mensagemErro = renomearCategoria(categoria.id, nome);

      if (mensagemErro) {
        setErro(mensagemErro);
        return;
      }

      dialogRef.current?.close();
      onComplete("Nome da categoria atualizado.");
      return;
    }

    dialogRef.current?.close();

    onComplete(
      `Categoria excluída. ${vinculadas} lançamento(s) ficaram sem categoria. Os saldos foram preservados.`,
    );

    excluirCategoria(categoria.id);
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => abrir("EDITAR")}
          aria-haspopup="dialog"
          aria-label={`Editar categoria ${categoria.nomeCategoria}`}
          className="min-h-11 rounded-xl px-3 text-sm font-bold text-primary hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={() => abrir("EXCLUIR")}
          aria-haspopup="dialog"
          aria-label={`Excluir categoria ${categoria.nomeCategoria}`}
          className="min-h-11 rounded-xl px-3 text-sm font-bold text-negative hover:bg-negative-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negative"
        >
          Excluir
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${prefixo}-titulo`}
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-6 text-foreground backdrop:bg-brand-plum/60"
      >
        <h2
          id={`${prefixo}-titulo`}
          className="font-heading text-2xl font-extrabold"
        >
          {editando ? "Renomear categoria" : "Excluir categoria?"}
        </h2>

        <form onSubmit={confirmar} className="mt-5 space-y-4">
          {editando ? (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${prefixo}-nome`} className="text-sm font-bold">
                Nome
              </label>

              <input
                id={`${prefixo}-nome`}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                maxLength={60}
                className="h-12 rounded-xl border-2 border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />

              <p className="text-sm text-muted">
                O tipo e os vínculos com os lançamentos serão mantidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-bold wrap-break-word">
                {categoria.nomeCategoria}
              </p>

              <p className="text-sm text-muted">
                {vinculadas === 0
                  ? "Nenhum lançamento está vinculado a esta categoria."
                  : `${vinculadas} lançamento(s) passarão a ficar sem categoria.`}
              </p>

              <p className="text-sm text-muted">
                Nenhum lançamento será excluído. Seus saldos permanecerão
                iguais.
              </p>
            </div>
          )}

          {erro && (
            <p role="alert" className="text-sm font-bold text-negative">
              {erro}
            </p>
          )}

          <footer className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
            <button
              ref={cancelarRef}
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="min-h-12 rounded-xl border border-border px-4 font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`min-h-12 rounded-xl px-4 font-bold text-brand-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                editando ? "bg-primary" : "bg-negative"
              }`}
            >
              {editando ? "Salvar nome" : "Excluir categoria"}
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
