import { requisitarApi } from "./api";
import { validarRespostaApi } from "./resposta-api";

export type UsuarioRequest = {
  nome: string;
  email: string;
  senha: string;
  saldoInicial: number;
};

export type UsuarioResponse = {
  id: number;
  nome: string;
  email: string;
  saldoInicial: number;
};

export async function cadastrarUsuario(
  dados: UsuarioRequest,
): Promise<UsuarioResponse> {
  const resposta = await requisitarApi("/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    if (resposta.status === 409) {
      throw new Error(
        "Não foi possível criar a conta. Verifique se o e-mail já está cadastrado.",
      );
    }

    if (resposta.status === 400) {
      throw new Error("Confira os dados informados e tente novamente.");
    }

    if (resposta.status === 403) {
      throw new Error(
        "Não foi possível validar a proteção da requisição. Tente novamente.",
      );
    }

    throw new Error("Não foi possível criar sua conta. Tente novamente.");
  }

  return resposta.json();
}

export async function buscarUsuario(
  id: number,
): Promise<UsuarioResponse | null> {
  const resposta = await requisitarApi(`/usuarios/${id}`);

  if (resposta.status === 401) {
    return null;
  }

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os dados do usuário.");
  }

  return resposta.json();
}

export type UsuarioAtualizacaoRequest = Omit<UsuarioRequest, "senha"> & {
  senha?: string;
  senhaAtual?: string;
};

export async function atualizarPerfil(id: number, dados: UsuarioAtualizacaoRequest): Promise<UsuarioResponse> {
  const resposta = await requisitarApi(`/usuarios/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  await validarRespostaApi(resposta);
  return resposta.json();
}

export async function excluirConta(id: number): Promise<void> {
  const resposta = await requisitarApi(`/usuarios/${id}`, { method: "DELETE" });
  await validarRespostaApi(resposta);
}
