package br.com.caixu.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record TransacaoLoteRequest(
        @NotBlank @Pattern(regexp = "UNICA|RECORRENTE|PARCELADA") String modalidade,
        @Pattern(regexp = "MENSAL|SEMANAL") String frequencia,
        @NotEmpty @Size(max = 120) List<@NotNull @Valid TransacaoRequest> transacoes
) {}
