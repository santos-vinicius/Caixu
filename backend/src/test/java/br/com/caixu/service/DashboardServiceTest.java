package br.com.caixu.service;

import br.com.caixu.entity.*;
import br.com.caixu.repository.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DashboardServiceTest {
    @Test void saldoAtualNaoIncluiFuturosEProjetadoIncluiTodos() {
        var usuarios=mock(UsuarioRepository.class);var transacoes=mock(TransacaoRepository.class);
        var usuario=new Usuario();usuario.setId(1L);usuario.setSaldoInicial(new BigDecimal("1000.00"));
        when(usuarios.findById(1L)).thenReturn(Optional.of(usuario));
        var receita=new Transacao();receita.setValor(new BigDecimal("300.10"));receita.setTipoMovimento("RECEITA");receita.setDataTransacao(LocalDate.now());
        var despesa=new Transacao();despesa.setValor(new BigDecimal("1500.25"));despesa.setTipoMovimento("DESPESA");despesa.setDataTransacao(LocalDate.now().plusDays(1));
        when(transacoes.findByUsuario_Id(1L)).thenReturn(List.of(receita,despesa));
        var response=new DashboardService(usuarios,transacoes).consultar(1L);
        assertEquals(new BigDecimal("1300.10"),response.getSaldoAtual());
        assertEquals(new BigDecimal("-200.15"),response.getSaldoProjetado());
    }
}
