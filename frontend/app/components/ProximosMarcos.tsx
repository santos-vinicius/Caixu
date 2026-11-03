"use client";

import Link from "next/link";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import { gerarCalendario } from "@/app/lib/calendario";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import { selecionarMarcos } from "@/app/lib/marcos-financeiros";

export default function ProximosMarcos() {
  const { transacoes, usuario, dataReferencia } = useTransacoes();
  const [ano, mes] = dataReferencia.split("-").map(Number);

  const dias = gerarCalendario({
    ano,
    mes,
    transacoes,
    saldoInicial: usuario.saldoInicial,
    dataReferencia,
  });

  const atual = dias.find((dia) => dia.data === dataReferencia)!;
  const fechamento = dias[dias.length - 1];
  const marcos = selecionarMarcos(dias, dataReferencia);

  const tituloMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mes - 1, 1)));

  const posicoes = [
    {
      chave: "atual",
      titulo: "Posição atual",
      dia: atual,
      tipo: "ATUAL",
    },
    ...marcos.map((dia) => ({
      chave: dia.data,
      titulo: "Mudança de saldo",
      dia,
      tipo: "MOVIMENTO",
    })),
    ...(fechamento.data > dataReferencia
      ? [
          {
            chave: "fechamento",
            titulo: "Fechamento do mês",
            dia: fechamento,
            tipo: "FECHAMENTO",
          },
        ]
      : []),
  ];

  return (
    <section
      aria-labelledby="marcos-title"
      className="@container mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="marcos-title" className="font-heading text-xl font-extrabold">
            Próximos marcos
          </h2>

          <p className="mt-1 text-sm text-muted first-letter:uppercase">
            {tituloMes}
          </p>
        </div>

        <Link
          href="/calendario"
          className="inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Ver calendário →
        </Link>
      </header>

      <ol className="mt-5 grid gap-3 @[1000px]:grid-flow-col @[1000px]:auto-cols-fr">
        {posicoes.map(({ chave, dia, tipo }) => {
          const variacao =
            (Math.round(dia.entradas * 100) - Math.round(dia.saidas * 100)) /
            100;

          const quantidade = transacoes.filter(
            (transacao) => transacao.dataTransacao === dia.data,
          ).length;

          const atual = tipo === "ATUAL";
          const final = tipo === "FECHAMENTO";
          const negativo = dia.saldoAcumulado < 0;

          const anterior = dias[dias.indexOf(dia) - 1];

          const entrouNoNegativo =
            !atual &&
            anterior !== undefined &&
            anterior.saldoAcumulado >= 0 &&
            negativo;

          const titulo = atual
            ? "Saldo atual"
            : final
              ? "Fechamento do mês"
              : variacao > 0
                ? "Entrada prevista"
                : "Saída prevista";

          const superficieClasse = atual
            ? "border-primary bg-raised text-foreground"
            : final
              ? "border-brand-plum bg-brand-plum text-brand-cream"
              : "border-border bg-surface text-foreground";

          const secundarioClasse = final ? "text-dark-muted" : "text-muted";

          const variacaoClasse = final
            ? variacao < 0
              ? "text-[#FFB8CD]"
              : "text-[#B4D6C1]"
            : variacao < 0
              ? "text-negative"
              : "text-positive";

          const saldoClasse = negativo
            ? final
              ? "text-[#FFB8CD]"
              : "text-negative"
            : final
              ? "text-brand-cream"
              : "text-foreground";

          return (
            <li
              key={chave}
              className={`flex min-w-0 flex-col rounded-xl border p-4 ${superficieClasse}`}
            >
              <p className="text-xs font-bold">{titulo}</p>

              <time
                dateTime={dia.data}
                className={`mt-1 block text-sm ${secundarioClasse}`}
              >
                {formatarData(dia.data)}
              </time>

              {!atual && quantidade > 0 && (
                <div className="mt-3">
                  <p className={`text-xs ${secundarioClasse}`}>
                    Resultado de {quantidade}{" "}
                    {quantidade === 1 ? "movimento" : "movimentos"}
                  </p>

                  <p
                    className={`mt-1 text-sm font-bold tabular-nums ${variacaoClasse}`}
                  >
                    {variacao > 0 ? "+" : ""}
                    {formatarMoeda(variacao)}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4">
                <p className={`text-xs ${secundarioClasse}`}>
                  {atual
                    ? "Saldo acumulado"
                    : final
                      ? "Saldo projetado no fechamento"
                      : "Saldo após o dia"}
                </p>

                <p
                  className={`mt-1 wrap-break-word text-lg font-extrabold tabular-nums ${saldoClasse}`}
                >
                  {formatarMoeda(dia.saldoAcumulado)}
                </p>
              </div>

              {entrouNoNegativo && (
                <p className="mt-3 rounded-lg bg-negative-background px-2 py-1.5 text-xs font-bold text-negative">
                  Saldo passa a negativo
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-4 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted">
        Destacamos as maiores mudanças previstas no mês e quando o saldo pode
        ficar negativo.
      </p>
    </section>
  );
}
