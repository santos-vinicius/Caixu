import Link from "next/link";

export default function LoginPage() {
  return (
    <section aria-labelledby="login-title">
      <h1
        id="login-title"
        className="font-heading text-[32px] leading-[1.12] font-extrabold tracking-tight"
      >
        Entrar
      </h1>
      <p className="mt-2.5 mb-7 text-muted">Acesse sua caixinha financeira</p>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="email@exemplo.com"
            required
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3.5 
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="senha" className="text-sm font-bold">
              Senha
            </label>

            <Link
              href="/esqueci-senha"
              className="rounded text-sm font-bold text-primary underline-offset-4 hover:underline 
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3.5 
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <button
          type="button"
          className="mt-2 h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary 
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="rounded font-bold text-primary underline-offset-4 hover:underline 
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Criar conta
        </Link>
      </p>
    </section>
  );
}
