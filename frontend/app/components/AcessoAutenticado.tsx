"use client";

import { consultarSessao } from "@/app/lib/auth-api";
import { buscarUsuario, type UsuarioResponse } from "@/app/lib/usuarios-api";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { listarCategorias, type Categoria } from "../lib/categorias-api";
import TransacoesProvider from "./TransacoesProvider";
import { listarTransacoes } from "@/app/lib/transacoes-api";
import type { Transacao } from "@/app/lib/transacoes";

export default function AcessoAutenticado({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [erro, setErro] = useState("");
  const [transacoes, setTransacoes] = useState<Transacao[] | null>(null);
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarUsuario() {
      try {
        const sessao = await consultarSessao();

        if (!ativo) {
          return;
        }

        if (!sessao) {
          router.replace("/login");
          return;
        }

        const dados = await buscarUsuario(sessao.usuarioId);

        if (!ativo) {
          return;
        }

        if (!dados) {
          router.replace("/login");
          return;
        }

        const [categoriasCarregadas, transacoesCarregadas] = await Promise.all([
          listarCategorias(), listarTransacoes(),
        ]);

        if (!ativo) {
          return;
        }

        setCategorias(categoriasCarregadas);
        setTransacoes(transacoesCarregadas);
        setUsuario(dados);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar sua conta.",
          );
        }
      }
    }

    void carregarUsuario();

    return () => {
      ativo = false;
    };
  }, [router]);

  if (erro) {
    return (
      <div className="p-6">
        <p role="alert" className="text-sm text-negative">
          {erro}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 min-h-11 rounded-xl bg-primary px-4 font-bold
            text-on-primary focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!usuario || categorias === null || transacoes === null) {
    return (
      <p role="status" className="p-6 text-sm text-muted">
        Carregando sua conta…
      </p>
    );
  }

  return (
    <TransacoesProvider
      key={usuario.id}
      usuarioInicial={usuario}
      categoriasIniciais={categorias}
      transacoesIniciais={transacoes}
    >
      {children}
    </TransacoesProvider>
  );
}
