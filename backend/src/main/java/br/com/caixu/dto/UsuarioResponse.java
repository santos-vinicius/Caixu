package br.com.caixu.dto;

import java.math.BigDecimal;

public class UsuarioResponse {

    private Long id;
    private String nome;
    private String email;
    private BigDecimal saldoInicial;

    public UsuarioResponse(
            Long id,
            String nome,
            String email,
            BigDecimal saldoInicial
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.saldoInicial = saldoInicial;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public BigDecimal getSaldoInicial() {
        return saldoInicial;
    }
}