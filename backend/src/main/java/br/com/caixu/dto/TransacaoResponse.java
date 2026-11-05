package br.com.caixu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransacaoResponse(
        Long id, BigDecimal valor, LocalDate dataTransacao, String tipoMovimento,
        String metodoPagamento, String status, String descricao, Long categoriaId,
        Long usuarioId, String modalidade, String grupoId, Integer numeroOcorrencia,
        Integer totalOcorrencias, String frequencia, LocalDateTime criadoEm
) {}
