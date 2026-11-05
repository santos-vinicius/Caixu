"use client";
import {
  atualizarCategoria,
  criarCategoria,
  removerCategoria,
  type Categoria,
} from "@/app/lib/categorias-api";
import type { Transacao, NovaTransacao } from "@/app/lib/transacoes";
import { criarTransacoes, atualizarTransacao, removerTransacao } from "@/app/lib/transacoes-api";
import { atualizarPerfil, type UsuarioResponse, type UsuarioAtualizacaoRequest } from "@/app/lib/usuarios-api";
import { useHoje } from "@/app/lib/use-hoje";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  selecionarParaExclusao,
  type EscopoExclusao,
} from "../lib/exclusao-transacoes";

export type AtualizacaoTransacao = Pick<
  Transacao,
  "descricao" | "valor" | "dataTransacao" | "categoriaId"
>;

type TransacoesContextValue = {
  dataReferencia: string;
  transacoes: Transacao[];
  adicionarTransacoes: (novas: NovaTransacao[]) => Promise<void>;
  excluirTransacao: (id: number, escopo?: EscopoExclusao) => Promise<void>;
  editarTransacao: (id: number, alteracoes: AtualizacaoTransacao) => Promise<void>;
  categorias: Categoria[];
  adicionarCategoria: (
    nome: string,
    tipo: "RECEITA" | "DESPESA",
  ) => Promise<void>;
  renomearCategoria: (id: number, nome: string) => Promise<string | null>;
  excluirCategoria: (id: number) => Promise<void>;
  usuario: UsuarioResponse;
  atualizarUsuario: (dados: UsuarioAtualizacaoRequest) => Promise<void>;
};

const TransacoesContext = createContext<TransacoesContextValue | undefined>(
  undefined,
);

export default function TransacoesProvider({
  children,
  usuarioInicial,
  categoriasIniciais,
  transacoesIniciais,
}: {
  children: ReactNode;
  usuarioInicial: UsuarioResponse;
  categoriasIniciais: Categoria[];
  transacoesIniciais: Transacao[];
}) {
  const dataReferencia = useHoje();
  const [transacoes, setTransacoes] = useState<Transacao[]>(transacoesIniciais);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [usuario, setUsuario] = useState<UsuarioResponse>(usuarioInicial);

  async function adicionarTransacoes(novas: NovaTransacao[]): Promise<void> {
    const criadas = await criarTransacoes(novas);
    setTransacoes((atuais) => [...atuais, ...criadas]);
  }

  async function excluirTransacao(id: number, escopo: EscopoExclusao = "SOMENTE_ESTA"): Promise<void> {
    await removerTransacao(id, escopo);
    setTransacoes((atuais) => {
      const ids = new Set(selecionarParaExclusao(atuais, id, escopo).map((item) => item.id));
      return atuais.filter((item) => !ids.has(item.id));
    });
  }

  async function editarTransacao(id: number, alteracoes: AtualizacaoTransacao): Promise<void> {
    const existente = transacoes.find((item) => item.id === id);
    if (!existente) throw new Error("Lançamento não encontrado. Atualize a página.");
    const atualizada = await atualizarTransacao(id, { ...existente, ...alteracoes });
    setTransacoes((atuais) => atuais.map((item) => item.id === id ? atualizada : item));
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

  async function atualizarUsuario(dados: UsuarioAtualizacaoRequest): Promise<void> {
    const atualizado = await atualizarPerfil(usuario.id, dados);
    setUsuario(atualizado);
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
