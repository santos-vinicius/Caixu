package br.com.caixu.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "USUARIO")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @NotBlank
    @Size(max = 60)
    @Column(name = "nome", nullable = false, length = 60)
    private String nome;

    @NotBlank
    @Email
    @Size(max = 120)
    @Column(name = "email", nullable = false, length = 120)
    private String email;

    @NotBlank
    @Size(max = 100)
    @Column(name = "senha", nullable = false, length = 100)
    private String senha;

    @NotNull
    @Digits(integer = 13, fraction = 2)
    @Column(
            name = "saldo_inicial",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal saldoInicial = BigDecimal.ZERO;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public BigDecimal getSaldoInicial() {
        return saldoInicial;
    }

    public void setSaldoInicial(BigDecimal saldoInicial) {
        this.saldoInicial = saldoInicial;
    }
}

