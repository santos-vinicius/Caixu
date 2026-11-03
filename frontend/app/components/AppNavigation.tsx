"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/calendario", label: "Calendário" },
  { href: "/transacoes", label: "Transações" },
  { href: "/categorias", label: "Categorias" },
  { href: "/metas", label: "Metas" },
  { href: "/perfil", label: "Perfil" },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação Principal">
      <ul className="flex gap-2 overflow-x-auto lg:flex-col">
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="shrink-0">
              {" "}
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-xl px-4 py-3 text-sm font-bold 
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary 
                    ${active ? "bg-primary text-on-primary" : "text-muted hover:bg-background hover:text-foreground"}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
