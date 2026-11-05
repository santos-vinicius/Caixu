#!/usr/bin/env python3
"""Validação HTTP contra Spring Boot + Oracle FIAP. Cria e remove somente contas temporárias próprias."""
import argparse
from datetime import date, timedelta
from decimal import Decimal
from http.cookiejar import CookieJar
import json
from urllib.error import HTTPError
from urllib.request import Request, build_opener, HTTPCookieProcessor
from uuid import uuid4


class Cliente:
    def __init__(self, base):
        self.base = base.rstrip('/')
        self.http = build_opener(HTTPCookieProcessor(CookieJar()))
        self.usuario = None
        self.email = f'verificacao.{uuid4().hex}@caixu.local'
        self.senha = 'ValidacaoCaixu123!'

    def pedir(self, metodo, caminho, dados=None, esperado=200, csrf=True):
        headers = {'Content-Type': 'application/json'}
        if metodo not in ('GET', 'HEAD', 'OPTIONS') and csrf:
            _, token = self.pedir('GET', '/auth/csrf')
            headers['X-CSRF-TOKEN'] = token['token']
        request = Request(self.base+caminho, data=json.dumps(dados).encode() if dados is not None else None,
                          method=metodo, headers=headers)
        try:
            response = self.http.open(request, timeout=30)
        except HTTPError as error:
            response = error
        body = response.read().decode()
        parsed = json.loads(body) if body else None
        assert response.status == esperado, f'{metodo} {caminho}: esperado {esperado}, recebido {response.status}: {body[:500]}'
        return response.status, parsed

    def registrar(self):
        _, self.usuario = self.pedir('POST', '/usuarios', {
            'nome': 'Conta temporária de validação', 'email': self.email,
            'senha': self.senha, 'saldoInicial': 1000}, esperado=201)
        assert 'senha' not in self.usuario
        self.entrar()

    def entrar(self):
        return self.pedir('POST', '/auth/login', {'email': self.email, 'senha': self.senha})

    def limpar(self):
        if self.usuario is not None:
            self.entrar()
            self.pedir('DELETE', f'/usuarios/{self.usuario["id"]}', esperado=204)
            self.usuario = None


