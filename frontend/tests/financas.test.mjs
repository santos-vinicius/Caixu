import test from "node:test";
import assert from "node:assert/strict";
import { gerarPlanejamento } from "../app/lib/planejamento.ts";
import { gerarCalendario } from "../app/lib/calendario.ts";
import { selecionarParaExclusao } from "../app/lib/exclusao-transacoes.ts";
import { selecionarMarcos } from "../app/lib/marcos-financeiros.ts";

test("parcelas preservam o total e o dia original após fevereiro", () => {
  const itens=gerarPlanejamento({modalidade:"PARCELADA",frequencia:"MENSAL",valor:"100,00",primeiraData:"2028-01-31",quantidade:3});
  assert.deepEqual(itens.map(i=>i.data),["2028-01-31","2028-02-29","2028-03-31"]);
  assert.equal(itens.reduce((s,i)=>s+Math.round(i.valor*100),0),10000);
});
test("recorrência semanal repete o valor, sem dividir", () => {
  const itens=gerarPlanejamento({modalidade:"RECORRENTE",frequencia:"SEMANAL",valor:"50,25",primeiraData:"2026-12-30",quantidade:2});
  assert.deepEqual(itens.map(i=>i.data),["2026-12-30","2027-01-06"]);
  assert.ok(itens.every(i=>i.valor===50.25));
});
test("rejeita data inválida e parcelas inferiores a um centavo", () => {
  const p={modalidade:"PARCELADA",frequencia:"MENSAL",valor:"0,01",primeiraData:"2026-11-01",quantidade:2};
  assert.deepEqual(gerarPlanejamento(p),[]);
  assert.deepEqual(gerarPlanejamento({...p,valor:"10,00",primeiraData:"2026-02-30"}),[]);
});
test("calendário inclui saldo anterior e valores negativos em centavos", () => {
  const transacoes=[
    {id:1,valor:0.10,tipoMovimento:"RECEITA",dataTransacao:"2026-10-31"},
    {id:2,valor:0.20,tipoMovimento:"RECEITA",dataTransacao:"2026-11-01"},
    {id:3,valor:1001,tipoMovimento:"DESPESA",dataTransacao:"2026-11-02"},
  ];
  const dias=gerarCalendario({ano:2026,mes:11,saldoInicial:1000,transacoes,dataReferencia:"2026-11-01"});
  assert.equal(dias[0].saldoAcumulado,1000.30);
  assert.equal(dias[1].saldoAcumulado,-0.70);
  assert.equal(dias[0].futuro,false);assert.equal(dias[1].futuro,true);
});
test("exclusão das próximas preserva grupos e ocorrências anteriores", () => {
  const itens=[{id:1,grupoId:"a",modalidade:"PARCELADA",numeroOcorrencia:1},{id:2,grupoId:"a",modalidade:"PARCELADA",numeroOcorrencia:2},{id:3,grupoId:"a",modalidade:"PARCELADA",numeroOcorrencia:3},{id:4,grupoId:"b",modalidade:"PARCELADA",numeroOcorrencia:3}];
  assert.deepEqual(selecionarParaExclusao(itens,2,"ESTA_E_PROXIMAS").map(i=>i.id),[2,3]);
  assert.deepEqual(selecionarParaExclusao(itens,2,"SOMENTE_ESTA").map(i=>i.id),[2]);
});
test("marcos limitam o ruído e priorizam a primeira queda negativa", () => {
  const dias=gerarCalendario({ano:2026,mes:11,saldoInicial:100, dataReferencia:"2026-11-01",transacoes:[
    {id:1,valor:101,tipoMovimento:"DESPESA",dataTransacao:"2026-11-02"},
    ...[3,4,5,6].map((d)=>({id:d,valor:1000,tipoMovimento:"RECEITA",dataTransacao:`2026-11-0${d}`}))]});
  const marcos=selecionarMarcos(dias,"2026-11-01");
  assert.equal(marcos.length,3);assert.equal(marcos[0].data,"2026-11-02");
});
