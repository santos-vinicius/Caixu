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
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1
          id={id}
          className="font-heading text-2xl [overflow-wrap:anywhere] leading-tight font-extrabold sm:text-3xl"
        >
          {titulo}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          {descricao}
        </p>
      </div>
      <div
        className={
          actions
            ? "flex w-full min-w-0 items-center gap-3 sm:w-auto sm:shrink-0"
            : "hidden lg:flex"
        }
      >
        {actions}
        <div className="hidden lg:block">
          <UsuarioAvatar />
        </div>
      </div>
    </header>
  );
}
