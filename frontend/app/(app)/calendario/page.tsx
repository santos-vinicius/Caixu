import CalendarioFinanceiro from "@/app/components/CalendarioFinanceiro";

export default function CalendarioPage() {
  return (
    <section aria-labelledby="calendario-title">
      <h1
        id="calendario-title"
        className="font-heading text-3xl font-extrabold"
      >
        Calendário financeiro
      </h1>

      <p className="mt-2 text-muted">
        Acompanhe suas movimentações e veja o que vem pela frente.
      </p>

      <CalendarioFinanceiro />
    </section>
  );
}
