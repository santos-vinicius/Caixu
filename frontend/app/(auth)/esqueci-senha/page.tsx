"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function EsqueciSenhaPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "A recuperação de senha ainda está em desenvolvimento. Nenhum e-mail foi enviado.",
    );
  }

  return (
    <section aria-labelledby="recuperacao-title">
      <h1
        id="recuperacao-title"
        className="font-heading text-[32px] leading-[1.12] font-extrabold tracking-tight"
      >
        Esqueceu sua senha?
      </h1>
      <p className="text-muted mt-2.5 mb-7">
        Informe o e-mail usado no cadastro.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold">
            E-mail
          </label>

          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="email@exemplo.com"
            maxLength={120}
            required
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3.5 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <button
          type="submit"
          className="mt-2 min-h-12 rounded-xl bg-primary px-5 py-3 font-bold text-on-primary 
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Recuperar senha
        </button>

        <p role="status" className="text-sm text-muted">
          {message}
        </p>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="rounded text-sm font-bold text-primary underline-offset-4 hover:underline 
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Voltar para entrar
        </Link>
      </p>
    </section>
  );
}
