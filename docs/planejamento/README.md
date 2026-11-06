# Planejamento do Caixu

Registros da construção do projeto integrador da FIAP. Preservam decisões e o escopo de cada etapa; podem descrever contratos anteriores à integração e à autenticação atuais.

Para instalar e executar a versão atual, consulte o [README principal](../../README.md).

## Documentos versionados

- [Contrato do projeto](CONTRATO_PROJETO_FASE7.md): organização inicial, entidades, relacionamentos e endpoints.
- [Decisões do MVP](DECISOES_MODELO_MVP.md): limites de escopo e decisões de modelagem.
- [Inventário comparativo](INVENTARIO_COMPARATIVO_FASE7.md): comparação das fases anteriores com os requisitos da atividade.
- [Verificação HTTP](verificar_api.py): script de validação da integração; cria e remove contas temporárias próprias no ambiente configurado.

## Organização

Documentos auxiliares ficam nesta pasta. Código executável, testes, assets utilizados pelo app e scripts de banco permanecem em `backend/`, `frontend/` e `sql/`.

Arquivos de trabalho locais, pacotes de identidade, protótipos e relatórios internos não fazem parte da publicação. Os assets utilizados pela interface estão versionados em `frontend/public/`.
