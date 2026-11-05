"use client";

import NovaTransacao from "@/app/components/NovaTransacao";
import ProximosMarcos from "@/app/components/ProximosMarcos";
import SaldoCard from "@/app/components/SaldoCard";
import { useTransacoes } from "@/app/components/TransacoesProvider";
import AppHeader from "@/app/components/AppHeader";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import Link from "next/link";

export default function DashboardPage() {
  const { transacoes, usuario, dataReferencia } = useTransacoes();
  const saldoInicial = usuario.saldoInicial;

  function calcularSaldo(registros: typeof transacoes) {
    const centavos = registros.reduce(
      (saldo, transacao) => {
        const valor = Math.round(transacao.valor * 100);

        return saldo + (transacao.tipoMovimento === "RECEITA" ? valor : -valor);
      },
      Math.round(saldoInicial * 100),
    );

    return centavos / 100;
  }

  const realizadas = transacoes.filter(
    (transacao) => transacao.dataTransacao <= dataReferencia,
  );

  const saldoAtual = calcularSaldo(realizadas);
  const saldoProjetado = calcularSaldo(transacoes);

  const ultimasTransacoes = realizadas
    .sort((a, b) => b.dataTransacao.localeCompare(a.dataTransacao))
    .slice(0, 5);

  const despesasFuturas = transacoes
    .filter(
      (transacao) =>
        transacao.tipoMovimento === "DESPESA" &&
        transacao.dataTransacao > dataReferencia,
    )
    .sort((a, b) => a.dataTransacao.localeCompare(b.dataTransacao));

  const primeiroNome = usuario.nome.trim().split(/\s+/)[0];

  return (
    <section aria-labelledby="dashboard-title">
      <div className="mb-6">
        <AppHeader
          id="dashboard-title"
          titulo={`Olá, ${primeiroNome}!`}
          descricao="Acompanhe seu dinheiro, de hoje em diante."
          actions={<NovaTransacao />}
        />
        <p className="mt-3 text-xs text-muted">
          Atualizado para {formatarData(dataReferencia)}
        </p>
      </div>
      {/* cards de saldo */}
      <div className="grid gap-4 md:grid-cols-2">
        <SaldoCard
          titulo="Saldo atual"
          valor={saldoAtual}
          descricao="Inclui os lançamentos até a data de referência."
          destaque
        />

        <section
          aria-labelledby="saldo-projetado-title"
          className="min-w-0 rounded-3xl bg-brand-plum p-6 text-brand-cream"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="saldo-projetado-title" className="text-sm font-bold">
              Saldo projetado
            </h2>

            <span className="rounded-lg border border-dark-muted px-2 py-1 text-xs">
              Visão futura
            </span>
          </div>

          <p className="mt-3 wrap-break-word text-3xl font-extrabold tabular-nums">
            {formatarMoeda(saldoProjetado)}
          </p>

          <p className="mt-3 text-sm text-dark-muted">
            Inclui todos os lançamentos futuros cadastrados.
          </p>

          {saldoProjetado < 0 && (
            <p className="mt-3 text-sm font-bold text-[#FFB8CD]">
              Projeção negativa
            </p>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="ultimas-title"
          className="min-w-0 rounded-3xl border border-border bg-surface p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="ultimas-title"
              className="font-heading text-xl font-extrabold sm:text-2xl"
            >
              Últimas transações
            </h2>

            <Link
              href="/transacoes"
              className="inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ver todas →
            </Link>
          </div>

          {ultimasTransacoes.length === 0 && (
            <p className="mt-4 text-sm text-muted">
              Nenhuma movimentação até a data de referência. Adicione um gasto
              ou recebimento para começar.
            </p>
          )}

          <ul className="mt-4 divide-y divide-border">
            {ultimasTransacoes.map((transacao) => (
              <li
                key={transacao.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-4"
              >
                <div>
                  <p className="font-bold [overflow-wrap:anywhere]">
                    {transacao.descricao}
                  </p>
                  <p className="text-sm text-muted">
                    {transacao.tipoMovimento === "RECEITA"
                      ? "Receita"
                      : "Despesa"}{" "}
                    · {formatarData(transacao.dataTransacao)}
                  </p>
                </div>

                <p className="max-w-36 text-right text-sm font-bold tabular-nums [overflow-wrap:anywhere] sm:text-base">
                  {transacao.tipoMovimento === "RECEITA" ? "+" : "−"}{" "}
                  {formatarMoeda(transacao.valor)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="futuras-title"
          className="min-w-0 rounded-3xl border border-border bg-surface p-4 sm:p-6"
        >
          <h2
            id="futuras-title"
            className="font-heading text-xl font-extrabold sm:text-2xl"
          >
            Despesas futuras
          </h2>

          {despesasFuturas.length === 0 && (
            <p className="mt-4 text-sm text-muted">
              Nenhuma despesa futura cadastrada.
            </p>
          )}

          <ul className="mt-4 divide-y divide-border">
            {despesasFuturas.map((transacao) => (
              <li
                key={transacao.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-4"
              >
                <div>
                  <p className="font-bold [overflow-wrap:anywhere]">
                    {transacao.descricao}
                  </p>
                  <p className="text-sm text-muted">
                    {formatarData(transacao.dataTransacao)}
                  </p>
                </div>

                <p className="max-w-36 text-right text-sm font-bold tabular-nums [overflow-wrap:anywhere] sm:text-base">
                  − {formatarMoeda(transacao.valor)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <ProximosMarcos />
    </section>
  );
}
