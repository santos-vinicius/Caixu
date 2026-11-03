"use client";

import PasswordInput from "@/app/components/PasswordInput";
import { cadastrarUsuario } from "@/app/lib/usuarios-api";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function CadastroPage() {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (enviando || sucesso) return;

    const formulario = event.currentTarget;
    const campos = new FormData(formulario);

    const nome = String(campos.get("nome") ?? "").trim();
    const email = String(campos.get("email") ?? "").trim();
    const senha = String(campos.get("senha") ?? "");
    const saldoInicial = Number(campos.get("saldoInicial"));

    setErro("");
    setSucesso("");

    if (!nome || !email || !senha.trim()) {
      setErro("Preencha nome, e-mail e senha.");
      return;
    }

    if (!Number.isFinite(saldoInicial)) {
      setErro("Informe um saldo inicial válido.");
      return;
    }

    setEnviando(true);

    try {
      await cadastrarUsuario({
        nome,
        email,
        senha,
        saldoInicial,
      });

      formulario.reset();

      setSucesso("Conta criada com sucesso! Você já pode entrar.");
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível concluir o cadastro.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="cadastro-title">
      <h1
        id="cadastro-title"
        className="font-heading text-[32px] leading-[1.12] font-extrabold tracking-tight"
      >
        Crie sua conta
      </h1>

      <p className="mt-2.5 mb-7 text-muted">
        Comece a organizar suas finanças com o Caixu.
      </p>

      <form
        onSubmit={handleSubmit}
        aria-busy={enviando}
        className="flex flex-col gap-4"
      >
        {erro && (
          <p
            role="alert"
            className="rounded-xl border border-negative bg-negative-background px-4 py-3 text-sm text-negative"
          >
            {erro}
          </p>
        )}

        {sucesso && (
          <p
            role="status"
            className="rounded-xl border border-positive bg-positive-background px-4 py-3 text-sm text-positive"
          >
            {sucesso}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="nome" className="text-sm font-bold">
            Nome
          </label>

          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            maxLength={60}
            required
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3.5 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            maxLength={120}
            required
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3.5 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-bold">
            Senha
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Crie sua senha"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="saldoInicial" className="text-sm font-bold">
            Saldo Inicial
          </label>
          <input
            id="saldoInicial"
            type="number"
            name="saldoInicial"
            step="0.01"
            defaultValue="0"
            required
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3.5 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          <p className="text-sm text-muted">
            Informe seu saldo ao começar a usar o Caixu. <br />
            Você pode começar com zero.
          </p>
        </div>

        <button
          type="submit"
          disabled={enviando || Boolean(sucesso)}
          className="mt-2 h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {enviando
            ? "Criando conta…"
            : sucesso
              ? "Conta criada"
              : "Criar conta"}
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="rounded font-bold text-primary underline-offset-4 
          hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Entrar
          </Link>
        </p>
      </form>
    </section>
  );
}
