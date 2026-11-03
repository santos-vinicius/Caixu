"use client";

import Link from "next/link";

import { useTransacoes } from "@/app/components/TransacoesProvider";

export default function UsuarioSidebar() {
  const { usuario } = useTransacoes();

  const partes = usuario.nome.trim().split(/\s+/).filter(Boolean);

  const iniciais =
    partes.length > 1
      ? `${partes[0][0]}${partes[partes.length - 1][0]}`
      : partes[0]?.slice(0, 2) || "CX";

  return (
    <Link
      href="/perfil"
      className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-background p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-raised font-bold text-primary uppercase"
      >
        {iniciais}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">{usuario.nome}</span>

        <span className="mt-1 block text-xs text-muted">Ver meu perfil</span>
      </span>
    </Link>
  );
}
