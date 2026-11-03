"use client";

import { FormEvent, useRef, useState } from "react";

import PlanejamentoTransacao from "@/app/components/PlanejamentoTransacao";
import { useTransacoes } from "@/app/components/TransacoesProvider";
import {
  criarPlanejamentoInicial,
  gerarPlanejamento,
} from "@/app/lib/planejamento";

type NovaTransacaoProps = {
  compact?: boolean;
};

export default function NovaTransacao({ compact = false }: NovaTransacaoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tipoMovimento, setTipoMovimento] = useState<"DESPESA" | "RECEITA">(
    "DESPESA",
  );

  function abrirModal() {
    setErro("");
    setMensagem("");
    dialogRef.current?.showModal();
  }

  function fecharModal() {
    dialogRef.current?.close();
  }

  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const { adicionarTransacoes, categorias } = useTransacoes();

  const [planejamento, setPlanejamento] = useState(criarPlanejamentoInicial);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const categoriasDisponiveis = categorias.filter(
    (categoria) => categoria.tipoCategoria === tipoMovimento,
  );

  function mudarTipo(tipo: "DESPESA" | "RECEITA") {
    setTipoMovimento(tipo);
    setCategoriaId("");
  }

  const campoClasse =
    "h-12 w-full rounded-xl border-2 border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  function salvarTransacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const categoria = categoriasDisponiveis.find(
      (item) => item.id === Number(categoriaId),
    );

    if (categoriaId !== "" && !categoria) {
      setErro("A categoria selecionada não é compatível com o lançamento.");
      return;
    }

    const ocorrencias = gerarPlanejamento({
      ...planejamento,
      quantidade: Number(planejamento.quantidade),
    });

    if (ocorrencias.length === 0) {
      setErro(
        "Confira a data, o valor e a quantidade. Cada lançamento deve ter pelo menos R$ 0,01.",
      );
      return;
    }

    const grupoId = crypto.randomUUID();

    adicionarTransacoes(
      ocorrencias.map((ocorrencia) => ({
        descricao:
          descricao.trim() ||
          categoria?.nomeCategoria ||
          (tipoMovimento === "RECEITA" ? "Recebimento" : "Gasto"),
        valor: ocorrencia.valor,
        dataTransacao: ocorrencia.data,
        tipoMovimento,
        categoriaId: categoria?.id,
        modalidade: planejamento.modalidade,
        grupoId,
        numeroOcorrencia: ocorrencia.numero,
        totalOcorrencias: ocorrencias.length,
        frequencia:
          planejamento.modalidade === "RECORRENTE"
            ? planejamento.frequencia
            : planejamento.modalidade === "PARCELADA"
              ? "MENSAL"
              : undefined,
      })),
    );

    setMensagem(
      `${ocorrencias.length} ${
        ocorrencias.length === 1
          ? "lançamento adicionado"
          : "lançamentos adicionados"
      }.`,
    );

    setDescricao("");
    setCategoriaId("");
    setTipoMovimento("DESPESA");
    setPlanejamento(criarPlanejamentoInicial());
    fecharModal();
  }

  return (
    <div className="w-full sm:w-auto sm:shrink-0">
      <button
        type="button"
        onClick={abrirModal}
        aria-haspopup="dialog"
        className={`inline-flex w-full items-center justify-center rounded-xl bg-primary font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto ${
          compact ? "min-h-10 px-3 text-sm" : "min-h-12 px-5"
        }`}
      >
        + Nova transação
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="nova-transacao-title"
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl
        overflow-y-auto rounded-3xl border border-border bg-surface text-foreground backdrop:bg-brand-plum/60"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-6">
          <div>
            <h2
              id="nova-transacao-title"
              className="font-heading text-xl font-extrabold sm:text-2xl"
            >
              Nova transação
            </h2>

            <p className="mt-2 text-sm text-muted">
              Organize um lançamento único, recorrente ou parcelado.
            </p>
          </div>

          <button
            type="button"
            onClick={fecharModal}
            aria-label="Fechar nova transação"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border
            text-xl text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ×
          </button>
        </header>

        <form onSubmit={salvarTransacao}>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <fieldset className="mt-6">
              <legend className="text-sm font-bold">
                O que você quer registrar?
              </legend>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <label
                  className={`flex min-h-12 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-xl border-2 px-1 py-3 text-xs font-bold sm:min-h-16 sm:gap-2 sm:p-3 sm:text-base ${
                    tipoMovimento === "DESPESA"
                      ? "border-negative bg-negative-background text-negative"
                      : "border-border bg-surface text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoMovimento"
                    value="DESPESA"
                    checked={tipoMovimento === "DESPESA"}
                    onChange={() => mudarTipo("DESPESA")}
                    className="size-4 accent-negative"
                  />
                  Gasto
                </label>

                <label
                  className={`flex min-h-12 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-xl border-2 px-1 py-3 text-xs font-bold sm:min-h-16 sm:gap-2 sm:p-3 sm:text-base ${
                    tipoMovimento === "RECEITA"
                      ? "border-positive bg-positive-background text-positive"
                      : "border-border bg-surface text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoMovimento"
                    value="RECEITA"
                    checked={tipoMovimento === "RECEITA"}
                    onChange={() => mudarTipo("RECEITA")}
                    className="size-4 accent-positive"
                  />
                  Recebimento
                </label>
              </div>
            </fieldset>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="transacao-descricao"
                  className="text-sm font-bold"
                >
                  Descrição
                  <span className="font-normal text-muted"> · opcional</span>
                </label>

                <input
                  id="transacao-descricao"
                  name="descricao"
                  type="text"
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  maxLength={4000}
                  placeholder={
                    tipoMovimento === "RECEITA"
                      ? "Ex.: Salário de novembro"
                      : "Ex.: Compras do supermercado"
                  }
                  className={campoClasse}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="transacao-categoria"
                  className="text-sm font-bold"
                >
                  Categoria
                </label>

                <select
                  id="transacao-categoria"
                  name="categoriaId"
                  value={categoriaId}
                  onChange={(event) => setCategoriaId(event.target.value)}
                  className={campoClasse}
                >
                  <option value="">Sem categoria</option>

                  {categoriasDisponiveis.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nomeCategoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <PlanejamentoTransacao
              tipoMovimento={tipoMovimento}
              planejamento={planejamento}
              onChange={setPlanejamento}
            />

            {erro && (
              <p role="alert" className="mt-4 text-sm font-bold text-negative">
                {erro}
              </p>
            )}
          </div>

          <footer className="sticky bottom-0 z-10 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-3 border-t border-border bg-surface px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={fecharModal}
              className="min-h-12 min-w-0 rounded-xl border border-border px-2 text-sm font-bold sm:px-5 sm:text-base text-primary
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-12 min-w-0 rounded-xl bg-primary px-2 text-sm font-bold sm:px-5 sm:text-base text-on-primary
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {planejamento.modalidade === "UNICA"
                ? tipoMovimento === "RECEITA"
                  ? "Adicionar recebimento"
                  : "Adicionar gasto"
                : "Adicionar lançamentos"}
            </button>
          </footer>
        </form>
      </dialog>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-5 right-4 left-4 z-50 sm:left-auto sm:w-96"
      >
        {mensagem && (
          <div className="flex items-start gap-3 rounded-2xl border border-positive bg-positive-background p-4 text-positive shadow-lg">
            <span aria-hidden="true" className="font-extrabold">
              ✓
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-bold">Tudo certo!</p>
              <p className="mt-1 text-sm">{mensagem}</p>
            </div>

            <button
              type="button"
              onClick={() => setMensagem("")}
              aria-label="Dispensar confirmação"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-positive"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
