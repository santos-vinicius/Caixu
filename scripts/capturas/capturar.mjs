// Gera prints e o vídeo do fluxo de nova transação para o README.
// Uso (com backend e frontend rodando):
//   cd scripts/capturas && npm install && npx playwright install chromium && npm run capturar
//
// Cria (ou reutiliza) uma conta de demonstração com dados fictícios.
// Nenhum dado real é usado.

import { chromium } from "playwright";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.CAIXU_URL ?? "http://localhost:3000";
const API = process.env.CAIXU_API ?? "http://localhost:8080/api";
const OUT = path.resolve(DIR, "../../docs/screenshots");
const VIDEO_DIR = path.resolve(DIR, "video");
const CONTA_ARQ = path.resolve(DIR, ".conta-demo.json");

mkdirSync(OUT, { recursive: true });
mkdirSync(VIDEO_DIR, { recursive: true });

// Conta de demonstração (gerada na primeira execução, guardada localmente e fora do Git)
let conta;
if (existsSync(CONTA_ARQ)) {
  conta = JSON.parse(readFileSync(CONTA_ARQ, "utf8"));
} else {
  conta = {
    nome: "Marina Costa",
    email: `demo.${randomBytes(3).toString("hex")}@caixu.dev`,
    senha: randomBytes(12).toString("base64url"),
    saldoInicial: 3200,
  };
  writeFileSync(CONTA_ARQ, JSON.stringify(conta, null, 2));
}

const ESCONDER_DEV = `
  nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }
`;

function iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}
function noMes(offsetMes, dia) {
  const hoje = new Date();
  const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + offsetMes + 1, 0).getDate();
  return iso(new Date(hoje.getFullYear(), hoje.getMonth() + offsetMes, Math.min(dia, ultimo)));
}

async function novoContexto(browser, opcoes = {}) {
  const ctx = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    colorScheme: "light",
    ...opcoes,
  });
  await ctx.addInitScript((css) => {
    const aplicar = () => {
      const s = document.createElement("style");
      s.textContent = css;
      document.documentElement.appendChild(s);
    };
    if (document.documentElement) aplicar();
    else document.addEventListener("DOMContentLoaded", aplicar);
  }, ESCONDER_DEV);
  return ctx;
}

// Chamadas à API feitas de dentro da página, do mesmo jeito que o app faz (cookie + CSRF)
async function api(page, metodo, caminho, corpo) {
  return page.evaluate(
    async ({ API, metodo, caminho, corpo }) => {
      const headers = { "Content-Type": "application/json" };
      if (metodo !== "GET") {
        const r = await fetch(`${API}/auth/csrf`, { credentials: "include" });
        headers["X-CSRF-TOKEN"] = (await r.json()).token;
      }
      const r = await fetch(`${API}${caminho}`, {
        method: metodo,
        credentials: "include",
        headers,
        body: corpo ? JSON.stringify(corpo) : undefined,
      });
      const texto = await r.text();
      let dados = null;
      try { dados = JSON.parse(texto); } catch {}
      return { status: r.status, dados };
    },
    { API, metodo, caminho, corpo },
  );
}

async function entrar(page) {
  await page.goto(`${BASE}/login`);
  await page.fill("#email", conta.email);
  await page.fill("#senha", conta.senha);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 20000 });
  await page.waitForLoadState("networkidle");
}

