package br.com.caixu.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record UsuarioAtualizacaoRequest(
        @NotBlank @Size(max = 60) String nome,
        @NotBlank @Email @Size(max = 120) String email,
        @NotNull @Digits(integer = 13, fraction = 2) BigDecimal saldoInicial,
        @Size(max = 100) String senha,
        @Size(max = 100) String senhaAtual
) {}
