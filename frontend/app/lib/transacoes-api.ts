import { requisitarApi } from "./api";
import { validarRespostaApi } from "./resposta-api";
import type { EscopoExclusao } from "./exclusao-transacoes";
import type { NovaTransacao, Transacao } from "./transacoes";

type TransacaoResponse = Omit<Transacao, "descricao" | "categoriaId" | "grupoId" | "numeroOcorrencia" | "totalOcorrencias" | "frequencia"> & {
  descricao: string | null;
  categoriaId: number | null;
  grupoId: string | null;
  numeroOcorrencia: number | null;
  totalOcorrencias: number | null;
  frequencia: "MENSAL" | "SEMANAL" | null;
};
function normalizar(dados: TransacaoResponse): Transacao {
  return {
    ...dados,
    descricao: dados.descricao?.trim() || (dados.tipoMovimento === "RECEITA" ? "Recebimento" : "Gasto"),
    categoriaId: dados.categoriaId ?? undefined,
    grupoId: dados.grupoId ?? undefined,
    numeroOcorrencia: dados.numeroOcorrencia ?? undefined,
    totalOcorrencias: dados.totalOcorrencias ?? undefined,
    frequencia: dados.frequencia ?? undefined,
  };
}
function payload(dados: NovaTransacao) {
  return {
    descricao: dados.descricao, valor: dados.valor,
    dataTransacao: dados.dataTransacao, tipoMovimento: dados.tipoMovimento,
    categoriaId: dados.categoriaId ?? null,
    metodoPagamento: dados.metodoPagamento ?? null, status: dados.status ?? null,
  };
}
export async function listarTransacoes(): Promise<Transacao[]> {
  const resposta = await requisitarApi("/transacoes");
  await validarRespostaApi(resposta);
  const dados: TransacaoResponse[] = await resposta.json();
  return dados.map(normalizar);
}
export async function criarTransacoes(novas: NovaTransacao[]): Promise<Transacao[]> {
  if (novas.length === 0) throw new Error("Adicione pelo menos um lançamento.");
  const modalidade = novas[0].modalidade ?? "UNICA";
  const resposta = await requisitarApi("/transacoes/lote", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modalidade,
      frequencia: modalidade === "UNICA" ? null : novas[0].frequencia ?? "MENSAL",
      transacoes: novas.map(payload),
    }),
  });
  await validarRespostaApi(resposta);
  const dados: TransacaoResponse[] = await resposta.json();
  return dados.map(normalizar);
}
export async function atualizarTransacao(id: number, dados: NovaTransacao): Promise<Transacao> {
  const resposta = await requisitarApi(`/transacoes/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload(dados)),
  });
  await validarRespostaApi(resposta);
  return normalizar(await resposta.json());
}
export async function removerTransacao(id: number, escopo: EscopoExclusao): Promise<void> {
  const resposta = await requisitarApi(`/transacoes/${id}?escopo=${escopo}`, { method: "DELETE" });
  await validarRespostaApi(resposta);
}
