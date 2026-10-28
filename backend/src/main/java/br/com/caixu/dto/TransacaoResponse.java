package br.com.caixu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransacaoResponse {

    private Long id;
    private BigDecimal valor;
    private LocalDate dataTransacao;
    private String tipoMovimento;
    private String metodoPagamento;
    private String status;
    private String descricao;
    private Long categoriaId;
    private Long usuarioId;

    public TransacaoResponse(
            Long id,
            BigDecimal valor,
            LocalDate dataTransacao,
            String tipoMovimento,
            String metodoPagamento,
            String status,
            String descricao,
            Long categoriaId,
            Long usuarioId
    ) {
        this.id = id;
        this.valor = valor;
        this.dataTransacao = dataTransacao;
        this.tipoMovimento = tipoMovimento;
        this.metodoPagamento = metodoPagamento;
        this.status = status;
        this.descricao = descricao;
        this.categoriaId = categoriaId;
        this.usuarioId = usuarioId;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getDataTransacao() {
        return dataTransacao;
    }

    public String getTipoMovimento() {
        return tipoMovimento;
    }

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public String getStatus() {
        return status;
    }

    public String getDescricao() {
        return descricao;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }
}