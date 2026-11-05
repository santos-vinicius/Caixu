import { requisitarApi } from "./api";

export type UsuarioAutenticado = {
  usuarioId: number;
  nome: string;
  email: string;
};

type LoginRequest = {
  email: string;
  senha: string;
};

export async function fazerLogin(
  dados: LoginRequest,
): Promise<UsuarioAutenticado> {
  const resposta = await requisitarApi("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    if (resposta.status === 401) {
      throw new Error("E-mail ou senha inválidos.");
    }

    if (resposta.status === 400) {
      throw new Error("Confira os dados informados.");
    }

    if (resposta.status === 403) {
      throw new Error(
        "Não foi possível validar a proteção da requisição. Tente novamente.",
      );
    }

    throw new Error("Não foi possível entrar. Tente novamente.");
  }

  return resposta.json();
}

export async function consultarSessao(): Promise<UsuarioAutenticado | null> {
  const resposta = await requisitarApi("/auth/me");

  if (resposta.status === 401) {
    return null;
  }

  if (!resposta.ok) {
    throw new Error("Não foi possível consultar sua sessão.");
  }

  return resposta.json();
}

export async function encerrarSessao(): Promise<void> {
  const resposta = await requisitarApi("/auth/logout", {
    method: "POST",
  });

  if (!resposta.ok) {
    throw new Error("Não foi possível sair da conta. Tente novamente.");
  }
}
