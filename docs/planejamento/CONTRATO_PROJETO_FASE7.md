# Contrato do projeto — Caixu

**Fase:** 7  
**Data:** 2026-10-28  
**Status:** aprovado para orientar a implementação incremental

Este documento define o acordo técnico inicial entre o banco Oracle, o backend Spring Boot e o frontend React do Caixu.

## 1. Escopo inicial

As três entidades da primeira entrega serão:

- `Usuario`;
- `Categoria`;
- `Transacao`.

Não fazem parte deste incremento:

- conta bancária;
- investimento;
- integração automática com bancos;
- anexo de comprovante;
- `MetaFinanceira` e `Recorrencia`.

## 2. Entidades

### Usuario

| Campo Java | Tipo | Regra |
|---|---|---|
| `id` | `Long` | Gerado pelo Oracle |
| `nome` | `String` | Obrigatório |
| `email` | `String` | Obrigatório e único |
| `senha` | `String` | Obrigatória; não deve ser retornada nas respostas |
| `saldoInicial` | `BigDecimal` | Obrigatório; padrão `0.00` |

### Categoria

| Campo Java | Tipo | Regra |
|---|---|---|
| `id` | `Long` | Gerado pelo Oracle |
| `nomeCategoria` | `String` | Obrigatório |
| `tipoCategoria` | `String` | `RECEITA` ou `DESPESA` |
| `usuarioId` | `Long` | Obrigatório; proprietário da categoria |

### Transacao

| Campo Java | Tipo | Regra |
|---|---|---|
| `id` | `Long` | Gerado pelo Oracle |
| `valor` | `BigDecimal` | Maior que zero |
| `dataTransacao` | `LocalDate` | Obrigatória |
| `tipoMovimento` | `String` | `RECEITA` ou `DESPESA` |
| `metodoPagamento` | `String` | Opcional |
| `status` | `String` | Opcional nesta etapa |
| `descricao` | `String` | Opcional |
| `categoriaId` | `Long` | Obrigatório |
| `usuarioId` | `Long` | Obrigatório |

Os nomes Java serão idiomáticos. O mapeamento para as colunas Oracle será explícito com `@Column` e `@JoinColumn`.

## 3. Relacionamentos

- um usuário possui categorias;
- um usuário possui transações;
- uma categoria pertence a um usuário;
- uma transação pertence a um usuário;
- uma transação pertence a uma categoria;
- a categoria da transação deve pertencer ao mesmo usuário da transação.

## 4. Regra de saldo

O banco armazenará somente `saldo_inicial` em `USUARIO`.

O saldo atual será calculado:

```text
saldo atual = saldo inicial + receitas realizadas - despesas realizadas
```

Para o primeiro MVP, será considerada realizada toda transação com `data_transacao` menor ou igual à data atual. Transações futuras não entram no saldo atual.

O saldo projetado será calculado:

```text
saldo projetado = saldo atual + receitas futuras - despesas futuras
```

Não haverá coluna `saldo_atual`, evitando duplicação e inconsistência entre o usuário e suas transações.

## 5. Endpoints REST

### Usuários

```text
GET     /api/usuarios
GET     /api/usuarios/{id}
POST    /api/usuarios
PUT     /api/usuarios/{id}
DELETE  /api/usuarios/{id}
```

### Categorias

```text
GET     /api/categorias?usuarioId={id}
GET     /api/categorias/{id}?usuarioId={id}
POST    /api/categorias
PUT     /api/categorias/{id}
DELETE  /api/categorias/{id}?usuarioId={id}
```

### Transações

```text
GET     /api/transacoes?usuarioId={id}
GET     /api/transacoes/{id}?usuarioId={id}
POST    /api/transacoes
PUT     /api/transacoes/{id}
DELETE  /api/transacoes/{id}?usuarioId={id}
```

### Autenticação e resumo

```text
POST    /api/auth/login
GET     /api/dashboard?usuarioId={id}
```

O login inicial será simples, para fins acadêmicos. O frontend receberá o identificador do usuário autenticado e o utilizará nas consultas do MVP. Essa solução não representa uma autenticação de produção.

## 6. Exemplos de payloads

### Login

```json
{
  "email": "teste.caixu@fiap.local",
  "senha": "HASH_TESTE"
}
```

### Categoria

```json
{
  "nomeCategoria": "Alimentacao",
  "tipoCategoria": "DESPESA",
  "usuarioId": 1
}
```

### Transação

```json
{
  "valor": 180.50,
  "dataTransacao": "2026-10-20",
  "tipoMovimento": "DESPESA",
  "metodoPagamento": "CARTAO",
  "status": "REALIZADA",
  "descricao": "Compras de supermercado",
  "categoriaId": 2,
  "usuarioId": 1
}
```

Datas serão transportadas no formato ISO `YYYY-MM-DD`. Valores monetários serão representados com duas casas decimais e mapeados para `BigDecimal`.

## 7. Status HTTP

| Situação | Status |
|---|---|
| Consulta realizada | `200 OK` |
| Cadastro realizado | `201 Created` |
| Atualização realizada | `200 OK` |
| Exclusão realizada | `204 No Content` |
| Dados inválidos | `400 Bad Request` |
| Login inválido | `401 Unauthorized` |
| Registro não encontrado | `404 Not Found` |
| E-mail já cadastrado | `409 Conflict` |

## 8. Estrutura planejada do backend

```text
backend/
└── src/main/java/br/com/caixu/
    ├── controller/
    ├── dto/
    ├── entity/
    ├── exception/
    ├── repository/
    └── service/
```

Este contrato será a referência para a próxima etapa. Qualquer mudança em campos, regras ou endpoints deverá ser registrada antes da implementação correspondente.
