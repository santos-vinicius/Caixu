import AppHeader from "@/app/components/AppHeader";
import ListaTransacoes from "@/app/components/ListaTransacoes";
import NovaTransacao from "@/app/components/NovaTransacao";
import { Suspense } from "react";

export default function TransacoesPage() {
  return (
    <section aria-labelledby="transacoes-title">
      <AppHeader
        id="transacoes-title"
        titulo="Transações"
        descricao="Consulte e organize suas movimentações."
        actions={<NovaTransacao />}
      />

      <Suspense
        fallback={
          <p role="status" className="py-6 text-sm text-muted">
            Carregando transações…
          </p>
        }
      >
        <ListaTransacoes />
      </Suspense>
    </section>
  );
}
