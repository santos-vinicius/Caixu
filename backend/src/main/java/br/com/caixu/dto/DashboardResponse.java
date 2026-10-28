package br.com.caixu.dto;

import java.math.BigDecimal;

public class DashboardResponse {
    private Long usuarioId;
    private BigDecimal saldoInicial;
    private BigDecimal saldoAtual;
    private BigDecimal saldoProjetado;

    public DashboardResponse(
            Long usuarioId,
            BigDecimal saldoInicial,
            BigDecimal saldoAtual,
            BigDecimal saldoProjetado
    ) {
        this.usuarioId = usuarioId;
        this.saldoInicial = saldoInicial;
        this.saldoAtual = saldoAtual;
        this.saldoProjetado = saldoProjetado;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public BigDecimal getSaldoInicial() {
        return saldoInicial;
    }

    public void setSaldoInicial(BigDecimal saldoInicial) {
        this.saldoInicial = saldoInicial;
    }

    public BigDecimal getSaldoAtual() {
        return saldoAtual;
    }

    public void setSaldoAtual(BigDecimal saldoAtual) {
        this.saldoAtual = saldoAtual;
    }

    public BigDecimal getSaldoProjetado() {
        return saldoProjetado;
    }

    public void setSaldoProjetado(BigDecimal saldoProjetado) {
        this.saldoProjetado = saldoProjetado;
    }
}
