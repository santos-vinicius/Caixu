import type { ReactNode } from "react";

import UsuarioAvatar from "@/app/components/UsuarioAvatar";

type AppHeaderProps = {
  id: string;
  titulo: string;
  descricao: string;
  actions?: ReactNode;
};

export default function AppHeader({
  id,
  titulo,
  descricao,
  actions,
}: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 id={id} className="font-heading text-3xl font-extrabold">
          {titulo}
        </h1>

        <p className="mt-2 text-muted">{descricao}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {actions}
        <UsuarioAvatar />
      </div>
    </header>
  );
}
