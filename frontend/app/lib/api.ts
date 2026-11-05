function obterApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("O endereço da API não foi configurado.");
  }

  return apiUrl.replace(/\/$/, "");
}

async function enviar(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<Response> {
  const apiUrl = obterApiUrl();

  try {
    return await fetch(`${apiUrl}${caminho}`, {
      ...opcoes,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }
}

async function obterTokenCsrf(): Promise<string> {
  const resposta = await enviar("/auth/csrf");

  if (!resposta.ok) {
    throw new Error("Não foi possível preparar a requisição. Tente novamente.");
  }

  const dados: unknown = await resposta.json();

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("token" in dados) ||
    typeof dados.token !== "string" ||
    dados.token.length === 0
  ) {
    throw new Error("O servidor retornou um token de proteção inválido.");
  }

  return dados.token;
}

export async function requisitarApi(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<Response> {
  const metodo = (opcoes.method ?? "GET").toUpperCase();
  const headers = new Headers(opcoes.headers);

  const exigeCsrf = !["GET", "HEAD", "OPTIONS"].includes(metodo);

  if (exigeCsrf) {
    const token = await obterTokenCsrf();
    headers.set("X-CSRF-TOKEN", token);
  }

  return enviar(caminho, {
    ...opcoes,
    method: metodo,
    headers,
  });
}
