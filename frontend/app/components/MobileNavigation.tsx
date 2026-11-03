"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { links } from "./AppNavigation";

const destinosPrincipais = ["/dashboard", "/calendario", "/transacoes"];

export default function MobileNavigation() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const principais = links.filter(({ href }) =>
    destinosPrincipais.includes(href),
  );
  const adicionais = links.filter(
    ({ href }) => !destinosPrincipais.includes(href),
  );
  const estaAtivo = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const maisAtivo = adicionais.some(({ href }) => estaAtivo(href));

  useEffect(() => {
    dialogRef.current?.close();
    const desktop = window.matchMedia("(min-width: 1024px)");
    function fecharNoDesktop() {
      if (desktop.matches) dialogRef.current?.close();
    }
    fecharNoDesktop();
    desktop.addEventListener("change", fecharNoDesktop);
    return () => desktop.removeEventListener("change", fecharNoDesktop);
  }, [pathname]);

  const itemClasse =
    "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <>
      <nav
        aria-label="Navegação principal no celular"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-3 pt-2 pb-[calc(0.5rem_+_env(safe-area-inset-bottom))] lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {principais.map(({ href, label, icon }) => (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={estaAtivo(href) ? "page" : undefined}
                className={`${itemClasse} ${estaAtivo(href) ? "bg-raised text-primary" : "text-muted hover:bg-background"}`}
              >
                <svg
                  aria-hidden="true"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={icon} />
                </svg>
                <span>{href === "/dashboard" ? "Início" : label}</span>
              </Link>
            </li>
          ))}
          <li className="min-w-0">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-controls="mobile-more-dialog"
              onClick={() => dialogRef.current?.showModal()}
              className={`${itemClasse} w-full ${maisAtivo ? "bg-raised text-primary" : "text-muted hover:bg-background"}`}
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
              <span>Mais</span>
              {maisAtivo && <span className="sr-only">Seção atual</span>}
            </button>
          </li>
        </ul>
      </nav>
      <dialog
        id="mobile-more-dialog"
        ref={dialogRef}
        aria-labelledby="mobile-more-title"
        className="caixu-scrollbar fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-border bg-surface p-5 pb-[calc(1.25rem_+_env(safe-area-inset-bottom))] text-foreground backdrop:bg-brand-plum/60"
      >
        <header className="flex items-center justify-between gap-4">
          <h2
            id="mobile-more-title"
            className="font-heading text-xl font-extrabold"
          >
            Seu espaço
          </h2>
          <button
            type="button"
            autoFocus
            aria-label="Fechar menu"
            onClick={() => dialogRef.current?.close()}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border text-xl text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <nav aria-label="Outras páginas" className="mt-4">
          <ul className="space-y-2">
            {adicionais.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={estaAtivo(href) ? "page" : undefined}
                  onClick={() => dialogRef.current?.close()}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${estaAtivo(href) ? "bg-raised text-primary" : "text-foreground hover:bg-background"}`}
                >
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={icon} />
                  </svg>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <footer className="mt-5 border-t border-border pt-4">
          <p className="text-xs text-muted">Feito por Vinicius Santos</p>
          <a
            href="https://github.com/santos-vinicius/Caixu"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Conheça o projeto <span aria-hidden="true">↗</span>
            <span className="sr-only"> — abre em uma nova aba</span>
          </a>
        </footer>
      </dialog>
    </>
  );
}
