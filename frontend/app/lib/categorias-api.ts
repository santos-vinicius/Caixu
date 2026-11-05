import { requisitarApi } from "./api";

export type Categoria = {
  id: number;
  nomeCategoria: string;
  tipoCategoria: "RECEITA" | "DESPESA";
  usuarioId: number;
};

type CategoriaRequest = Pick<Categoria, "nomeCategoria" | "tipoCategoria">;

async function validarResposta(resposta: Response): Promise<void> {
  if (resposta.ok) {
    return;
  }

  if (resposta.status === 401) {
    window.location.replace("/login");
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  if (resposta.status === 403) {
    throw new Error(
      "A operação não foi autorizada. Atualize a página e tente novamente.",
    );
  }

  if (resposta.status === 404) {
    throw new Error("Essa categoria não foi encontrada. Atualize a página.");
  }

  if (resposta.status === 400) {
    throw new Error("Confira o nome e o tipo da categoria.");
  }

  if (resposta.status === 409) {
    throw new Error(
      "Não foi possível concluir a operação por um conflito nos dados.",
    );
  }

  throw new Error("Não foi possível concluir a operação. Tente novamente.");
}

export async function listarCategorias(): Promise<Categoria[]> {
  const resposta = await requisitarApi("/categorias");
  await validarResposta(resposta);
  return resposta.json();
}

export async function criarCategoria(
  dados: CategoriaRequest,
): Promise<Categoria> {
  const resposta = await requisitarApi("/categorias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  await validarResposta(resposta);
  return resposta.json();
}

export async function atualizarCategoria(
  id: number,
  dados: CategoriaRequest,
): Promise<Categoria> {
  const resposta = await requisitarApi(`/categorias/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  await validarResposta(resposta);
  return resposta.json();
}

export async function removerCategoria(id: number): Promise<void> {
  const resposta = await requisitarApi(`/categorias/${id}`, {
    method: "DELETE",
  });

  await validarResposta(resposta);
}
