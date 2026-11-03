"use client";

import { useState } from "react";

import { formatarData, formatarMoeda } from "../lib/formatters";
import { useTransacoes } from "./TransacoesProvider";

import { useRef } from "react";
import EditarTransacao from "./EditarTransacao";
import ExcluirTransacao from "./ExcluirTransacao";

export default function ListaTransacoes() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("TODOS");
  const [periodo, setPeriodo] = useState("TODOS");
  const { transacoes, dataReferencia: hoje } = useTransacoes();
  const [mensagem, setMensagem] = useState("");
  const resultadoRef = useRef<HTMLParagraphElement>(null);
  const filtrosRef = useRef<HTMLDialogElement>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("PROXIMAS");

  function informarAlteracao(texto: string) {
    setMensagem(texto);
    resultadoRef.current?.focus();
  }

  function normalizarTexto(texto: string) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  const transacoesFiltradas = transacoes
    .filter((transacao) => {
      const correspondeBusca = normalizarTexto(transacao.descricao).includes(
        normalizarTexto(busca),
      );

      const correspondeTipo =
        tipo === "TODOS" || transacao.tipoMovimento === tipo;

      const futura = transacao.dataTransacao > hoje;

      const correspondePeriodo =
        periodo === "TODOS" ||
        (periodo === "FUTURAS" && futura) ||
        (periodo === "ATE_REFERENCIA" && !futura);

      return correspondeBusca && correspondeTipo && correspondePeriodo;
    })
    .sort((a, b) => {
      if (ordenacao === "ADICIONADAS") {
        return (
          (b.criadoEm ?? "").localeCompare(a.criadoEm ?? "") || b.id - a.id
        );
      }

      if (ordenacao === "DATA_ASC") {
        return a.dataTransacao.localeCompare(b.dataTransacao) || a.id - b.id;
      }

      if (ordenacao === "DATA_DESC") {
        return b.dataTransacao.localeCompare(a.dataTransacao) || b.id - a.id;
      }

      const referencia = converterDataParaNumero(hoje);

      const distanciaA = Math.abs(
        converterDataParaNumero(a.dataTransacao) - referencia,
      );

      const distanciaB = Math.abs(
        converterDataParaNumero(b.dataTransacao) - referencia,
      );

      return (
        distanciaA - distanciaB ||
        b.dataTransacao.localeCompare(a.dataTransacao) ||
        b.id - a.id
      );
    });

  const campoClasse =
    "h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  type Ordenacao = "PROXIMAS" | "ADICIONADAS" | "DATA_ASC" | "DATA_DESC";

  function converterDataParaNumero(data: string) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return Date.UTC(ano, mes - 1, dia);
  }

  const temFiltrosAtivos =
    busca.trim() !== "" || tipo !== "TODOS" || periodo !== "TODOS";
  const quantidadeFiltros =
    Number(tipo !== "TODOS") + Number(periodo !== "TODOS");

  function camposFiltro(prefixo: string) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${prefixo}-tipo`} className="text-sm font-bold">
            Tipo
          </label>

          <select
            id={`${prefixo}-tipo`}
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className={campoClasse}
          >
            <option value="TODOS">Todos os tipos</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${prefixo}-periodo`} className="text-sm font-bold">
            Período
          </label>

          <select
            id={`${prefixo}-periodo`}
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            className={campoClasse}
          >
            <option value="TODOS">Todas as datas</option>
            <option value="ATE_REFERENCIA">Até hoje</option>
            <option value="FUTURAS">Datas futuras</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${prefixo}-ordenacao`} className="text-sm font-bold">
            Ordenar por
          </label>

          <select
            id={`${prefixo}-ordenacao`}
            value={ordenacao}
            onChange={(event) => setOrdenacao(event.target.value as Ordenacao)}
            className={campoClasse}
          >
            <option value="PROXIMAS">Mais próximas de hoje</option>
            <option value="ADICIONADAS">Últimas adicionadas</option>
            <option value="DATA_ASC">Data: antigas primeiro</option>
            <option value="DATA_DESC">Data: futuras primeiro</option>
          </select>
        </div>
      </>
    );
  }
  return (
    <div className="mt-6">
      <p
        ref={resultadoRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        tabIndex={-1}
        className={
          mensagem
            ? "mb-4 rounded-xl border border-positive bg-positive-background p-4 text-sm font-bold text-positive focus:outline-2 focus:outline-offset-2 focus:outline-positive"
            : "sr-only"
        }
      >
        {mensagem}
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="busca-transacoes" className="text-sm font-bold">
            Buscar descrição
          </label>
          <input
            id="busca-transacoes"
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Ex.: aluguel"
            className={campoClasse}
          />
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => filtrosRef.current?.showModal()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
        >
          Filtros
          {quantidadeFiltros > 0 && (
            <span className="rounded-md bg-raised px-1.5 py-0.5 text-xs">
              {quantidadeFiltros}
            </span>
          )}
        </button>
        <div className="hidden md:contents">{camposFiltro("desktop")}</div>
      </div>
      <dialog
        ref={filtrosRef}
        aria-labelledby="filtros-title"
        className="caixu-scrollbar fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-5 text-foreground backdrop:bg-brand-plum/60"
      >
        <header className="mb-5 flex items-center justify-between gap-3">
          <h2
            id="filtros-title"
            className="font-heading text-xl font-extrabold"
          >
            Filtros e ordenação
          </h2>
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => filtrosRef.current?.close()}
            className="size-11 shrink-0 rounded-xl border border-border text-xl text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ×
          </button>
        </header>
        <div className="grid gap-4">{camposFiltro("mobile")}</div>
        <div className="mt-5 grid gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => filtrosRef.current?.close()}
            className="min-h-12 rounded-xl bg-primary px-4 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Ver {transacoesFiltradas.length}{" "}
            {transacoesFiltradas.length === 1 ? "transação" : "transações"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTipo("TODOS");
              setPeriodo("TODOS");
              setOrdenacao("PROXIMAS");
            }}
            className="min-h-11 rounded-xl px-3 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Restaurar opções
          </button>
        </div>
      </dialog>

      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold">
            Suas transações
          </h2>

          <span
            role="status"
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted"
          >
            {transacoesFiltradas.length}{" "}
            {transacoesFiltradas.length === 1 ? "transação" : "transações"}
          </span>
        </div>

        {temFiltrosAtivos && (
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setTipo("TODOS");
              setPeriodo("TODOS");
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
            Limpar filtros
          </button>
        )}
      </div>

      {transacoesFiltradas.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-8 text-center">
          <h2 className="font-heading text-xl font-extrabold">
            Nenhuma transação encontrada
          </h2>
          <p className="mt-2 text-muted">
            Experimente outra descrição ou limpe os filtros.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
          {transacoesFiltradas.map((transacao) => {
            const diasAteData = Math.round(
              (Date.parse(`${transacao.dataTransacao}T00:00:00Z`) -
                Date.parse(`${hoje}T00:00:00Z`)) /
                86_400_000,
            );

            const distancia =
              diasAteData === 0
                ? "Hoje"
                : diasAteData === 1
                  ? "Em 1 dia"
                  : `Em ${diasAteData} dias`;

            const receita = transacao.tipoMovimento === "RECEITA";

            return (
              <li
                key={transacao.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold wrap-break-word">
                    {transacao.descricao}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted">
                      {receita ? "Recebimento" : "Gasto"}
                    </span>

                    <span aria-hidden="true" className="text-muted">
                      ·
                    </span>

                    <time
                      dateTime={transacao.dataTransacao}
                      className={`inline-flex flex-wrap items-center gap-x-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${
                        diasAteData > 0
                          ? "border-transparent bg-planned-background text-planned-text"
                          : diasAteData === 0
                            ? "border-transparent bg-raised text-primary"
                            : "border-border bg-surface text-muted"
                      }`}
                    >
                      {formatarData(transacao.dataTransacao)}

                      {diasAteData >= 0 && <span>· {distancia}</span>}
                    </time>
                  </div>

                  {transacao.modalidade === "PARCELADA" && (
                    <p className="mt-1 text-xs font-bold text-primary">
                      {receita ? "Recebimento" : "Parcela"}{" "}
                      {transacao.numeroOcorrencia} de{" "}
                      {transacao.totalOcorrencias}
                    </p>
                  )}

                  {transacao.modalidade === "RECORRENTE" && (
                    <p className="mt-1 text-xs font-bold text-primary">
                      Recorrente ·{" "}
                      {transacao.frequencia === "SEMANAL"
                        ? "Semanal"
                        : "Mensal"}
                      {" · "}
                      {transacao.numeroOcorrencia} de{" "}
                      {transacao.totalOcorrencias}
                    </p>
                  )}
                </div>

                <p
                  className={`max-w-[40vw] text-right text-sm font-extrabold tabular-nums [overflow-wrap:anywhere] sm:max-w-none sm:text-base ${
                    receita ? "text-income" : "text-expense"
                  }`}
                >
                  {receita ? "+" : "−"} {formatarMoeda(transacao.valor)}
                </p>

                <div className="col-span-2 flex items-center justify-end gap-1 border-t border-border pt-1 lg:col-span-1 lg:border-0 lg:pt-0">
                  <EditarTransacao
                    transacao={transacao}
                    onSaved={informarAlteracao}
                  />

                  <ExcluirTransacao
                    transacao={transacao}
                    onDeleted={informarAlteracao}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
