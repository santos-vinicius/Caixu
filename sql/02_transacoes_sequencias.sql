-- Caixu: preserva as tabelas e dados existentes. Executar somente no schema FIAP do projeto.
-- Pode ser executado novamente: cada alteração é precedida por uma consulta ao dicionário.
DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_tab_columns
    WHERE table_name = 'TRANSACAO' AND column_name = 'CATEGORIA_ID_CATEGORIA' AND nullable = 'N';
    IF quantidade > 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE transacao MODIFY (categoria_id_categoria NULL)';
    END IF;
END;
/

DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_tab_columns
    WHERE table_name = 'TRANSACAO' AND column_name = 'MODALIDADE';
    IF quantidade = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE transacao ADD (modalidade VARCHAR2(12) DEFAULT ''UNICA'' NOT NULL)';
    END IF;
END;
/

DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_tab_columns
    WHERE table_name = 'TRANSACAO' AND column_name = 'GRUPO_ID';
    IF quantidade = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE transacao ADD (grupo_id VARCHAR2(36))';
    END IF;
END;
/

DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_tab_columns
    WHERE table_name = 'TRANSACAO' AND column_name = 'NUMERO_OCORRENCIA';
    IF quantidade = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE transacao ADD (numero_ocorrencia NUMBER(3))';
    END IF;
END;
/

DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_tab_columns
    WHERE table_name = 'TRANSACAO' AND column_name = 'TOTAL_OCORRENCIAS';
    IF quantidade = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE transacao ADD (total_ocorrencias NUMBER(3))';
    END IF;
END;
/

DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_tab_columns
    WHERE table_name = 'TRANSACAO' AND column_name = 'FREQUENCIA';
    IF quantidade = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE transacao ADD (frequencia VARCHAR2(7))';
    END IF;
END;
/

DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_tab_columns
    WHERE table_name = 'TRANSACAO' AND column_name = 'CRIADO_EM';
    IF quantidade = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE transacao ADD (criado_em TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL)';
    END IF;
END;
/

DECLARE
    quantidade NUMBER;
BEGIN
    SELECT COUNT(*) INTO quantidade FROM user_indexes WHERE index_name = 'TRANSACAO_GRUPO_UK';
    IF quantidade = 0 THEN
        EXECUTE IMMEDIATE 'CREATE UNIQUE INDEX transacao_grupo_uk ON transacao (grupo_id, numero_ocorrencia)';
    END IF;
END;
/
