import Logo from "@/app/components/Logo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <Logo />
      <p>Suas finanças descomplicadas.</p>

      <Link
        href="/login"
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Acessar minha conta
      </Link>

      <Link
        href="/cadastro"
        className="rounded font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Criar conta
      </Link>
    </main>
  );
}
