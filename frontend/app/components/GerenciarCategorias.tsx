"use client";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import AcoesCategoria from "./AcoesCategoria";

export default function GerenciarCategorias() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { categorias, adicionarCategoria } = useTransacoes();
  const [salvando, setSalvando] = useState(false);
  const operacaoEmAndamento = useRef(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"DESPESA" | "RECEITA">("DESPESA");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function abrirModal() {
    setNome("");
    setTipo("DESPESA");
    setErro("");
    dialogRef.current?.showModal();
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (operacaoEmAndamento.current) {
      return;
    }

    operacaoEmAndamento.current = true;
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      await adicionarCategoria(nome.trim(), tipo);

      dialogRef.current?.close();
      informarAlteracao(`Categoria “${nome.trim()}” criada.`);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a categoria.",
      );
    } finally {
      operacaoEmAndamento.current = false;
      setSalvando(false);
    }
  }

  const campoClasse =
    "h-12 w-full rounded-xl border-2 border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  const quantidadeGastos = categorias.filter(
    (categoria) => categoria.tipoCategoria === "DESPESA",
  ).length;

  const quantidadeRecebimentos = categorias.filter(
    (categoria) => categoria.tipoCategoria === "RECEITA",
  ).length;

  const mensagemRef = useRef<HTMLParagraphElement>(null);

  function informarAlteracao(texto: string) {
    setMensagem(texto);
    mensagemRef.current?.focus();
  }

  return (
    <div className="mt-6">
      <p
        role="status"
        aria-live="polite"
        ref={mensagemRef}
        tabIndex={-1}
        className={
          mensagem
            ? "mt-4 rounded-xl border border-positive bg-positive-background p-4 text-sm font-bold text-positive"
            : "sr-only"
        }
      >
        {mensagem}
      </p>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section
          aria-labelledby="suas-categorias-title"
          className="min-w-0 overflow-hidden rounded-3xl border border-border bg-surface"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <h2
              id="suas-categorias-title"
              className="font-heading text-xl font-extrabold"
            >
              Suas categorias
            </h2>

            <span className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted">
              {categorias.length}{" "}
              {categorias.length === 1 ? "categoria" : "categorias"}
            </span>
            <button
              type="button"
              onClick={abrirModal}
              aria-haspopup="dialog"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto xl:hidden"
            >
              + Nova categoria
            </button>
          </header>

          {categorias.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <h3 className="font-heading text-lg font-extrabold">
                Suas categorias começam aqui.
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                Crie uma categoria para organizar seus gastos e recebimentos.
                Seus lançamentos podem continuar sem categoria.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {[...categorias]
                .sort((a, b) =>
                  a.nomeCategoria.localeCompare(b.nomeCategoria, "pt-BR"),
                )
                .map((categoria) => {
                  const receita = categoria.tipoCategoria === "RECEITA";

                  return (
                    <li
                      key={categoria.id}
                      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-4 sm:px-5"
                    >
                      <div className="min-w-0">
                        <h3 className="font-bold [overflow-wrap:anywhere]">
                          {categoria.nomeCategoria}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold ${receita ? "bg-positive-background text-positive" : "bg-negative-background text-negative"}`}
                          >
                            {receita ? "Recebimento" : "Gasto"}
                          </span>
                        </div>
                      </div>

                      <AcoesCategoria
                        categoria={categoria}
                        onComplete={informarAlteracao}
                      />
                    </li>
                  );
                })}
            </ul>
          )}
        </section>

        <aside
          aria-labelledby="organizar-categorias-title"
          className="hidden rounded-3xl border border-border bg-raised p-6 xl:block"
        >
          <Image
            src="/images/caixu-organizar.svg"
            alt=""
            width={80}
            height={80}
            className="mx-auto h-auto w-20"
          />

          <h2
            id="organizar-categorias-title"
            className="mt-4 font-heading text-xl font-extrabold"
          >
            Cada coisa no seu lugar.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            Separe seus gastos e recebimentos com nomes que façam sentido para
            você.
          </p>

          <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-sm leading-relaxed text-primary">
            <span className="font-bold">Dica:</span> você pode categorizar seus
            lançamentos depois.
          </p>

          <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt>Categorias de gastos</dt>
              <dd className="font-extrabold tabular-nums">
                {quantidadeGastos}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt>Categorias de recebimentos</dt>
              <dd className="font-extrabold tabular-nums">
                {quantidadeRecebimentos}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={abrirModal}
            aria-haspopup="dialog"
            className="mt-6 min-h-12 w-full rounded-xl bg-primary px-4 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Criar uma categoria
          </button>
        </aside>
      </div>

      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          if (salvando) {
            event.preventDefault();
          }
        }}
        aria-labelledby="nova-categoria-title"
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-4 text-foreground sm:p-6 backdrop:bg-brand-plum/60"
      >
        <h2
          id="nova-categoria-title"
          className="font-heading text-2xl font-extrabold"
        >
          Nova categoria
        </h2>

        <form onSubmit={salvar} className="mt-6 space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="categoria-nome" className="text-sm font-bold">
              Nome
            </label>

            <input
              id="categoria-nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Educação"
              maxLength={60}
              required
              className={campoClasse}
              disabled={salvando}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="categoria-tipo" className="text-sm font-bold">
              Usar para
            </label>

            <select
              id="categoria-tipo"
              value={tipo}
              disabled={salvando}
              onChange={(event) =>
                setTipo(event.target.value as "DESPESA" | "RECEITA")
              }
              className={campoClasse}
            >
              <option value="DESPESA">Gastos</option>
              <option value="RECEITA">Recebimentos</option>
            </select>
          </div>

          {erro && (
            <p role="alert" className="text-sm font-bold text-negative">
              {erro}
            </p>
          )}

          <footer className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              disabled={salvando}
              onClick={() => dialogRef.current?.close()}
              className="min-h-12 rounded-xl border border-border px-4 font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="min-h-12 rounded-xl bg-primary px-4 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {salvando ? "Criando..." : "Criar categoria"}
            </button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}
