-- Caixu - modelo inicial da Fase 7
-- Executar conectado ao schema Oracle da FIAP destinado ao projeto.
-- Este script cria apenas Usuario, Categoria e Transacao.

CREATE TABLE usuario (
    id_usuario NUMBER GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR2(60) NOT NULL,
    email VARCHAR2(120) NOT NULL,
    senha VARCHAR2(100) NOT NULL,
    saldo_inicial NUMBER(15,2) DEFAULT 0 NOT NULL,

    CONSTRAINT usuario_pk
        PRIMARY KEY (id_usuario),

    CONSTRAINT usuario_email_uk
        UNIQUE (email)
);

CREATE TABLE categoria (
    id_categoria NUMBER GENERATED ALWAYS AS IDENTITY,
    nome_categoria VARCHAR2(60) NOT NULL,
    tipo_categoria VARCHAR2(20) NOT NULL,
    usuario_id_usuario NUMBER NOT NULL,

    CONSTRAINT categoria_pk
        PRIMARY KEY (id_categoria),

    CONSTRAINT categoria_usuario_fk
        FOREIGN KEY (usuario_id_usuario)
        REFERENCES usuario (id_usuario),

    -- Permite validar, por chave estrangeira composta,
    -- que a categoria usada pertence ao mesmo usuario da transacao.
    CONSTRAINT categoria_usuario_uk
        UNIQUE (id_categoria, usuario_id_usuario)
);

CREATE TABLE transacao (
    id_transacao NUMBER GENERATED ALWAYS AS IDENTITY,
    valor NUMBER(15,2) NOT NULL,
    data_transacao DATE NOT NULL,
    tipo_movimento VARCHAR2(20) NOT NULL,
    metodo_pagamento VARCHAR2(30),
    status VARCHAR2(20),
    descricao VARCHAR2(4000),
    categoria_id_categoria NUMBER NOT NULL,
    usuario_id_usuario NUMBER NOT NULL,

    CONSTRAINT transacao_pk
        PRIMARY KEY (id_transacao),

    CONSTRAINT transacao_valor_ck
        CHECK (valor > 0),

    CONSTRAINT transacao_tipo_ck
        CHECK (tipo_movimento IN ('RECEITA', 'DESPESA')),

    CONSTRAINT transacao_usuario_fk
        FOREIGN KEY (usuario_id_usuario)
        REFERENCES usuario (id_usuario),

    CONSTRAINT transacao_categoria_usuario_fk
        FOREIGN KEY (categoria_id_categoria, usuario_id_usuario)
        REFERENCES categoria (id_categoria, usuario_id_usuario)
);

-- Conferencia das tabelas criadas.
SELECT table_name
FROM user_tables
WHERE table_name IN ('USUARIO', 'CATEGORIA', 'TRANSACAO')
ORDER BY table_name;

-- Conferencia das restricoes criadas.
SELECT table_name, constraint_name, constraint_type, status
FROM user_constraints
WHERE table_name IN ('USUARIO', 'CATEGORIA', 'TRANSACAO')
ORDER BY table_name, constraint_name;
