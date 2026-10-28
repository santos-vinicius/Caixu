package br.com.caixu.service;

import br.com.caixu.dto.DashboardResponse;
import br.com.caixu.entity.Transacao;
import br.com.caixu.entity.Usuario;
import br.com.caixu.exception.ResourceNotFoundException;
import br.com.caixu.repository.TransacaoRepository;
import br.com.caixu.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final TransacaoRepository transacaoRepository;

    public DashboardService(
            UsuarioRepository usuarioRepository,
            TransacaoRepository transacaoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.transacaoRepository = transacaoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse consultar(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado"
                        ));

        BigDecimal saldoInicial = usuario.getSaldoInicial();
        BigDecimal saldoAtual = saldoInicial;
        BigDecimal saldoProjetado = saldoInicial;

        LocalDate hoje = LocalDate.now();

        for (Transacao transacao :
                transacaoRepository.findByUsuario_Id(usuarioId)) {

            BigDecimal impacto = calcularImpacto(transacao);

            saldoProjetado = saldoProjetado.add(impacto);

            if (!transacao.getDataTransacao().isAfter(hoje)) {
                saldoAtual = saldoAtual.add(impacto);
            }
        }

        return new DashboardResponse(
                usuario.getId(),
                saldoInicial,
                saldoAtual,
                saldoProjetado
        );
    }

    private BigDecimal calcularImpacto(Transacao transacao) {
        if ("RECEITA".equals(transacao.getTipoMovimento())) {
            return transacao.getValor();
        }

        return transacao.getValor().negate();
    }
}