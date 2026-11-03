"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { transacoesDemo, type TransacaoDemo } from "@/app/lib/demo-data";
import {
  selecionarParaExclusao,
  type EscopoExclusao,
} from "../lib/exclusao-transacoes";

type NovaTransacaoDemo = Omit<TransacaoDemo, "id">;
export type AtualizacaoTransacao = Pick<
  TransacaoDemo,
  "descricao" | "valor" | "dataTransacao" | "categoriaId"
>;

type TransacoesContextValue = {
  transacoes: TransacaoDemo[];
  adicionarTransacoes: (novas: NovaTransacaoDemo[]) => void;
  excluirTransacao: (id: number, escopo?: EscopoExclusao) => void;
  editarTransacao: (id: number, alteracoes: AtualizacaoTransacao) => void;
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
    const criadoEm = new Date().toISOString();
    setTransacoes((atuais) => {
      const maiorId = atuais.reduce(
        (maior, transacao) => Math.max(maior, transacao.id),
        0,
      );

      const registros = novas.map((transacao, indice) => ({
        ...transacao,
        id: maiorId + indice + 1,
        criadoEm,
      }));
      return [...atuais, ...registros];
    });
  }

  function excluirTransacao(
    id: number,
    escopo: EscopoExclusao = "SOMENTE_ESTA",
  ) {
    setTransacoes((atuais) => {
      const ids = new Set(
        selecionarParaExclusao(atuais, id, escopo).map(
          (transacao) => transacao.id,
        ),
      );

      return atuais.filter((transacao) => !ids.has(transacao.id));
    });
  }

  function editarTransacao(id: number, alteracoes: AtualizacaoTransacao) {
    setTransacoes((atuais) =>
      atuais.map((transacao) =>
        transacao.id === id ? { ...transacao, ...alteracoes } : transacao,
      ),
    );
  }

  return (
    <TransacoesContext.Provider
      value={{
        transacoes,
        adicionarTransacoes,
        excluirTransacao,
        editarTransacao,
      }}
    >
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
