"use client";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import AcoesCategoria from "./AcoesCategoria";

export default function GerenciarCategorias() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { categorias, adicionarCategoria, transacoes } = useTransacoes();

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

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const nomeTratado = nome.trim();

    if (!nomeTratado || nomeTratado.length > 60) {
      setErro("Informe um nome entre 1 e 60 caracteres.");
      return;
    }

    const duplicada = categorias.some(
      (categoria) =>
        categoria.tipoCategoria === tipo &&
        categoria.nomeCategoria.toLocaleLowerCase("pt-BR") ===
          nomeTratado.toLocaleLowerCase("pt-BR"),
    );

    if (duplicada) {
      setErro("Já existe uma categoria com esse nome e tipo.");
      return;
    }

    adicionarCategoria(nomeTratado, tipo);
    dialogRef.current?.close();
    setMensagem(`Categoria “${nomeTratado}” criada.`);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {categorias.length} categorias cadastradas
        </p>

        <button
          type="button"
          onClick={abrirModal}
          aria-haspopup="dialog"
          className="min-h-12 rounded-xl bg-primary px-5 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          + Nova categoria
        </button>
      </div>

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
          <header className="border-b border-border px-5 py-4">
            <h2
              id="suas-categorias-title"
              className="font-heading text-xl font-extrabold"
            >
              Suas categorias
            </h2>
          </header>

          {categorias.length === 0 ? (
            <p className="p-6 text-muted">
              Crie sua primeira categoria para organizar seus lançamentos.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {[...categorias]
                .sort((a, b) =>
                  a.nomeCategoria.localeCompare(b.nomeCategoria, "pt-BR"),
                )
                .map((categoria) => {
                  const receita = categoria.tipoCategoria === "RECEITA";

                  const quantidade = transacoes.filter(
                    (transacao) => transacao.categoriaId === categoria.id,
                  ).length;

                  return (
                    <li
                      key={categoria.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-4"
                    >
                      <span
                        className={`inline-flex min-h-9 shrink-0 items-center rounded-xl px-3 text-xs font-bold ${
                          receita
                            ? "bg-positive-background text-positive"
                            : "bg-negative-background text-negative"
                        }`}
                      >
                        {receita ? "Recebimento" : "Gasto"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold break-words">
                          {categoria.nomeCategoria}
                        </h3>

                        <p className="mt-1 text-sm text-muted">
                          {quantidade}{" "}
                          {quantidade === 1
                            ? "lançamento vinculado"
                            : "lançamentos vinculados"}
                        </p>
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
          className="rounded-3xl border border-border bg-raised p-6"
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
            você. Classifique agora ou deixe para depois.
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
        aria-labelledby="nova-categoria-title"
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-6 text-foreground backdrop:bg-brand-plum/60"
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
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="categoria-tipo" className="text-sm font-bold">
              Usar para
            </label>

            <select
              id="categoria-tipo"
              value={tipo}
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
              onClick={() => dialogRef.current?.close()}
              className="min-h-12 rounded-xl border border-border px-4 font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="min-h-12 rounded-xl bg-primary px-4 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Criar categoria
            </button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}
