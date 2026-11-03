"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/dashboard",
    label: "Visão geral",
    icon: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  },
  {
    href: "/calendario",
    label: "Calendário",
    icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2",
  },
  {
    href: "/transacoes",
    label: "Transações",
    icon: "M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4",
  },
  {
    href: "/categorias",
    label: "Categorias",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  },
  {
    href: "/metas",
    label: "Metas",
    icon: "M21 12a9 9 0 1 1-9-9m5 9a5 5 0 1 1-5-5m0 5 9-9m-5 0h5v5",
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2",
  },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal">
      <p className="mb-3 hidden px-4 text-xs font-bold tracking-widest text-muted uppercase lg:block">
        Seu espaço
      </p>

      <ul className="flex gap-2 overflow-x-auto p-1 lg:flex-col">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "bg-raised text-primary"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-3 left-0 w-1 rounded-full bg-primary"
                  />
                )}

                <svg
                  aria-hidden="true"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d={icon} />
                </svg>

                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
