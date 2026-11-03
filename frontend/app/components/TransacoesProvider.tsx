"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { categoriasDemo } from "@/app/lib/categorias-demo";
import { transacoesDemo, type TransacaoDemo } from "@/app/lib/demo-data";
import { CategoriaDemo } from "../lib/categorias-demo";
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
  categorias: CategoriaDemo[];
  adicionarCategoria: (nome: string, tipo: "RECEITA" | "DESPESA") => void;
  renomearCategoria: (id: number, nome: string) => string | null;
  excluirCategoria: (id: number) => void;
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
  const [categorias, setCategorias] = useState<CategoriaDemo[]>(categoriasDemo);
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

  function adicionarCategoria(nome: string, tipo: "RECEITA" | "DESPESA") {
    const nomeTratado = nome.trim();

    if (!nomeTratado || nomeTratado.length > 60) {
      return;
    }

    setCategorias((atuais) => {
      const duplicada = atuais.some(
        (categoria) =>
          categoria.tipoCategoria === tipo &&
          categoria.nomeCategoria.toLocaleLowerCase("pt-BR") ===
            nomeTratado.toLocaleLowerCase("pt-BR"),
      );

      if (duplicada) {
        return atuais;
      }

      const maiorId = atuais.reduce(
        (maior, categoria) => Math.max(maior, categoria.id),
        0,
      );

      return [
        ...atuais,
        {
          id: maiorId + 1,
          nomeCategoria: nomeTratado,
          tipoCategoria: tipo,
          usuarioId: 1,
        },
      ];
    });
  }

  function renomearCategoria(id: number, nome: string): string | null {
    const nomeTratado = nome.trim();
    const categoria = categorias.find((item) => item.id === id);

    if (!categoria) {
      return "Categoria não encontrada.";
    }

    if (!nomeTratado || nomeTratado.length > 60) {
      return "Informe um nome entre 1 e 60 caracteres.";
    }

    const duplicada = categorias.some(
      (item) =>
        item.id !== id &&
        item.tipoCategoria === categoria.tipoCategoria &&
        item.nomeCategoria.toLocaleLowerCase("pt-BR") ===
          nomeTratado.toLocaleLowerCase("pt-BR"),
    );

    if (duplicada) {
      return "Já existe uma categoria com esse nome e tipo.";
    }

    setCategorias((atuais) =>
      atuais.map((item) =>
        item.id === id ? { ...item, nomeCategoria: nomeTratado } : item,
      ),
    );

    return null;
  }

  function excluirCategoria(id: number) {
    setTransacoes((atuais) =>
      atuais.map((transacao) =>
        transacao.categoriaId === id
          ? { ...transacao, categoriaId: undefined }
          : transacao,
      ),
    );

    setCategorias((atuais) =>
      atuais.filter((categoria) => categoria.id !== id),
    );
  }

  return (
    <TransacoesContext.Provider
      value={{
        transacoes,
        adicionarTransacoes,
        excluirTransacao,
        editarTransacao,
        categorias,
        adicionarCategoria,
        renomearCategoria,
        excluirCategoria,
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
