"use client";

import { useTransacoes } from "@/app/components/TransacoesProvider";
import {
  formatarSaldoInput,
  interpretarSaldoInput,
} from "@/app/lib/formatters";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import ExcluirConta from "./ExcluirConta";

export default function PerfilUsuario() {
  const { usuario, atualizarUsuario } = useTransacoes();

  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [saldo, setSaldo] = useState(formatarSaldoInput(usuario.saldoInicial));

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const operacaoEmAndamento = useRef(false);
  const confirmacaoNecessaria = email.trim().toLowerCase() !== usuario.email.toLowerCase() || novaSenha !== "";

  const campoClasse =
    "h-12 w-full rounded-xl border-2 border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  function restaurarCampos() {
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSaldo(formatarSaldoInput(usuario.saldoInicial));
    setErro("");
    setMensagem("");
    setSenhaAtual("");
    setNovaSenha("");
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (operacaoEmAndamento.current) return;
    setErro("");
    setMensagem("");

    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();

    if (!nomeTratado || nomeTratado.length > 60) {
      setErro("Informe um nome entre 1 e 60 caracteres.");
      return;
    }

    if (!emailTratado || emailTratado.length > 120) {
      setErro("Informe um e-mail com até 120 caracteres.");
      return;
    }

    const saldoNumerico = interpretarSaldoInput(saldo);

    if (saldoNumerico === null) {
      setErro(
        "Informe um saldo válido, como 1.000,50 ou -250,00, com até 13 dígitos inteiros.",
      );
      return;
    }

    operacaoEmAndamento.current = true;
    setSalvando(true);
    try {
    await atualizarUsuario({
      nome: nomeTratado,
      email: emailTratado,
      saldoInicial: saldoNumerico,
      senha: novaSenha || undefined,
      senhaAtual: senhaAtual || undefined,
    });

    setNome(nomeTratado);
    setEmail(emailTratado);
    setSaldo(formatarSaldoInput(saldoNumerico));
    setSenhaAtual("");
    setNovaSenha("");
    setMensagem("Perfil atualizado. Seus saldos foram recalculados.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível atualizar seu perfil.");
    } finally {
      operacaoEmAndamento.current = false;
      setSalvando(false);
    }
  }

  return (
    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden rounded-3xl border border-border bg-raised p-6 text-center xl:block">
        <Image
          src="/images/caixu-neutral.svg"
          alt=""
          width={96}
          height={96}
          className="mx-auto h-auto w-24"
        />

        <h2 className="mt-5 font-heading text-xl font-extrabold break-words">
          {usuario.nome}
        </h2>

        <p className="mt-2 text-sm break-words text-muted">{usuario.email}</p>

        <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
          Seus dados, organizados em um só lugar.
        </p>
      </aside>

      <section
        aria-labelledby="dados-pessoais-title"
        className="min-w-0 rounded-3xl border border-border bg-surface p-4 sm:p-6"
      >
        <h2
          id="dados-pessoais-title"
          className="font-heading text-xl font-extrabold"
        >
          Dados pessoais
        </h2>

        <form onSubmit={salvar} className="mt-5" aria-busy={salvando}>
          <fieldset disabled={salvando} className="min-w-0 space-y-5 disabled:opacity-60">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="perfil-nome" className="text-sm font-bold">
                Nome
              </label>

              <input
                id="perfil-nome"
                name="nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                autoComplete="name"
                maxLength={60}
                required
                className={campoClasse}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="perfil-email" className="text-sm font-bold">
                E-mail
              </label>

              <input
                id="perfil-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={120}
                required
                className={campoClasse}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="perfil-saldo" className="text-sm font-bold">
              Saldo inicial (R$)
            </label>

            <input
              id="perfil-saldo"
              name="saldoInicial"
              type="text"
              inputMode="decimal"
              value={saldo}
              onChange={(event) => setSaldo(event.target.value)}
              aria-describedby="perfil-saldo-ajuda"
              placeholder="Ex.: 1.000,00"
              onBlur={() => {
                const valor = interpretarSaldoInput(saldo);

                if (valor !== null) {
                  setSaldo(formatarSaldoInput(valor));
                }
              }}
              required
              className={campoClasse}
            />

            <p id="perfil-saldo-ajuda" className="text-sm text-muted">
              É seu saldo ao começar a usar o Caixu. Alterá-lo recalcula o saldo
              atual e todas as projeções, sem criar uma transação. Valores
              negativos são permitidos.
            </p>
          </div>

          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="perfil-nova-senha" className="text-sm font-bold">Nova senha · opcional</label>
              <input id="perfil-nova-senha" type="password" value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)} maxLength={100}
                autoComplete="new-password" placeholder="Deixe em branco para manter a atual" className={campoClasse} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="perfil-senha-atual" className="text-sm font-bold">Senha atual</label>
              <input id="perfil-senha-atual" type="password" value={senhaAtual}
                onChange={(event) => setSenhaAtual(event.target.value)} maxLength={100}
                autoComplete="current-password" required={confirmacaoNecessaria}
                aria-describedby="perfil-seguranca-ajuda" placeholder="Confirme ao alterar e-mail ou senha" className={campoClasse} />
            </div>
            <p id="perfil-seguranca-ajuda" className="text-xs text-muted sm:col-span-2">
              Para alterar seu e-mail ou senha, confirme a senha atual. As demais alterações não exigem essa confirmação.
            </p>
          </div>

          {erro && (
            <p role="alert" className="text-sm font-bold text-negative">
              {erro}
            </p>
          )}

          <p
            role="status"
            aria-live="polite"
            className={
              mensagem
                ? "rounded-xl border border-positive bg-positive-background p-4 text-sm font-bold text-positive"
                : "sr-only"
            }
          >
            {mensagem}
          </p>

          <footer className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={restaurarCampos}
              className="min-h-12 rounded-xl border border-border px-4 font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Descartar alterações
            </button>

            <button
              type="submit"
              className="min-h-12 rounded-xl bg-primary px-5 font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </footer>
          </fieldset>
        </form>
        <ExcluirConta />
      </section>
    </div>
  );
}
