import Logo from "@/app/components/Logo";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />

      <p className="font-bold text-primary">Erro 404</p>

      <h1 className="font-heading text-3xl font-extrabold">
        Essa página saiu do caminho.
      </h1>

      <p className="max-w-md text-muted">
        Confira o endereço ou volte para a página de entrada do Caixu.
      </p>

      <Link
        href="/login"
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Ir para o login
      </Link>
    </main>
  );
}
