# Contrato do projeto — Caixu

**Fase:** 7  
**Data inicial:** 2026-10-28
**Atualização de integração:** 2026-11-05
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
| `categoriaId` | `Long` | Opcional; categoria do mesmo proprietário e tipo |
| `usuarioId` | `Long` | Obrigatório |

Os nomes Java serão idiomáticos. O mapeamento para as colunas Oracle será explícito com `@Column` e `@JoinColumn`.

## 3. Relacionamentos

- um usuário possui categorias;
- um usuário possui transações;
- uma categoria pertence a um usuário;
- uma transação pertence a um usuário;
- uma transação pode pertencer a uma categoria; removê-la preserva as transações;
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
GET     /api/categorias
GET     /api/categorias/{id}
POST    /api/categorias
PUT     /api/categorias/{id}
DELETE  /api/categorias/{id}
```

### Transações

```text
GET     /api/transacoes
GET     /api/transacoes/{id}
POST    /api/transacoes
PUT     /api/transacoes/{id}
DELETE  /api/transacoes/{id}
```

### Autenticação e resumo

```text
POST    /api/auth/login
GET     /api/dashboard
```

O login verifica hash PBKDF2 e cria sessão HttpOnly. Os controllers obtêm o proprietário exclusivamente da sessão. Escritas exigem token CSRF. O frontend envia cookies com `credentials: include`.

## 6. Exemplos de payloads

### Login

```json
{
  "email": "usuario@exemplo.com",
  "senha": "sua-senha"
}
```

### Categoria

```json
{
  "nomeCategoria": "Alimentacao",
  "tipoCategoria": "DESPESA"
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
  "categoriaId": 2
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
| Login inválido ou sessão ausente | `401 Unauthorized` |
| Outro proprietário ou CSRF inválido | `403 Forbidden` |
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


## 9. Integração final e sequências

Permanecem somente três entidades JPA. Parcelas e recorrências são representadas por múltiplas transações, com os campos `modalidade`, `grupoId`, `numeroOcorrencia`, `totalOcorrencias`, `frequencia` e `criadoEm` persistidos em `TRANSACAO`.

- `POST /api/transacoes/lote` recebe `{ modalidade, frequencia, transacoes: [...] }`, limitado a 120 itens. O backend valida tipo, categoria, datas e frequência, gera o grupo e os números das ocorrências e salva todo o lote em uma transação de banco.
- `DELETE /api/transacoes/{id}` remove somente a ocorrência; `?escopo=ESTA_E_PROXIMAS` remove a selecionada e as posteriores pelo número de ocorrência no mesmo grupo e proprietário.
- PUT modifica os dados financeiros somente da ocorrência escolhida e preserva a identificação da sequência.
- A frequência de parcelas é mensal; recorrências podem ser semanais ou mensais. O dia original é preservado depois de meses curtos.
- `GET /api/auth/csrf`, `GET /api/auth/me` e `POST /api/auth/logout` complementam o login.
- PUT de usuário preserva a senha quando o campo `senha` é omitido. Alteração de e-mail ou senha exige `senhaAtual`.
- DELETE de usuário remove suas dependências de forma atômica e invalida a sessão depois do sucesso.
- Dashboard e calendário consomem as transações reais; não utilizam fallback de demonstração.

A criação inicial está em `sql/01_schema.sql`. A atualização aditiva está em `sql/02_transacoes_sequencias.sql`, com cópia executável pelo Spring em `backend/src/main/resources/db/02_transacoes_sequencias.sql`. Não executar scripts de criação sobre tabelas existentes.
