export async function validarRespostaApi(resposta: Response): Promise<void> {
  if (resposta.ok) return;
  if (resposta.status === 401) {
    window.location.replace("/login");
    throw new Error("Sua sessão expirou. Entre novamente.");
  }
  if (resposta.status === 403) {
    throw new Error("A operação não foi autorizada. Atualize a página e tente novamente.");
  }
  if (resposta.status === 404) {
    throw new Error("O registro não foi encontrado. Atualize a página.");
  }
  if (resposta.status === 409) {
    throw new Error("Não foi possível salvar. Verifique se o e-mail já existe ou se os dados estão em conflito.");
  }
  if (resposta.status === 400) {
    const dados: unknown = await resposta.json().catch(() => null);
    if (dados && typeof dados === "object" && "message" in dados && typeof dados.message === "string") {
      throw new Error(dados.message);
    }
    throw new Error("Confira os dados informados e tente novamente.");
  }
  throw new Error("Não foi possível concluir a operação. Tente novamente.");
}
