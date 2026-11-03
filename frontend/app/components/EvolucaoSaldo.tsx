"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import { gerarCalendario } from "@/app/lib/calendario";
import { dataReferencia } from "@/app/lib/demo-data";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";

export default function EvolucaoSaldo() {
  const { transacoes, usuario } = useTransacoes();
  const tituloId = useId();
  const descricaoId = useId();

  const [diaSelecionado, setDiaSelecionado] = useState(dataReferencia);

  const [ano, mes] = dataReferencia.split("-").map(Number);

  const dias = gerarCalendario({
    ano,
    mes,
    transacoes,
    saldoInicial: usuario.saldoInicial,
    dataReferencia,
  });

  const tituloMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mes - 1, 1)));

  const largura = 800;
  const altura = 220;
  const margem = { esquerda: 100, direita: 20, topo: 20, base: 35 };

  const larguraUtil = largura - margem.esquerda - margem.direita;
  const alturaUtil = altura - margem.topo - margem.base;

  const valores = dias.map((dia) => dia.saldoAcumulado);
  const minimo = Math.min(0, ...valores);
  const maximo = Math.max(0, ...valores);
  const folga = Math.max((maximo - minimo) * 0.1, 1);

  const limiteInferior = minimo - folga;
  const limiteSuperior = maximo + folga;

  function obterX(indice: number) {
    return margem.esquerda + (indice / (dias.length - 1)) * larguraUtil;
  }

  function obterY(valor: number) {
    return (
      margem.topo +
      ((limiteSuperior - valor) / (limiteSuperior - limiteInferior)) *
        alturaUtil
    );
  }

  const pontos = dias.map((dia, indice) => ({
    ...dia,
    x: obterX(indice),
    y: obterY(dia.saldoAcumulado),
  }));

  const indiceReferencia = dias.findIndex((dia) => dia.data === dataReferencia);

  const realizados = pontos.slice(0, indiceReferencia + 1);
  const projetados = pontos.slice(Math.max(0, indiceReferencia));

  function formarLinha(registros: typeof pontos) {
    return registros.map((ponto) => `${ponto.x},${ponto.y}`).join(" ");
  }

  const selecionado =
    pontos.find((dia) => dia.data === diaSelecionado) ?? pontos[0];

  const marcadores = [0, Math.floor((dias.length - 1) / 2), dias.length - 1];

  const niveis = [...new Set([maximo, 0, minimo])];

  return (
    <section
      aria-labelledby={tituloId}
      className="mt-6 min-w-0 rounded-3xl border border-border bg-surface p-5 sm:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id={tituloId} className="font-heading text-xl font-extrabold">
            Evolução do saldo
          </h2>

          <p className="mt-1 text-sm text-muted capitalize">{tituloMes}</p>
        </div>

        <Link
          href="/calendario"
          className="inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Abrir calendário →
        </Link>
      </header>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="w-6 border-t-2 border-primary" />
          Até a referência
        </span>

        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="w-6 border-t-2 border-dashed border-primary"
          />
          Projeção futura
        </span>
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-label="Gráfico de evolução do saldo, com rolagem horizontal em telas pequenas"
        className="caixu-scrollbar mt-3 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <svg
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-labelledby={`${tituloId} ${descricaoId}`}
          className="h-auto w-full min-w-[600px]"
        >
          <desc id={descricaoId}>
            Saldo acumulado diário em {tituloMes}. A linha contínua representa
            os dias até {formatarData(dataReferencia)} e a tracejada representa
            os dias futuros. Consulte os valores exatos no seletor abaixo.
          </desc>

          {niveis.map((valor) => (
            <g key={valor}>
              <line
                x1={margem.esquerda}
                x2={largura - margem.direita}
                y1={obterY(valor)}
                y2={obterY(valor)}
                stroke="currentColor"
                className={valor === 0 ? "text-negative" : "text-border"}
                strokeDasharray={valor === 0 ? "4 4" : undefined}
              />

              <text
                x={margem.esquerda - 10}
                y={obterY(valor)}
                dy="0.35em"
                textAnchor="end"
                fill="currentColor"
                className="text-muted"
                fontSize="11"
              >
                {formatarMoeda(valor)}
              </text>
            </g>
          ))}

          <polyline
            points={formarLinha(realizados)}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />

          <polyline
            points={formarLinha(projetados)}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />

          <circle
            cx={selecionado.x}
            cy={selecionado.y}
            r="5"
            fill="currentColor"
            className="text-primary"
          />

          {marcadores.map((indice) => (
            <text
              key={indice}
              x={obterX(indice)}
              y={altura - 10}
              textAnchor="middle"
              fill="currentColor"
              className="text-muted"
              fontSize="11"
            >
              {Number(dias[indice].data.slice(-2))}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${tituloId}-dia`} className="text-sm font-bold">
            Consultar dia
          </label>

          <select
            id={`${tituloId}-dia`}
            value={diaSelecionado}
            onChange={(event) => setDiaSelecionado(event.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {dias.map((dia) => (
              <option key={dia.data} value={dia.data}>
                {formatarData(dia.data)}
              </option>
            ))}
          </select>
        </div>

        <p role="status" className="text-sm">
          <span className="block text-muted">
            {selecionado.futuro ? "Saldo projetado" : "Saldo acumulado"}
            {" · "}
            {formatarData(selecionado.data)}
          </span>

          <strong
            className={`mt-1 block text-xl tabular-nums ${
              selecionado.saldoAcumulado < 0
                ? "text-negative"
                : "text-foreground"
            }`}
          >
            {formatarMoeda(selecionado.saldoAcumulado)}
          </strong>
        </p>
      </div>
    </section>
  );
}
