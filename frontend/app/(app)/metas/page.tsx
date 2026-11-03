import AppHeader from "@/app/components/AppHeader";
import Image from "next/image";

export default function MetasPage() {
  return (
    <section aria-labelledby="metas-title">
      <AppHeader
        id="metas-title"
        titulo="Metas e reserva financeira"
        descricao="Um espaço para seus próximos planos."
      />
      <div className="mt-8 grid items-stretch gap-5 xl:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-3xl bg-brand-plum px-6 py-10 text-center text-brand-cream sm:px-8">
          <Image
            src="/images/caixu-atento.svg"
            alt=""
            width={110}
            height={110}
            className="h-auto w-28"
          />

          <h2 className="mt-8 max-w-md font-heading text-3xl font-extrabold leading-tight">
            Uma reserva para cada plano.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-dark-muted">
            Quando essa etapa chegar, o Caixu ajuda a acompanhar seus objetivos
            com calma.
          </p>
        </div>

        <section
          aria-labelledby="reserva-title"
          className="flex flex-col justify-center rounded-3xl border-2 border-dashed border-border bg-surface p-6 sm:p-8"
        >
          <span className="self-start rounded-full bg-planned-background px-3 py-1.5 text-xs font-extrabold tracking-wide text-planned-text uppercase">
            Em planejamento
          </span>

          <h2
            id="reserva-title"
            className="mt-5 font-heading text-2xl font-extrabold"
          >
            Reserva financeira
          </h2>

          <p className="mt-4 leading-relaxed text-muted">
            Essa área foi reservada para uma próxima fase do projeto.
          </p>

          <ul className="mt-5 list-disc space-y-2 pl-5 text-muted">
            <li>Meta e valor-alvo</li>
            <li>Aportes e acompanhamento</li>
            <li>Investimentos e rentabilidade</li>
          </ul>

          <p className="mt-6 font-bold text-muted">
            Disponível em uma próxima fase.
          </p>
        </section>
      </div>
    </section>
  );
}
