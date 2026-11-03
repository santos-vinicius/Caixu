import Link from "next/link";

import SaldoCard from "@/app/components/SaldoCard";
import {
  dataReferencia,
  despesasFuturas,
  saldoAtual,
  saldoInicial,
  saldoProjetado,
  ultimasTransacoes,
} from "@/app/lib/demo-data";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";

export default function DashboardPage() {
  return (
    <section aria-labelledby="dashboard-title">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            id="dashboard-title"
            className="font-heading text-3xl font-extrabold"
          >
            Seu mês, mais claro.
          </h1>

          <p className="mt-2 text-muted">
            Dados de demonstração · Referência: {formatarData(dataReferencia)}
          </p>
        </div>

        <Link
          href="/transacoes"
          className="inline-flex min-h-12 items-center rounded-xl bg-primary px-5 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Ver transações
        </Link>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        <SaldoCard
          titulo="Saldo atual"
          valor={saldoAtual}
          descricao="Considera os lançamentos até a data de referência."
          destaque
        />

        <SaldoCard
          titulo="Saldo inicial"
          valor={saldoInicial}
          descricao="Seu ponto de partida no Caixu."
        />

        <SaldoCard
          titulo="Saldo projetado"
          valor={saldoProjetado}
          descricao="Inclui todos os lançamentos futuros cadastrados."
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="ultimas-title"
          className="rounded-3xl border border-border bg-surface p-6"
        >
          <h2
            id="ultimas-title"
            className="font-heading text-2xl font-extrabold"
          >
            Últimas transações
          </h2>

          <ul className="mt-4 divide-y divide-border">
            {ultimasTransacoes.map((transacao) => (
              <li
                key={transacao.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-bold">{transacao.descricao}</p>
                  <p className="text-sm text-muted">
                    {transacao.tipoMovimento === "RECEITA"
                      ? "Receita"
                      : "Despesa"}{" "}
                    · {formatarData(transacao.dataTransacao)}
                  </p>
                </div>

                <p className="font-bold tabular-nums">
                  {transacao.tipoMovimento === "RECEITA" ? "+" : "−"}{" "}
                  {formatarMoeda(transacao.valor)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="futuras-title"
          className="rounded-3xl border border-border bg-surface p-6"
        >
          <h2
            id="futuras-title"
            className="font-heading text-2xl font-extrabold"
          >
            Despesas futuras
          </h2>

          <ul className="mt-4 divide-y divide-border">
            {despesasFuturas.map((transacao) => (
              <li
                key={transacao.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-bold">{transacao.descricao}</p>
                  <p className="text-sm text-muted">
                    {formatarData(transacao.dataTransacao)}
                  </p>
                </div>

                <p className="font-bold tabular-nums">
                  − {formatarMoeda(transacao.valor)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
