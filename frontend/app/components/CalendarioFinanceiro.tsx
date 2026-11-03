"use client";

import { useState } from "react";

import DetalhesDiaModal from "@/app/components/DetalhesDiaModal";
import { useTransacoes } from "@/app/components/TransacoesProvider";
import { gerarCalendario } from "@/app/lib/calendario";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import NovaTransacao from "./NovaTransacao";

export default function CalendarioFinanceiro() {
  const { transacoes, usuario, dataReferencia } = useTransacoes();
  const saldoInicial = usuario.saldoInicial;
  const [anoInicial, mesInicial] = dataReferencia.split("-").map(Number);

  const [periodo, setPeriodo] = useState({
    ano: anoInicial,
    mes: mesInicial,
  });

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  const movimentacoesSelecionadas = transacoes.filter(
    (transacao) => transacao.dataTransacao === diaSelecionado,
  );

  const dias = gerarCalendario({
    ...periodo,
    saldoInicial,
    transacoes: transacoes,
    dataReferencia,
  });

  const tituloMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(periodo.ano, periodo.mes - 1, 1)));

  function mudarMes(direcao: number) {
    setDiaSelecionado(null);

    setPeriodo((atual) => {
      const proximo = new Date(Date.UTC(atual.ano, atual.mes - 1 + direcao, 1));

      return {
        ano: proximo.getUTCFullYear(),
        mes: proximo.getUTCMonth() + 1,
      };
    });
  }

  const saldoFinal = dias[dias.length - 1].saldoAcumulado;

  const primeiroDiaSemana = new Date(
    Date.UTC(periodo.ano, periodo.mes - 1, 1),
  ).getUTCDay();

  const saldoAbertura =
    Math.round(
      (dias[0].saldoAcumulado - dias[0].entradas + dias[0].saidas) * 100,
    ) / 100;

  const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const botaoClasse =
    "inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  const setaClasse =
    "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-3xl font-bold text-primary hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="mt-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => mudarMes(-1)}
              aria-label="Mês anterior"
              className={setaClasse}
            >
              ‹
            </button>

            <h2
              aria-live="polite"
              className="font-heading text-lg font-extrabold first-letter:uppercase"
            >
              {tituloMes}
            </h2>

            <button
              type="button"
              onClick={() => mudarMes(1)}
              aria-label="Próximo mês"
              className={setaClasse}
            >
              ›
            </button>
          </div>

          <p className="mt-2 text-xs text-muted">
            Demonstração · {formatarData(dataReferencia)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setDiaSelecionado(null);
              setPeriodo({ ano: anoInicial, mes: mesInicial });
            }}
            className={botaoClasse}
          >
            Mês de referência
          </button>

          <NovaTransacao compact />
        </div>
      </div>

      <dl className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="text-sm font-bold text-muted">Saldo de abertura</dt>

          <dd className="text-xl font-extrabold tabular-nums">
            {formatarMoeda(saldoAbertura)}
          </dd>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-border bg-raised px-4 py-3">
          <dt className="text-sm font-bold text-primary">
            {dias.some((dia) => dia.futuro)
              ? "Fechamento projetado"
              : "Fechamento"}
          </dt>

          <dd
            className={`text-xl font-extrabold tabular-nums ${
              saldoFinal < 0 ? "text-negative" : "text-primary"
            }`}
          >
            {formatarMoeda(saldoFinal)}
          </dd>
        </div>
      </dl>

      <div className="mb-4">
        <p className="text-sm text-muted">
          <strong className="text-foreground">Seu saldo, dia a dia.</strong>{" "}
          Selecione uma data para consultar as movimentações.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm bg-positive"
            />
            Positivo
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm bg-negative"
            />
            Negativo
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3 w-4 rounded-sm border border-dashed border-muted"
            />
            Datas futuras: saldo projetado pelos lançamentos cadastrados.
          </span>
        </div>
      </div>

      <div className="@container">
        {/* <div
          aria-hidden="true"
          className="mb-2 hidden grid-cols-7 gap-2 @[900px]:grid"
        >
          {nomesSemana.map((nome) => (
            <span
              key={nome}
              className="px-3 py-2 text-center text-sm font-bold text-muted"
            >
              {nome}
            </span>
          ))}
        </div> */}
        <div
          aria-hidden="true"
          className="mb-3 hidden grid-cols-7 gap-2 rounded-xl border border-border bg-raised py-2 @[900px]:grid"
        >
          {nomesSemana.map((nome) => (
            <span
              key={nome}
              className="px-2 text-center text-xs font-bold text-primary"
            >
              {nome}
            </span>
          ))}
        </div>

        <ol
          aria-label={`Dias de ${tituloMes}`}
          className="grid grid-cols-1 gap-3 @[900px]:grid-cols-7 @[900px]:gap-2"
        >
          {Array.from({ length: primeiroDiaSemana }, (_, indice) => (
            <li
              key={`espaco-${indice}`}
              aria-hidden="true"
              className="hidden @[900px]:block"
            />
          ))}

          {dias.map((dia) => {
            const referencia = dia.data === dataReferencia;
            const selecionado = diaSelecionado === dia.data;

            const quantidade = transacoes.filter(
              (transacao) => transacao.dataTransacao === dia.data,
            ).length;

            const saldoClasse =
              dia.saldoAcumulado < 0
                ? "bg-negative-background text-negative"
                : dia.saldoAcumulado > 0
                  ? "bg-positive-background text-positive"
                  : "bg-background text-foreground";

            return (
              <li
                key={dia.data}
                className={`flex min-w-0 flex-col overflow-hidden rounded-xl border-2 bg-surface ${
                  selecionado || referencia ? "border-primary" : "border-border"
                } ${dia.futuro ? "border-dashed" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setDiaSelecionado(dia.data)}
                  aria-haspopup="dialog"
                  aria-label={`Ver movimentações de ${formatarData(dia.data)}`}
                  className="flex w-full flex-1 flex-col items-stretch rounded-[10px] text-left 
                  focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="flex flex-1 flex-col p-2.5 @[900px]:min-h-24">
                    <span className="flex flex-wrap items-center justify-between gap-1">
                      <time
                        dateTime={dia.data}
                        className="font-heading text-lg font-extrabold"
                      >
                        <span className="@[900px]:hidden">
                          {formatarData(dia.data)}
                        </span>

                        <span className="hidden @[900px]:inline">
                          {Number(dia.data.slice(-2))}
                        </span>
                      </time>

                      {referencia && (
                        <span className="text-xs font-bold text-primary">
                          Referência
                        </span>
                      )}
                    </span>

                    <span className="mt-1 text-xs text-muted">
                      {quantidade === 0
                        ? "Sem movimentos"
                        : `${quantidade} ${quantidade === 1 ? "movimento" : "movimentos"}`}
                    </span>

                    <span className="mt-2 block space-y-1">
                      {dia.entradas > 0 && (
                        <span className="block text-sm font-bold text-income tabular-nums">
                          <span className="block text-xs font-normal">
                            Entradas
                          </span>
                          + {formatarMoeda(dia.entradas)}
                        </span>
                      )}

                      {dia.saidas > 0 && (
                        <span className="block text-sm font-bold text-expense tabular-nums">
                          <span className="block text-xs font-normal">
                            Saídas
                          </span>
                          − {formatarMoeda(dia.saidas)}
                        </span>
                      )}
                    </span>
                  </span>

                  <span
                    className={`mt-auto block w-full px-2.5 py-2 ${saldoClasse}`}
                  >
                    <span className="block text-xs">
                      Saldo
                      <span className="sr-only">
                        {dia.futuro ? " projetado" : " acumulado"}
                      </span>
                    </span>

                    <span className="mt-1 block text-sm font-extrabold tabular-nums">
                      {formatarMoeda(dia.saldoAcumulado)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {diaSelecionado && (
        <DetalhesDiaModal
          data={diaSelecionado}
          transacoes={movimentacoesSelecionadas}
          onClose={() => setDiaSelecionado(null)}
        />
      )}
    </div>
  );
}
