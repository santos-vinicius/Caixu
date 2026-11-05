package br.com.caixu.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRANSACAO")
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transacao")
    private Long id;

    @NotNull
    @DecimalMin(value = "0.01")
    @Digits(integer = 13, fraction = 2)
    @Column(name = "valor", nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @NotNull
    @Column(name = "data_transacao", nullable = false)
    private LocalDate dataTransacao;

    @NotBlank
    @Pattern(regexp = "RECEITA|DESPESA")
    @Column(name = "tipo_movimento", nullable = false, length = 20)
    private String tipoMovimento;

    @Size(max = 30)
    @Column(name = "metodo_pagamento", length = 30)
    private String metodoPagamento;

    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;

    @Size(max = 4000)
    @Column(name = "descricao", length = 4000)
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "categoria_id_categoria", nullable = true)
    private Categoria categoria;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "modalidade", nullable = false, length = 12)
    private String modalidade = "UNICA";

    @Column(name = "grupo_id", length = 36)
    private String grupoId;

    @Column(name = "numero_ocorrencia")
    private Integer numeroOcorrencia;

    @Column(name = "total_ocorrencias")
    private Integer totalOcorrencias;

    @Column(name = "frequencia", length = 7)
    private String frequencia;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void registrarCriacao() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public String getModalidade() { return modalidade; }
    public void setModalidade(String modalidade) { this.modalidade = modalidade; }
    public String getGrupoId() { return grupoId; }
    public void setGrupoId(String grupoId) { this.grupoId = grupoId; }
    public Integer getNumeroOcorrencia() { return numeroOcorrencia; }
    public void setNumeroOcorrencia(Integer numeroOcorrencia) { this.numeroOcorrencia = numeroOcorrencia; }
    public Integer getTotalOcorrencias() { return totalOcorrencias; }
    public void setTotalOcorrencias(Integer totalOcorrencias) { this.totalOcorrencias = totalOcorrencias; }
    public String getFrequencia() { return frequencia; }
    public void setFrequencia(String frequencia) { this.frequencia = frequencia; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataTransacao() {
        return dataTransacao;
    }

    public void setDataTransacao(LocalDate dataTransacao) {
        this.dataTransacao = dataTransacao;
    }

    public String getTipoMovimento() {
        return tipoMovimento;
    }

    public void setTipoMovimento(String tipoMovimento) {
        this.tipoMovimento = tipoMovimento;
    }

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
