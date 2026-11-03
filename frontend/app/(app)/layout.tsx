import Link from "next/link";
import { ReactNode } from "react";
import AppNavigation from "../components/AppNavigation";
import Logo from "../components/Logo";
import TransacoesProvider from "../components/TransacoesProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TransacoesProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <a
          href="#app-content"
          className="sr-only rounded-xl bg-primary px-4 py-3 font-bold text-on-primary 
        focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Ir para o conteúdo
        </a>

        <aside
          className="border-b border-border bg-surface px-4 py-5 lg:sticky lg:top-0 
      lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-5 lg:py-8"
        >
          <Link
            href="/dashboard"
            aria-label="Caixu - Visão Geral"
            className="inline-block self-start rounded px-3 focus-visible:outline-2 
          focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Logo />
          </Link>

          <div className="mt-6 lg:mt-10">
            <AppNavigation />
          </div>

          <div className="mt-6 border-t border-border pt-5 lg:mt-auto lg:pt-6">
            <p className="text-xs text-muted">Feito por Vinicius Santos</p>

            <a
              href="https://github.com/santos-vinicius/Caixu"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Conheça o projeto
              <span aria-hidden="true">↗</span>
              <span className="sr-only"> — abre em uma nova aba</span>
            </a>
          </div>
        </aside>

        <main id="app-content" tabIndex={-1} className="min-w-0 p-6 lg:p-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </TransacoesProvider>
  );
}
