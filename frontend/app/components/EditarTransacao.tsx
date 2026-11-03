"use client";

import { useRef, useState, type FormEvent } from "react";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import type { TransacaoDemo } from "@/app/lib/demo-data";

type EditarTransacaoProps = {
  transacao: TransacaoDemo;
  onSaved: (mensagem: string) => void;
};

export default function EditarTransacao({
  transacao,
  onSaved,
}: EditarTransacaoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { editarTransacao, categorias: todasCategorias } = useTransacoes();

  const [descricao, setDescricao] = useState(transacao.descricao);
  const [valor, setValor] = useState(String(transacao.valor));
  const [data, setData] = useState(transacao.dataTransacao);
  const [categoriaId, setCategoriaId] = useState(
    String(transacao.categoriaId ?? ""),
  );
  const [erro, setErro] = useState("");

  const prefixo = `editar-${transacao.id}`;

  const categorias = todasCategorias.filter(
    (categoria) => categoria.tipoCategoria === transacao.tipoMovimento,
  );

  const campoClasse =
    "h-12 w-full rounded-xl border-2 border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  function abrirModal() {
    setDescricao(transacao.descricao);
    setValor(String(transacao.valor));
    setData(transacao.dataTransacao);
    setCategoriaId(String(transacao.categoriaId ?? ""));
    setErro("");
    dialogRef.current?.showModal();
  }

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const valorNumerico = Number(valor.replace(",", "."));
    const centavos = Math.round(valorNumerico * 100);

    if (
      !/^\d+([.,]\d{1,2})?$/.test(valor) ||
      !Number.isSafeInteger(centavos) ||
      centavos <= 0
    ) {
      setErro("Informe um valor positivo com até duas casas decimais.");
      return;
    }

    const categoria = categorias.find(
      (item) => item.id === Number(categoriaId),
    );

    if (categoriaId !== "" && !categoria) {
      setErro("Selecione uma categoria compatível.");
      return;
    }

    editarTransacao(transacao.id, {
      descricao:
        descricao.trim() ||
        categoria?.nomeCategoria ||
        (transacao.tipoMovimento === "RECEITA" ? "Recebimento" : "Gasto"),
      valor: centavos / 100,
      dataTransacao: data,
      categoriaId: categoria?.id,
    });

    dialogRef.current?.close();
    onSaved("Lançamento atualizado. Os saldos foram recalculados.");
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        aria-haspopup="dialog"
        aria-label={`Editar ${transacao.descricao}`}
        className="min-h-11 rounded-xl px-3 text-sm font-bold text-primary hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Editar
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${prefixo}-titulo`}
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-4 text-foreground sm:p-6 backdrop:bg-brand-plum/60"
      >
        <h2
          id={`${prefixo}-titulo`}
          className="font-heading text-2xl font-extrabold"
        >
          Editar lançamento
        </h2>

        <p className="mt-2 text-sm text-muted">
          A alteração será aplicada somente a esta ocorrência. As demais
          parcelas ou repetições serão mantidas.
        </p>

        <form onSubmit={salvar} className="mt-6 space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`${prefixo}-descricao`}
              className="text-sm font-bold"
            >
              Descrição · opcional
            </label>

            <input
              id={`${prefixo}-descricao`}
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              maxLength={4000}
              className={campoClasse}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor={`${prefixo}-valor`} className="text-sm font-bold">
                Valor desta ocorrência (R$)
              </label>

              <input
                id={`${prefixo}-valor`}
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
                required
                className={campoClasse}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={`${prefixo}-data`} className="text-sm font-bold">
                Data
              </label>

              <input
                id={`${prefixo}-data`}
                type="date"
                value={data}
                onChange={(event) => setData(event.target.value)}
                required
                className={campoClasse}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={`${prefixo}-categoria`}
              className="text-sm font-bold"
            >
              Categoria · opcional
            </label>

            <select
              id={`${prefixo}-categoria`}
              value={categoriaId}
              onChange={(event) => setCategoriaId(event.target.value)}
              className={campoClasse}
            >
              <option value="">Sem categoria</option>

              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nomeCategoria}
                </option>
              ))}
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
              Salvar alterações
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
