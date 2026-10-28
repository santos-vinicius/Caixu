# Inventário comparativo — Fase 7 do DinDin

**Data do inventário:** 2026-10-28  
**Escopo:** comparação entre a entrega da Fase 6, o projeto atual do DinDin e os requisitos da atividade final.  
**Regra de preservação:** as pastas de referência foram somente lidas. Nenhum arquivo delas foi alterado ou excluído.

## 1. Fontes consultadas

### Fase 6 antiga

`/Users/vinicius/Documents/FIAP/2026/FASE 6 - GPT/ATIVIDADE-2_FASE6/`

- `README.md`
- `pom.xml`
- `sql/01_schema.sql`
- `src/main/java/br/com/fintech/model/`
- `src/main/java/br/com/fintech/dao/`
- `src/main/java/br/com/fintech/infra/`

### DinDin atual

`/Users/vinicius/Documents/FIAP/FINTECH/`

- `docs/produto/arquitetura-mvp.md`
- `docs/produto/decisoes/001-sem-integracao-bancaria.md`
- `dev/database/modelagem/`
- `prod/screenshots/Modelo_Relacional_Fintech_Atualizado.png`
- `dev/scripts/gerar_entrega_fase4.py`
- `DECISOES_MODELO_MVP.md` da própria Fase 7

### Requisitos da atividade

Texto de requisitos fornecido pelo usuário nesta conversa, incluindo backend Spring Boot/JPA, Oracle FIAP, frontend React SPA, três entidades, README, testes ponta a ponta e ZIP sem `node_modules`.

## 2. Estado atual da pasta da Fase 7

No momento do inventário, a pasta contém somente:

- `DECISOES_MODELO_MVP.md`

Ainda não foram encontrados nesta pasta:

- projeto Maven/Spring Boot;
- entidades JPA;
- repositories;
- services;
- controllers REST;
- script SQL executável da Fase 7;
- projeto React;
- `package.json` ou `package-lock.json`;
- README final;
- testes automatizados ou roteiro de teste ponta a ponta.

## 3. Comparação geral

| Item | Fase 6 antiga | Versão atual do DinDin | Situação | Ação recomendada |
|---|---|---|---|---|
| Arquitetura backend | Java 17, Maven e JDBC direto | Spring Boot com JPA, Repository, Service e Controller são exigidos | Divergência de arquitetura | Reaproveitar conceitos e evidências, mas criar backend novo em Spring Boot |
| Acesso ao banco | `ConexaoFactory`, `DriverManager` e DAOs JDBC | Oracle continua obrigatório; implementação final ainda ausente | Reaproveitamento parcial | Usar configuração segura do Oracle como referência e implementar Spring Data JPA |
| Entidades prioritárias | `Usuario`, `Categoria`, `Transacao`, `ContaBancaria`, `Investimento` | `Usuario`, `Categoria`, `Transacao`, `MetaFinanceira` e `Recorrencia` | Modelo do produto foi alterado | Implementar primeiro `Usuario`, `Categoria` e `Transacao` |
| Integração bancária | `ContaBancaria` e referências de conta em transação/investimento | Explicitamente excluída do MVP | Divergência de produto | Não levar `ContaBancaria`, `Investimento` nem `CONTA_ID_CONTA` para o núcleo da Fase 7 |
| Frontend | Não identificado na Fase 6 | ReactJS é obrigatório na atividade | Lacuna | Criar frontend SPA após o contrato do backend |
| Documentação | README da entrega JDBC | README final precisa explicar backend, frontend e login de teste | Incompleto | Criar README na pasta da Fase 7 |
| Testes | Classe `Teste` para inserção/consulta JDBC | Teste ponta a ponta é obrigatório | Insuficiente | Criar roteiro e evidências de teste do fluxo React → API → Oracle |

## 4. Entidades e tabelas

| Entidade/tabela | Fase 6 antiga | DinDin atual/modelagem | Situação | Ação recomendada |
|---|---|---|---|---|
| `USUARIO` | Existe em record Java, DAO e SQL; campos observados: id, nome, email e senha | Continua como cadastro/autenticação; decisão da Fase 7 acrescenta `saldo_inicial` | Compatível com ajuste | Implementar com JPA e confirmar o mapeamento final de `saldo_inicial` |
| `CATEGORIA` | Existe em record Java, DAO e SQL; não possui usuário no record antigo | Deve pertencer obrigatoriamente a um usuário | Divergência de relacionamento | Adicionar vínculo JPA/SQL com `Usuario`; validar propriedade do usuário no Service |
| `TRANSACAO` | Existe em record, DAO e SQL; inclui `contaId` e campos de apoio | Pertence a usuário e categoria; valor positivo; tipo receita/despesa; sem conta bancária | Divergência de campos e regra | Criar entidade sem relacionamento bancário e validar as regras de negócio |
| `META_FINANCEIRA` | Existe na modelagem/SQL antigo, mas não há implementação Java na Fase 6 | Entidade prevista para evolução; usuário obrigatório | Fora do primeiro incremento | Deixar preparada na documentação; implementar somente após as três entidades mínimas |
| `RECORRENCIA` | Existe no SQL antigo | Prevista para evolução; `Attribute_5` foi declarado residual e deve sair do executável | Fora do primeiro incremento | Não implementar agora; não transportar `Attribute_5` |
| `CONTA_BANCARIA` | Possui record, DAO, SQL e uso no teste | Não faz parte do produto atual | Deve ser descartada da versão final | Preservar apenas nas referências históricas |
| `INVESTIMENTO` | Possui record, DAO, SQL e uso no teste | Não faz parte do MVP atual | Deve ser descartada da versão final | Preservar apenas nas referências históricas |

