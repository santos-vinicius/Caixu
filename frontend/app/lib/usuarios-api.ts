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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("O endereço da API não foi configurado.");
  }

  let resposta: Response;

  try {
    resposta = await fetch(`${apiUrl}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }

  if (!resposta.ok) {
    if (resposta.status === 409) {
      throw new Error(
        "Não foi possível criar a conta. Verifique se o e-mail já está cadastrado.",
      );
    }

    if (resposta.status === 400) {
      throw new Error("Confira os dados informados e tente novamente.");
    }

    throw new Error("Não foi possível criar sua conta. Tente novamente.");
  }

  return resposta.json();
}
