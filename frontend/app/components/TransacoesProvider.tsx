"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { transacoesDemo, type TransacaoDemo } from "@/app/lib/demo-data";

type NovaTransacaoDemo = Omit<TransacaoDemo, "id">;

type TransacoesContextValue = {
  transacoes: TransacaoDemo[];
  adicionarTransacoes: (novas: NovaTransacaoDemo[]) => void;
};

const TransacoesContext = createContext<TransacoesContextValue | undefined>(
  undefined,
);

export default function TransacoesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [transacoes, setTransacoes] = useState<TransacaoDemo[]>(transacoesDemo);
  function adicionarTransacoes(novas: NovaTransacaoDemo[]) {
    setTransacoes((atuais) => {
      const maiorId = atuais.reduce(
        (maior, transacao) => Math.max(maior, transacao.id),
        0,
      );

      const registros = novas.map((transacao, indice) => ({
        ...transacao,
        id: maiorId + indice + 1,
      }));
      return [...atuais, ...registros];
    });
  }

  return (
    <TransacoesContext.Provider value={{ transacoes, adicionarTransacoes }}>
      {children}
    </TransacoesContext.Provider>
  );
}

export function useTransacoes() {
  const context = useContext(TransacoesContext);

  if (!context) {
    throw new Error(
      "useTransacoes deve ser usado dentro de TransacoesProvider.",
    );
  }

  return context;
}