def validar(base):
    a, b = Cliente(base), Cliente(base)
    verificacoes = []

    def ok(nome):
        verificacoes.append(nome)
        print('OK — '+nome, flush=True)

    try:
        a.pedir('GET', '/transacoes', esperado=401)
        a.pedir('POST', '/usuarios', {}, esperado=403, csrf=False)
        ok('Autenticação obrigatória e proteção CSRF')
        a.registrar(); b.registrar()
        a.pedir('POST', '/auth/login', {'email': a.email, 'senha': 'incorreta'}, esperado=401)
        a.pedir('GET', '/auth/me')
        _, usuarios = a.pedir('GET', '/usuarios')
        assert len(usuarios) == 1 and usuarios[0]['id'] == a.usuario['id']
        a.pedir('GET', f'/usuarios/{b.usuario["id"]}', esperado=403)
        ok('Cadastro, login, sessão e isolamento de usuários')
        _, categoria = a.pedir('POST', '/categorias', {'nomeCategoria': 'Teste gasto', 'tipoCategoria': 'DESPESA'}, esperado=201)
        _, outra = b.pedir('POST', '/categorias', {'nomeCategoria': 'Outra conta', 'tipoCategoria': 'DESPESA'}, esperado=201)
        a.pedir('GET', f'/categorias/{outra["id"]}', esperado=403)
        a.pedir('PUT', f'/categorias/{categoria["id"]}', {'nomeCategoria': 'Categoria renomeada', 'tipoCategoria': 'DESPESA'})
        _, recarregada = a.pedir('GET', f'/categorias/{categoria["id"]}')
        assert recarregada['nomeCategoria'] == 'Categoria renomeada'
        ok('CRUD e isolamento das categorias')
        hoje = date.today().isoformat()
        futuro = (date.today()+timedelta(days=5)).isoformat()
        receita = {'valor': 300.10, 'dataTransacao': hoje, 'tipoMovimento': 'RECEITA', 'descricao': 'Recebimento real', 'categoriaId': None}
        gasto = {'valor': 1500.25, 'dataTransacao': futuro, 'tipoMovimento': 'DESPESA', 'descricao': 'Gasto futuro real', 'categoriaId': categoria['id']}
        _, entrada = a.pedir('POST', '/transacoes', receita, esperado=201)
        _, saida = a.pedir('POST', '/transacoes', gasto, esperado=201)
        assert entrada['categoriaId'] is None
        _, resumo = a.pedir('GET', '/dashboard')
        assert Decimal(str(resumo['saldoAtual'])) == Decimal('1300.10')
        assert Decimal(str(resumo['saldoProjetado'])) == Decimal('-200.15')
        ok('Transações sem categoria e saldos reais com projeção negativa')
        a.pedir('POST', '/transacoes', {**gasto, 'categoriaId': outra['id']}, esperado=403)
        a.pedir('GET', f'/transacoes/{saida["id"]+99999999}', esperado=404)
        b.pedir('GET', f'/transacoes/{saida["id"]}', esperado=403)
        b.pedir('DELETE', f'/transacoes/{saida["id"]}', esperado=403)
        a.pedir('POST', '/transacoes', {**gasto, 'valor': 0}, esperado=400)
        a.pedir('POST', '/transacoes', {**receita, 'categoriaId': categoria['id']}, esperado=400)
        a.pedir('POST', '/transacoes', {**gasto, 'dataTransacao': '2026-02-30'}, esperado=400)
        ok('Valores, datas, categoria compatível e autorização das transações')
        a.pedir('PUT', f'/transacoes/{entrada["id"]}', {**receita, 'valor': 310.10, 'descricao': 'Recebimento editado'})
        _, atualizado = a.pedir('GET', f'/transacoes/{entrada["id"]}')
        assert atualizado['descricao'] == 'Recebimento editado'
        a.pedir('DELETE', f'/categorias/{categoria["id"]}', esperado=204)
        _, preservada = a.pedir('GET', f'/transacoes/{saida["id"]}')
        assert preservada['categoriaId'] is None and preservada['valor'] == 1500.25
        ok('Edição persistida e exclusão de categoria preserva os lançamentos')
        itens = [{**gasto, 'categoriaId': None, 'valor': valor, 'dataTransacao': data}
                 for valor, data in [(33.34,'2028-01-31'),(33.33,'2028-02-29'),(33.33,'2028-03-31')]]
        lote = {'modalidade': 'PARCELADA', 'frequencia': 'MENSAL', 'transacoes': itens}
        _, parcelas = a.pedir('POST', '/transacoes/lote', lote, esperado=201)
        assert len(parcelas) == 3 and len({p['grupoId'] for p in parcelas}) == 1
        assert sum(Decimal(str(p['valor'])) for p in parcelas) == Decimal('100.00')
        _, recarregadas = a.pedir('GET', '/transacoes')
        assert len([p for p in recarregadas if p['grupoId'] == parcelas[0]['grupoId']]) == 3
        assert all(p['criadoEm'] for p in parcelas)
        ok('Parcelas com grupo persistente, fim de mês e total exato')
        _, antes = a.pedir('GET', '/transacoes')
        a.pedir('POST', '/transacoes/lote', {**lote, 'transacoes': [itens[0], {**itens[1], 'dataTransacao': '2028-02-28'}]}, esperado=400)
        a.pedir('POST', '/transacoes/lote', {**lote, 'transacoes': [itens[0], {**itens[1], 'categoriaId': outra['id']}]}, esperado=400)
        _, depois = a.pedir('GET', '/transacoes')
        assert len(antes) == len(depois)
        ok('Lote inválido não deixa gravações parciais')
        a.pedir('PUT', f'/transacoes/{parcelas[1]["id"]}', {**itens[1], 'valor': 30})
        _, editada = a.pedir('GET', f'/transacoes/{parcelas[1]["id"]}')
        assert editada['grupoId'] == parcelas[0]['grupoId'] and editada['numeroOcorrencia'] == 2
        b.pedir('DELETE', f'/transacoes/{parcelas[1]["id"]}?escopo=ESTA_E_PROXIMAS', esperado=403)
        a.pedir('DELETE', f'/transacoes/{parcelas[1]["id"]}?escopo=ESTA_E_PROXIMAS', esperado=204)
        _, restantes = a.pedir('GET', '/transacoes')
        assert [p['numeroOcorrencia'] for p in restantes if p['grupoId'] == parcelas[0]['grupoId']] == [1]
        ok('Edição de ocorrência e exclusão desta e das próximas')
        recorrentes = [{**receita, 'valor': 20, 'dataTransacao': d} for d in ['2026-12-30','2027-01-06']]
        _, recorrencia = a.pedir('POST', '/transacoes/lote', {'modalidade':'RECORRENTE','frequencia':'SEMANAL','transacoes':recorrentes}, esperado=201)
        a.pedir('DELETE', f'/transacoes/{recorrencia[0]["id"]}', esperado=204)
        a.pedir('GET', f'/transacoes/{recorrencia[1]["id"]}')
        ok('Recorrência semanal e exclusão de somente uma ocorrência')
        perfil = {'nome': 'Perfil atualizado', 'email': a.email, 'saldoInicial': 1500}
        a.pedir('PUT', f'/usuarios/{a.usuario["id"]}', perfil)
        a.pedir('POST', '/auth/logout', esperado=204)
        a.entrar()
        _, dados = a.pedir('GET', f'/usuarios/{a.usuario["id"]}')
        assert dados['nome'] == 'Perfil atualizado' and dados['saldoInicial'] == 1500
        ok('Perfil persistente e atualização sem alterar a senha')
        novo_email = f'alterado.{uuid4().hex}@caixu.local'
        a.pedir('PUT', f'/usuarios/{a.usuario["id"]}', {**perfil,'email':novo_email}, esperado=400)
        a.pedir('PUT', f'/usuarios/{a.usuario["id"]}', {**perfil,'email':novo_email,'senha':'NovaCaixu123!','senhaAtual':a.senha})
        a.email=novo_email; a.senha='NovaCaixu123!'
        a.pedir('POST', '/auth/logout', esperado=204); a.entrar()
        ok('Troca de e-mail e senha exige confirmação e permite novo login')
        a.limpar(); a.pedir('GET', '/auth/me', esperado=401)
        b.limpar()
        ok('Exclusão da conta com dependências e invalidação da sessão')
        print(f'\n{len(verificacoes)} grupos de verificações concluídos. Contas temporárias removidas.')
    finally:
        for cliente in (a,b):
            if cliente.usuario is not None:
                try:
                    cliente.limpar()
                except Exception as error:
                    print('A limpeza da conta temporária falhou: '+str(error))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--api-url', default='http://localhost:8080/api')
    validar(parser.parse_args().api_url)
