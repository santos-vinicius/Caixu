"use client";

import Link from "next/link";

import { useTransacoes } from "@/app/components/TransacoesProvider";

export default function UsuarioAvatar() {
  const { usuario } = useTransacoes();

  const partes = usuario.nome.trim().split(/\s+/).filter(Boolean);

  const iniciais =
    partes.length > 1
      ? `${partes[0][0]}${partes[partes.length - 1][0]}`
      : partes[0]?.slice(0, 2) || "CX";

  return (
    <Link
      href="/perfil"
      aria-label={`Abrir perfil de ${usuario.nome}`}
      title={usuario.nome}
      className="flex size-11 shrink-0 lg:size-12 items-center justify-center rounded-xl border border-border bg-raised font-bold text-primary uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span aria-hidden="true">{iniciais}</span>
    </Link>
  );
}
