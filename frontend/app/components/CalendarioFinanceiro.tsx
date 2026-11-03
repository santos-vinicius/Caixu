"use client";

import { useRef, useState } from "react";
import DetalhesDiaModal from "@/app/components/DetalhesDiaModal";
import { useTransacoes } from "@/app/components/TransacoesProvider";
import { gerarCalendario } from "@/app/lib/calendario";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import NovaTransacao from "./NovaTransacao";

export default function CalendarioFinanceiro() {
  const { transacoes, usuario, dataReferencia } = useTransacoes();
  const [anoInicial, mesInicial] = dataReferencia.split("-").map(Number);
  const [periodo, setPeriodo] = useState({ ano: anoInicial, mes: mesInicial });
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [diaDetalhes, setDiaDetalhes] = useState<string | null>(null);
  const calendarioRef = useRef<HTMLDivElement>(null);

  const dias = gerarCalendario({
    ...periodo,
    saldoInicial: usuario.saldoInicial,
    transacoes,
    dataReferencia,
  });
  const selecionado =
    dias.find((dia) => dia.data === dataSelecionada) ??
    dias.find((dia) => dia.data === dataReferencia) ??
    dias[0];
  const movimentosSelecionados = transacoes.filter(
    (item) => item.dataTransacao === selecionado.data,
  );
  const saldoFinal = dias[dias.length - 1].saldoAcumulado;
  const saldoAbertura =
    Math.round(
      (dias[0].saldoAcumulado - dias[0].entradas + dias[0].saidas) * 100,
    ) / 100;
  const primeiroDiaSemana = new Date(
    Date.UTC(periodo.ano, periodo.mes - 1, 1),
  ).getUTCDay();
  const tituloMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(periodo.ano, periodo.mes - 1, 1)));
  const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const compacto = new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const quantidades = new Map<string, number>();
  for (const item of transacoes)
    quantidades.set(
      item.dataTransacao,
      (quantidades.get(item.dataTransacao) ?? 0) + 1,
    );

  function mudarMes(direcao: number) {
    setDataSelecionada(null);
    setDiaDetalhes(null);
    setPeriodo((atual) => {
      const proximo = new Date(Date.UTC(atual.ano, atual.mes - 1 + direcao, 1));
      return { ano: proximo.getUTCFullYear(), mes: proximo.getUTCMonth() + 1 };
    });
  }

  function selecionarDia(data: string) {
    setDataSelecionada(data);
    if ((calendarioRef.current?.clientWidth ?? 0) >= 900) setDiaDetalhes(data);
  }

  const botaoClasse =
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  const setaClasse =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-3xl font-bold text-primary hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="mt-5 min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3">
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
              className="text-center font-heading text-base font-extrabold first-letter:uppercase sm:text-lg"
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
        <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setDataSelecionada(null);
              setDiaDetalhes(null);
              setPeriodo({ ano: anoInicial, mes: mesInicial });
            }}
            className={botaoClasse}
          >
            Mês atual
          </button>
          <NovaTransacao compact />
        </div>
      </div>
      <dl className="mb-5 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="min-w-0 rounded-xl border border-border bg-surface px-3 py-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4">
          <dt className="text-xs font-bold text-muted sm:text-sm">
            Saldo de abertura
          </dt>
          <dd className="mt-1 text-base font-extrabold tabular-nums [overflow-wrap:anywhere] sm:mt-0 sm:text-xl">
            {formatarMoeda(saldoAbertura)}
          </dd>
        </div>
        <div className="min-w-0 rounded-xl border border-border bg-raised px-3 py-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4">
          <dt className="text-xs font-bold text-primary sm:text-sm">
            {dias.some((dia) => dia.futuro)
              ? "Fechamento projetado"
              : "Fechamento"}
          </dt>
          <dd
            className={`mt-1 text-base font-extrabold tabular-nums [overflow-wrap:anywhere] sm:mt-0 sm:text-xl ${saldoFinal < 0 ? "text-negative" : "text-primary"}`}
          >
            {formatarMoeda(saldoFinal)}
          </dd>
        </div>
      </dl>
      <p className="text-sm text-muted">
        <strong className="text-foreground">Seu saldo, dia a dia.</strong>{" "}
        Selecione uma data.
      </p>
      <div className="mt-3 mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden="true" className="font-bold text-positive">
            +
          </span>{" "}
          Positivo
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden="true" className="font-bold text-negative">
            −
          </span>{" "}
          Negativo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-3 w-4 rounded-sm border border-dashed border-muted"
          />
          Projetado
        </span>
      </div>
      <div ref={calendarioRef} className="@container min-w-0">
        <div
          aria-hidden="true"
          className="mb-2 grid grid-cols-7 gap-1 rounded-xl border border-border bg-raised py-2 @[560px]:gap-2"
        >
          {nomesSemana.map((nome) => (
            <span
              key={nome}
              className="text-center text-[11px] font-bold text-primary @[560px]:text-xs"
            >
              {nome}
            </span>
          ))}
        </div>
        <ol
          aria-label={`Dias de ${tituloMes}`}
          className="grid grid-cols-7 gap-1 @[560px]:gap-2"
        >
          {Array.from({ length: primeiroDiaSemana }, (_, indice) => (
            <li key={`espaco-${indice}`} aria-hidden="true" />
          ))}
          {dias.map((dia) => {
            const referencia = dia.data === dataReferencia;
            const ativo = dia.data === selecionado.data;
            const quantidade = quantidades.get(dia.data) ?? 0;
            const saldoClasse =
              dia.saldoAcumulado < 0
                ? "bg-negative-background text-negative"
                : dia.saldoAcumulado > 0
                  ? "bg-positive-background text-positive"
                  : "bg-background text-foreground";
            return (
              <li
                key={dia.data}
                className={`min-w-0 overflow-hidden rounded-lg border-2 bg-surface @[900px]:rounded-xl ${ativo || referencia ? "border-primary" : "border-border"} ${dia.futuro ? "border-dashed" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => selecionarDia(dia.data)}
                  aria-pressed={ativo}
                  aria-current={referencia ? "date" : undefined}
                  aria-label={`${formatarData(dia.data)}: ${quantidade} ${quantidade === 1 ? "movimento" : "movimentos"}, saldo ${dia.futuro ? "projetado" : "acumulado"} ${formatarMoeda(dia.saldoAcumulado)}`}
                  className="flex h-full min-h-16 w-full flex-col items-stretch rounded-md text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary @[900px]:rounded-[10px]"
                >
                  <span className="flex flex-1 flex-col p-1 text-center @[560px]:p-2 @[900px]:min-h-24 @[900px]:p-2.5 @[900px]:text-left">
                    <span className="flex items-center justify-center gap-1 @[900px]:justify-between">
                      <time
                        dateTime={dia.data}
                        className="font-heading text-sm font-extrabold @[560px]:text-base @[900px]:text-lg"
                      >
                        {Number(dia.data.slice(-2))}
                      </time>
                      {referencia && (
                        <span className="hidden text-xs font-bold text-primary @[900px]:inline">
                          Hoje
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] leading-3 text-muted @[560px]:text-xs @[900px]:hidden">
                      {quantidade > 0 ? `${quantidade} mov.` : "—"}
                    </span>
                    <span className="mt-1 hidden text-xs text-muted @[900px]:block">
                      {quantidade === 0
                        ? "Sem movimentos"
                        : `${quantidade} ${quantidade === 1 ? "movimento" : "movimentos"}`}
                    </span>
                    <span className="mt-2 hidden space-y-1 @[900px]:block">
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
                    aria-hidden="true"
                    className={`mt-auto block w-full py-1 text-center text-[11px] leading-3 font-bold @[560px]:px-1 @[900px]:px-2.5 @[900px]:py-2 @[900px]:text-left ${saldoClasse}`}
                  >
                    <span className="@[560px]:hidden">
                      {dia.saldoAcumulado < 0
                        ? "−"
                        : dia.saldoAcumulado > 0
                          ? "+"
                          : "0"}
                    </span>
                    <span className="hidden @[560px]:block @[900px]:hidden">
                      {compacto.format(dia.saldoAcumulado)}
                    </span>
                    <span className="hidden @[900px]:block">
                      <span className="block text-xs font-normal">Saldo</span>
                      <span className="mt-1 block text-sm font-extrabold tabular-nums [overflow-wrap:anywhere]">
                        {formatarMoeda(dia.saldoAcumulado)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <section
          aria-labelledby="dia-selecionado-title"
          className="mt-4 rounded-xl border border-border bg-surface p-4 @[900px]:hidden"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3
                id="dia-selecionado-title"
                className="font-heading text-base font-extrabold"
              >
                {formatarData(selecionado.data)}
              </h3>
              <p className="mt-1 text-xs text-muted">
                {movimentosSelecionados.length}{" "}
                {movimentosSelecionados.length === 1
                  ? "movimento"
                  : "movimentos"}
              </p>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-xs text-muted">
                Saldo {selecionado.futuro ? "projetado" : "acumulado"}
              </p>
              <p
                className={`mt-1 text-lg font-extrabold tabular-nums [overflow-wrap:anywhere] ${selecionado.saldoAcumulado < 0 ? "text-negative" : "text-positive"}`}
              >
                {formatarMoeda(selecionado.saldoAcumulado)}
              </p>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
            <div>
              <dt className="text-muted">Entradas</dt>
              <dd className="mt-1 font-bold text-positive tabular-nums [overflow-wrap:anywhere]">
                + {formatarMoeda(selecionado.entradas)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Saídas</dt>
              <dd className="mt-1 font-bold text-negative tabular-nums [overflow-wrap:anywhere]">
                − {formatarMoeda(selecionado.saidas)}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setDiaDetalhes(selecionado.data)}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border px-3 text-sm font-bold text-primary hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Ver movimentações
          </button>
        </section>
      </div>
      {diaDetalhes && (
        <DetalhesDiaModal
          data={diaDetalhes}
          transacoes={transacoes.filter(
            (item) => item.dataTransacao === diaDetalhes,
          )}
          onClose={() => setDiaDetalhes(null)}
        />
      )}
    </div>
  );
}