async function prepararDados(page) {
  await page.goto(BASE);
  const cad = await api(page, "POST", "/usuarios", conta);
  if (![200, 201, 409].includes(cad.status)) {
    throw new Error(`Falha ao criar conta demo (HTTP ${cad.status})`);
  }
  await entrar(page);

  const existentes = await api(page, "GET", "/transacoes");
  // Remove o lançamento criado pelo vídeo em execuções anteriores
  for (const t of existentes.dados ?? []) {
    if (t.descricao === "Revisão do carro") {
      await api(page, "DELETE", `/transacoes/${t.id}?escopo=SOMENTE_ESTA`);
    }
  }
  if ((existentes.dados ?? []).some((t) => t.descricao === "Salário")) return;

  const nomes = [
    ["Salário", "RECEITA"], ["Freelance", "RECEITA"],
    ["Moradia", "DESPESA"], ["Alimentação", "DESPESA"], ["Transporte", "DESPESA"],
    ["Assinaturas", "DESPESA"], ["Compras", "DESPESA"], ["Lazer", "DESPESA"], ["Saúde", "DESPESA"],
  ];
  const cat = {};
  const atuais = await api(page, "GET", "/categorias");
  for (const c of atuais.dados ?? []) cat[c.nomeCategoria] = c.id;
  for (const [nome, tipo] of nomes) {
    if (cat[nome]) continue;
    const r = await api(page, "POST", "/categorias", { nomeCategoria: nome, tipoCategoria: tipo });
    cat[nome] = r.dados.id;
  }

  const t = (descricao, valor, data, tipo, categoria) => ({
    descricao, valor, dataTransacao: data, tipoMovimento: tipo,
    categoriaId: cat[categoria] ?? null, metodoPagamento: null, status: null,
  });
  const lote = (modalidade, frequencia, transacoes) =>
    api(page, "POST", "/transacoes/lote", { modalidade, frequencia, transacoes });
  const mensal = (n, desc, valor, dia, tipo, categoria, inicio = 0) =>
    lote("RECORRENTE", "MENSAL",
      Array.from({ length: n }, (_, i) => t(desc, valor, noMes(inicio + i, dia), tipo, categoria)));

  await mensal(6, "Salário", 5400, 5, "RECEITA", "Salário", -1);
  await mensal(6, "Aluguel", 1650, 10, "DESPESA", "Moradia", -1);
  await mensal(6, "Internet", 99.9, 12, "DESPESA", "Moradia", -1);
  await mensal(6, "Academia", 109.9, 8, "DESPESA", "Saúde", -1);
  await mensal(6, "Streaming", 39.9, 15, "DESPESA", "Assinaturas", -1);
  await lote("PARCELADA", "MENSAL",
    Array.from({ length: 6 }, (_, i) => t("Celular novo", 349.83, noMes(i - 1, 20), "DESPESA", "Compras")));

  const unicas = [
    t("Mercado do mês", 486.35, noMes(-1, 3), "DESPESA", "Alimentação"),
    t("Feira", 92.4, noMes(-1, 18), "DESPESA", "Alimentação"),
    t("Combustível", 210, noMes(-1, 22), "DESPESA", "Transporte"),
    t("Mercado do mês", 452.1, noMes(0, 3), "DESPESA", "Alimentação"),
    t("Conta de luz", 187.42, noMes(0, 14), "DESPESA", "Moradia"),
    t("Uber", 38.5, noMes(0, 11), "DESPESA", "Transporte"),
    t("Freelance — identidade visual", 1800, noMes(0, 18), "RECEITA", "Freelance"),
    t("Feira", 104.8, noMes(0, 17), "DESPESA", "Alimentação"),
    t("Combustível", 230, noMes(0, 23), "DESPESA", "Transporte"),
    t("Cinema", 64, noMes(0, 26), "DESPESA", "Lazer"),
    t("Restaurante", 148.6, noMes(0, 7), "DESPESA", "Lazer"),
    t("Farmácia", 72.35, noMes(0, 9), "DESPESA", "Saúde"),
    t("Mercado do mês", 470, noMes(1, 3), "DESPESA", "Alimentação"),
    t("IPVA", 980, noMes(1, 16), "DESPESA", "Transporte"),
    t("Viagem de fim de ano", 1250, noMes(1, 27), "DESPESA", "Lazer"),
  ];
  for (const u of unicas) await lote("UNICA", null, [u]);
}

async function abrirNovaTransacao(page) {
  await page.getByRole("button", { name: "+ Nova transação" }).first().click();
  await page.waitForSelector("dialog[open]");
  await page.waitForTimeout(400);
}

async function main() {
  const browser = await chromium.launch({
    args: ["--lang=pt-BR"],
    env: { ...process.env, LANG: "pt_BR.UTF-8" },
  });

  // Desktop
  const desk = await novoContexto(browser, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await desk.newPage();
  await prepararDados(page);

  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/01-dashboard.png` });
  await page.screenshot({ path: `${OUT}/01-dashboard-completo.png`, fullPage: true });
  console.log("✓ dashboard");

  await page.goto(`${BASE}/calendario`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/02-calendario.png` });
  console.log("✓ calendário");

  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState("networkidle");
  await abrirNovaTransacao(page);
  await page.fill("#transacao-descricao", "Notebook para estudos");
  await page.selectOption("#transacao-categoria", { label: "Compras" });
  await page.selectOption("#modalidade", "PARCELADA");
  await page.fill("#planejamento-valor", "4200,00");
  await page.fill("#primeira-data", noMes(0, 25));
  await page.fill("#quantidade", "10");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/03-lancamento-parcelado.png` });
  console.log("✓ lançamento parcelado");
  const estado = await desk.storageState();
  await desk.close();

  // Mobile
  const mob = await novoContexto(browser, {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    storageState: estado,
  });
  const mp = await mob.newPage();
  for (const [rota, nome] of [["dashboard", "04-mobile-dashboard"], ["calendario", "05-mobile-calendario"]]) {
    await mp.goto(`${BASE}/${rota}`);
    await mp.waitForLoadState("networkidle");
    await mp.waitForTimeout(1200);
    await mp.screenshot({ path: `${OUT}/${nome}.png` });
  }
  console.log("✓ mobile");
  await mob.close();

  // Vídeo do fluxo: nova despesa e saldo atualizado
  const vid = await novoContexto(browser, {
    viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, storageState: estado,
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 800 } },
  });
  const vp = await vid.newPage();
  await vp.goto(`${BASE}/dashboard`);
  await vp.waitForLoadState("networkidle");
  await vp.waitForTimeout(2000);
  await abrirNovaTransacao(vp);
  await vp.locator("#transacao-descricao").pressSequentially("Revisão do carro", { delay: 70 });
  await vp.waitForTimeout(300);
  await vp.selectOption("#transacao-categoria", { label: "Transporte" });
  await vp.waitForTimeout(400);
  await vp.locator("#planejamento-valor").pressSequentially("850,00", { delay: 90 });
  await vp.fill("#primeira-data", iso(new Date()));
  await vp.waitForTimeout(900);
  await vp.locator('dialog[open] button[type="submit"]').click();
  await vp.waitForTimeout(3500);
  const caminhoVideo = await vp.video().path();
  await vid.close();
  console.log("✓ vídeo:", caminhoVideo);

  await browser.close();
  console.log(`\nPronto. Imagens em ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
