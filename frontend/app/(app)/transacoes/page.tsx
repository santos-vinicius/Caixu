import ListaTransacoes from "@/app/components/ListaTransacoes";
import NovaTransacao from "@/app/components/NovaTransacao";

export default function TransacoesPage() {
  return (
    <section aria-labelledby="transacoes-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            id="transacoes-title"
            className="font-heading text-3xl font-extrabold"
          >
            Transações
          </h1>

          <p className="mt-2 text-muted">
            Consulte e organize suas movimentações.
          </p>
        </div>
        <NovaTransacao />
      </header>

      <ListaTransacoes />
    </section>
  );
}
