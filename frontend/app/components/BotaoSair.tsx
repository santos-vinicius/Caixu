"use client";

import { encerrarSessao } from "@/app/lib/auth-api";
import { useRef, useState } from "react";

export default function BotaoSair() {
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");
  const envioEmAndamento = useRef(false);

  async function sair() {
    if (envioEmAndamento.current) {
      return;
    }

    envioEmAndamento.current = true;
    setSaindo(true);
    setErro("");

    try {
      await encerrarSessao();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível sair da conta.",
      );

      envioEmAndamento.current = false;
      setSaindo(false);
      return;
    }

    window.location.replace("/login");
  }

  return (
    <div className="mt-6 border-t border-border pt-5">
      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className="min-h-11 rounded-xl border border-border px-4
          text-sm font-bold text-primary
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-primary
          disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saindo ? "Saindo..." : "Sair da conta"}
      </button>

      {erro && (
        <p role="alert" className="mt-2 text-sm text-negative">
          {erro}
        </p>
      )}
    </div>
  );
}