## 5. Relacionamentos atuais

O modelo atual documentado aponta para esta estrutura funcional:

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

Relacionamentos confirmados ou definidos para o primeiro incremento:

- uma `Transacao` pertence a um `Usuario`;
- uma `Transacao` pertence a uma `Categoria`;
- uma `Categoria` pertence a um `Usuario`;
- a categoria usada na transação deve pertencer ao mesmo usuário da transação;
- não existe relacionamento com conta bancária no modelo final do MVP.

## 6. Código reaproveitável e código ausente

### Pode ser reaproveitado como referência

- convenções de nomes e pacotes do projeto Java antigo;
- uso de `BigDecimal` para valores monetários;
- conversão de datas para `LocalDate` observada nos DAOs;
- nomes e relações presentes na modelagem Oracle atual;
- configuração conceitual da conexão Oracle FIAP, sem copiar credenciais;
- dados fictícios do `Teste.java` apenas como inspiração para fixtures.

### Não deve ser copiado para a implementação final

- `ConexaoFactory` baseado em JDBC direto;
- DAOs JDBC como substitutos de `Repository` JPA;
- `ContaBancaria`, `Investimento` e seus DAOs;
- `contaId`/`CONTA_ID_CONTA` em `Transacao`;
- o `sql/01_schema.sql` da Fase 6 como script final;
- a classe `Teste` como substituta dos testes ponta a ponta.

### Ausências identificadas

- projeto Spring Boot;
- dependências JPA, Web e Oracle configuradas;
- entidades com anotações JPA;
- repositories;
- services com regras de negócio;
- controllers com CRUD e status HTTP;
- autenticação/login funcional compatível com o escopo acadêmico;
- SQL executável alinhado ao MVP;
- frontend React com rotas, hooks, props e telas;
- integração frontend/backend;
- documentação final e evidências de teste;
- validação de instalação sem `node_modules`.

## 7. Divergências que precisam ser resolvidas antes do código

1. **`saldo_inicial`:** a decisão da Fase 7 define o atributo em `USUARIO`, mas a modelagem Oracle atual inspecionada ainda lista apenas `id_usuario`, `nome`, `email` e `senha`.
2. **Dono da categoria:** a decisão da Fase 7 exige `CATEGORIA.USUARIO_id_usuario`, mas a modelagem atual inspecionada lista somente id, nome e tipo da categoria.
3. **Nomes físicos:** a decisão da Fase 7 orienta nomes Oracle em `snake_case` minúsculo, enquanto a modelagem histórica usa nomes como `USUARIO`, `CATEGORIA_id_categoria` e `USUARIO_id_usuario`.
4. **SQL antigo:** o script da Fase 6 cria sete tabelas e ainda contém conta bancária e investimento; ele não pode ser usado diretamente como script final.
5. **Recorrência:** a modelagem contém `Attribute_5`, mas a decisão registrada determina que esse atributo residual não deve entrar no modelo executável.
6. **Autenticação:** os documentos definem cadastro/login como necessidade funcional, mas ainda não há contrato técnico fechado para a implementação do login. Isso deve ser definido antes da tela de autenticação.

## 8. Conclusão da Fase 1

O projeto final deve ser construído como uma nova implementação na pasta da Fase 7, usando a Fase 6 e o DinDin atual como referências. O menor escopo coerente com a atividade é:

- `Usuario`;
- `Categoria`;
- `Transacao`;
- Oracle FIAP;
- Spring Boot + JPA;
- React SPA;
- login, página inicial, erro personalizado e telas das três entidades;
- README e teste ponta a ponta.

As entidades bancárias da Fase 6 serão preservadas como histórico, mas não serão incluídas na versão final.

## 9. Próximo incremento

Antes de criar as classes, o próximo passo é fechar o contrato técnico das três entidades:

1. campos finais e tipos Java/Oracle;
2. relacionamentos JPA;
3. endpoints e payloads;
4. comportamento do login;
5. códigos HTTP e validações;
6. estrutura inicial de `backend`, `frontend` e `sql`.

Este documento registra o inventário; não constitui ainda o script SQL nem a implementação do sistema.
