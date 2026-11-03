import AppHeader from "@/app/components/AppHeader";
import CalendarioFinanceiro from "@/app/components/CalendarioFinanceiro";

export default function CalendarioPage() {
  return (
    <section aria-labelledby="calendario-title">
      <AppHeader
        id="calendario-title"
        titulo="Calendário financeiro"
        descricao="Acompanhe suas movimentações e veja o que vem pela frente."
      />

      <CalendarioFinanceiro />
    </section>
  );
}
