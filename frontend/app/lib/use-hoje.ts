"use client";

import { useSyncExternalStore } from "react";

function obterHojeLocal(): string {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function acompanharData(notificar: () => void) {
  const intervalo = window.setInterval(notificar, 60_000);

  window.addEventListener("focus", notificar);

  return () => {
    window.clearInterval(intervalo);
    window.removeEventListener("focus", notificar);
  };
}

function obterDataNoServidor(): null {
  return null;
}

export function useHoje(): string | null {
  return useSyncExternalStore(
    acompanharData,
    obterHojeLocal,
    obterDataNoServidor,
  );
}
