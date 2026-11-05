"use client";
import {
  atualizarCategoria,
  criarCategoria,
  removerCategoria,
  type Categoria,
} from "@/app/lib/categorias-api";
import { transacoesDemo, type TransacaoDemo } from "@/app/lib/demo-data";
import { useHoje } from "@/app/lib/use-hoje";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  selecionarParaExclusao,
  type EscopoExclusao,
} from "../lib/exclusao-transacoes";

type NovaTransacaoDemo = Omit<TransacaoDemo, "id">;
export type AtualizacaoTransacao = Pick<
  TransacaoDemo,
  "descricao" | "valor" | "dataTransacao" | "categoriaId"
>;

export type UsuarioDemo = {
  id: number;
  nome: string;
  email: string;
  saldoInicial: number;
};

type TransacoesContextValue = {
  dataReferencia: string;
  transacoes: TransacaoDemo[];
  adicionarTransacoes: (novas: NovaTransacaoDemo[]) => void;
  excluirTransacao: (id: number, escopo?: EscopoExclusao) => void;
  editarTransacao: (id: number, alteracoes: AtualizacaoTransacao) => void;
  categorias: Categoria[];
  adicionarCategoria: (
    nome: string,
    tipo: "RECEITA" | "DESPESA",
  ) => Promise<void>;
  renomearCategoria: (id: number, nome: string) => Promise<string | null>;
  excluirCategoria: (id: number) => Promise<void>;
  usuario: UsuarioDemo;
  atualizarUsuario: (dados: Omit<UsuarioDemo, "id">) => void;
};

const TransacoesContext = createContext<TransacoesContextValue | undefined>(
  undefined,
);

export default function TransacoesProvider({
  children,
  usuarioInicial,
  categoriasIniciais,
}: {
  children: ReactNode;
  usuarioInicial: UsuarioDemo;
  categoriasIniciais: Categoria[];
}) {
  const dataReferencia = useHoje();
  const [transacoes, setTransacoes] = useState<TransacaoDemo[]>(() =>
    transacoesDemo.map((transacao) => ({
      ...transacao,
      categoriaId: undefined,
    })),
  );
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [usuario, setUsuario] = useState<UsuarioDemo>(usuarioInicial);

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

  async function adicionarCategoria(
    nome: string,
    tipo: "RECEITA" | "DESPESA",
  ): Promise<void> {
    const nomeTratado = nome.trim();

    if (!nomeTratado || nomeTratado.length > 60) {
      throw new Error("Informe um nome entre 1 e 60 caracteres.");
    }

    const duplicada = categorias.some(
      (categoria) =>
        categoria.tipoCategoria === tipo &&
        categoria.nomeCategoria.toLocaleLowerCase("pt-BR") ===
          nomeTratado.toLocaleLowerCase("pt-BR"),
    );

    if (duplicada) {
      throw new Error("Já existe uma categoria com esse nome e tipo.");
    }

    const criada = await criarCategoria({
      nomeCategoria: nomeTratado,
      tipoCategoria: tipo,
    });

    setCategorias((atuais) => [...atuais, criada]);
  }

  async function renomearCategoria(
    id: number,
    nome: string,
  ): Promise<string | null> {
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

    const atualizada = await atualizarCategoria(id, {
      nomeCategoria: nomeTratado,
      tipoCategoria: categoria.tipoCategoria,
    });

    setCategorias((atuais) =>
      atuais.map((item) => (item.id === id ? atualizada : item)),
    );

    return null;
  }

  async function excluirCategoria(id: number): Promise<void> {
    await removerCategoria(id);

    setCategorias((atuais) =>
      atuais.filter((categoria) => categoria.id !== id),
    );

    setTransacoes((atuais) =>
      atuais.map((transacao) =>
        transacao.categoriaId === id
          ? { ...transacao, categoriaId: undefined }
          : transacao,
      ),
    );
  }

  function atualizarUsuario(dados: Omit<UsuarioDemo, "id">) {
    setUsuario((atual) => ({
      ...atual,
      ...dados,
    }));
  }

  if (dataReferencia === null) {
    return (
      <p role="status" className="p-6 text-sm text-muted">
        Preparando seu espaço…
      </p>
    );
  }

  return (
    <TransacoesContext.Provider
      value={{
        transacoes,
        dataReferencia,
        adicionarTransacoes,
        excluirTransacao,
        editarTransacao,
        categorias,
        adicionarCategoria,
        renomearCategoria,
        excluirCategoria,
        usuario,
        atualizarUsuario,
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
