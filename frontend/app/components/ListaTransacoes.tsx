"use client";

import { useState } from "react";

import { dataReferencia } from "@/app/lib/demo-data";
import { formatarData, formatarMoeda } from "../lib/formatters";
import { useTransacoes } from "./TransacoesProvider";

import { useRef } from "react";
import EditarTransacao from "./EditarTransacao";
import ExcluirTransacao from "./ExcluirTransacao";

export default function ListaTransacoes() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("TODOS");
  const [periodo, setPeriodo] = useState("TODOS");
  const { transacoes } = useTransacoes();
  const [mensagem, setMensagem] = useState("");
  const resultadoRef = useRef<HTMLParagraphElement>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("PROXIMAS");
  const [hoje] = useState(obterHojeLocal);

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

      const futura = transacao.dataTransacao > dataReferencia;

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

  function obterHojeLocal() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function converterDataParaNumero(data: string) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return Date.UTC(ano, mes - 1, dia);
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-2">
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

        <div className="flex flex-col gap-2">
          <label htmlFor="tipo-transacoes" className="text-sm font-bold">
            Tipo
          </label>

          <select
            id="tipo-transacoes"
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
          <label htmlFor="periodo-transacoes" className="text-sm font-bold">
            Período
          </label>

          <select
            id="periodo-transacoes"
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            className={campoClasse}
          >
            <option value="TODOS">Todas as datas</option>
            <option value="ATE_REFERENCIA">Até a data de referência</option>
            <option value="FUTURAS">Datas futuras</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ordenacao-transacoes" className="text-sm font-bold">
            Ordenar por
          </label>

          <select
            id="ordenacao-transacoes"
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
      </div>

      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted">
          {transacoesFiltradas.length}{" "}
          {transacoesFiltradas.length === 1
            ? "transação encontrada"
            : "transações encontradas"}
        </p>

        <button
          type="button"
          onClick={() => {
            setBusca("");
            setTipo("TODOS");
            setPeriodo("TODOS");
          }}
          className="min-h-11 rounded-lg px-3 text-sm font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Limpar filtros
        </button>
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
            const receita = transacao.tipoMovimento === "RECEITA";
            const futura = transacao.dataTransacao > dataReferencia;

            return (
              <li
                key={transacao.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold wrap-break-word">
                    {transacao.descricao}
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    {receita ? "Receita" : "Despesa"} ·{" "}
                    {formatarData(transacao.dataTransacao)}
                  </p>

                  {futura && (
                    <span className="mt-2 inline-block rounded-lg bg-planned-background px-2 py-1 text-xs font-bold text-planned-text">
                      Data futura
                    </span>
                  )}
                </div>

                <p
                  className={`font-extrabold tabular-nums ${
                    receita ? "text-income" : "text-expense"
                  }`}
                >
                  {receita ? "+" : "−"} {formatarMoeda(transacao.valor)}
                </p>

                <div className="flex items-center gap-1">
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
