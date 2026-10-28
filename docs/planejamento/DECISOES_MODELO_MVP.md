# Fechamento do modelo de dados do MVP

**Data:** 2026-10-28  
**Status:** aprovado para a implementação da Fase 7

Este documento resolve as seis divergências identificadas entre o histórico da Fase 6, a documentação mais recente do DinDin e o modelo necessário para a entrega final. A Fase 6 permanece somente como histórico.

## Decisões

### 1. Saldo inicial

O saldo inicial será um atributo de `USUARIO`, pois é informado manualmente e não representa uma conta bancária.

```text
USUARIO.saldo_inicial NUMBER(15,2) NOT NULL DEFAULT 0
```

O saldo atual não será armazenado. Será calculado por:

```text
saldo atual = saldo inicial + receitas realizadas - despesas realizadas
```

### 2. Meta financeira

`META_FINANCEIRA.USUARIO_id_usuario` será obrigatório (`NOT NULL`). Não haverá meta sem proprietário.

### 3. Recorrência

`RECORRENCIA.Attribute_5` é um atributo residual sem significado funcional documentado. Ele será removido do modelo executável.

Nesta fase, `RECORRENCIA` ficará com `id_recorrencia`, `periodicidade`, `data_fim` e `TRANSACAO_id_transacao`. O status da recorrência não será inventado.

### 4. Regras de transação

O banco e o backend deverão validar:

- `valor > 0`;
- `tipo_movimento IN ('RECEITA', 'DESPESA')`;
- `data_transacao` obrigatório;
- usuário e categoria obrigatórios.

O valor permanece positivo; o tipo determina se ele soma ou subtrai do saldo.

### 5. Categoria

Como o usuário cria e administra suas próprias categorias, `CATEGORIA` terá vínculo obrigatório com `USUARIO`:

```text
CATEGORIA.USUARIO_id_usuario NOT NULL
```

Uma transação só poderá utilizar uma categoria pertencente ao mesmo usuário. Essa regra será garantida nas consultas e na camada Service.

### 6. Nomes Oracle e Java

Os nomes físicos do Oracle permanecerão em `snake_case` minúsculo, por exemplo `id_usuario`, `saldo_inicial` e `USUARIO_id_usuario`.

No Java serão usados nomes idiomáticos, como `id`, `saldoInicial` e `usuarioId`, com `@Column` e `@JoinColumn` para realizar o mapeamento explícito. Não será feita uma renomeação do histórico acadêmico.

## Modelo aprovado para a Fase 7

```text
USUARIO
 ├── CATEGORIA
 ├── TRANSACAO
 └── META_FINANCEIRA

CATEGORIA
 └── TRANSACAO

TRANSACAO
 └── RECORRENCIA (opcional)
```

O primeiro incremento de código será limitado a `Usuario`, `Categoria` e `Transacao`. `MetaFinanceira` e `Recorrencia` ficam definidas para evolução posterior.

## Limites preservados

- `CONTA_BANCARIA` e `INVESTIMENTO` não fazem parte da Fase 7.
- Não haverá integração automática com bancos.
- O SQL executável da Fase 7 será criado posteriormente a partir deste documento.
- Nenhum arquivo da Fase 6 ou do projeto histórico será alterado.

