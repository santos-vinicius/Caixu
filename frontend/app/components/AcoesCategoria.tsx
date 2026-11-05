"use client";

import { useRef, useState, type FormEvent } from "react";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import type { Categoria } from "@/app/lib/categorias-api";
type AcoesCategoriaProps = {
  categoria: Categoria;
  onComplete: (mensagem: string) => void;
};

export default function AcoesCategoria({
  categoria,
  onComplete,
}: AcoesCategoriaProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);

  const { renomearCategoria, excluirCategoria } = useTransacoes();

  const [acao, setAcao] = useState<"EDITAR" | "EXCLUIR">("EDITAR");
  const [nome, setNome] = useState(categoria.nomeCategoria);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const operacaoEmAndamento = useRef(false);

  const prefixo = `categoria-${categoria.id}`;
  const editando = acao === "EDITAR";

  function abrir(operacao: "EDITAR" | "EXCLUIR") {
    setAcao(operacao);
    setNome(categoria.nomeCategoria);
    setErro("");
    dialogRef.current?.showModal();
    cancelarRef.current?.focus();
  }

  async function confirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (operacaoEmAndamento.current) {
      return;
    }

    operacaoEmAndamento.current = true;
    setSalvando(true);
    setErro("");

    try {
      if (editando) {
        const mensagemErro = await renomearCategoria(categoria.id, nome);

        if (mensagemErro) {
          setErro(mensagemErro);
          return;
        }

        dialogRef.current?.close();
        onComplete("Nome da categoria atualizado.");
      } else {
        await excluirCategoria(categoria.id);

        dialogRef.current?.close();
        onComplete(
          "Categoria excluída. As transações vinculadas foram preservadas.",
        );
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      operacaoEmAndamento.current = false;
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => abrir("EDITAR")}
          aria-haspopup="dialog"
          aria-label={`Editar categoria ${categoria.nomeCategoria}`}
          className="min-h-11 rounded-xl px-3 text-sm font-bold text-primary hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 sm:hidden"
          >
            <path d="m16 3 5 5M4 20l4-1 13-13a2.1 2.1 0 0 0-5-5L3 14l-1 7Z" />
          </svg>
          <span className="hidden sm:inline">Editar</span>
        </button>

        <button
          type="button"
          onClick={() => abrir("EXCLUIR")}
          aria-haspopup="dialog"
          aria-label={`Excluir categoria ${categoria.nomeCategoria}`}
          className="min-h-11 rounded-xl px-3 text-sm font-bold text-negative hover:bg-negative-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negative"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 sm:hidden"
          >
            <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
          </svg>
          <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          if (salvando) {
            event.preventDefault();
          }
        }}
        aria-labelledby={`${prefixo}-titulo`}
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-4 text-foreground sm:p-6 backdrop:bg-brand-plum/60"
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
                disabled={salvando}
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
                As transações vinculadas a esta categoria ficarão sem categoria.
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
              disabled={salvando}
              onClick={() => dialogRef.current?.close()}
              className="min-h-12 rounded-xl border border-border px-4 font-bold text-primary 
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className={`min-h-12 rounded-xl px-4 font-bold text-brand-cream focus-visible:outline-2 focus-visible:outline-offset-2 
                focus-visible:outline-primary ${
                  editando
                    ? "bg-primary"
                    : "bg-negative disabled:cursor-not-allowed disabled:opacity-60"
                }`}
            >
              {salvando
                ? "Aguarde..."
                : editando
                  ? "Salvar nome"
                  : "Excluir categoria"}
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
