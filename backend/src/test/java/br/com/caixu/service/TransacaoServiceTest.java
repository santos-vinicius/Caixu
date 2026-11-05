package br.com.caixu.service;

import br.com.caixu.dto.*;
import br.com.caixu.entity.*;
import br.com.caixu.exception.*;
import br.com.caixu.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransacaoServiceTest {
    @Mock TransacaoRepository transacoes;
    @Mock UsuarioRepository usuarios;
    @Mock CategoriaRepository categorias;
    TransacaoService service;
    Usuario usuario;

    @BeforeEach void preparar() {
        service = new TransacaoService(transacoes, usuarios, categorias);
        usuario = new Usuario(); usuario.setId(7L);
    }
    TransacaoRequest pedido(String valor, String data) {
        var request = new TransacaoRequest();
        request.setUsuarioId(7L); request.setTipoMovimento("DESPESA");
        request.setValor(new BigDecimal(valor)); request.setDataTransacao(LocalDate.parse(data));
        return request;
    }
    @Test void criaLancamentoSemCategoria() {
        when(usuarios.findById(7L)).thenReturn(Optional.of(usuario));
        when(transacoes.save(any())).thenAnswer(inv -> { Transacao t=inv.getArgument(0);t.setId(1L);return t; });
        var response=service.salvar(pedido("10.50", "2026-11-05"));
        assertNull(response.categoriaId()); assertEquals("UNICA", response.modalidade());
        assertEquals(new BigDecimal("10.50"), response.valor());
    }
    @Test void rejeitaCategoriaDeOutroUsuario() {
        when(usuarios.findById(7L)).thenReturn(Optional.of(usuario));
        Usuario outro=new Usuario(); outro.setId(8L);
        Categoria categoria=new Categoria(); categoria.setUsuario(outro); categoria.setTipoCategoria("DESPESA");
        when(categorias.findById(4L)).thenReturn(Optional.of(categoria));
        var request=pedido("10.00", "2026-11-05"); request.setCategoriaId(4L);
        assertThrows(OwnershipException.class, () -> service.salvar(request));
        verify(transacoes, never()).save(any());
    }
    @Test void rejeitaCategoriaDeTipoDiferente() {
        when(usuarios.findById(7L)).thenReturn(Optional.of(usuario));
        Categoria categoria=new Categoria(); categoria.setUsuario(usuario); categoria.setTipoCategoria("RECEITA");
        when(categorias.findById(4L)).thenReturn(Optional.of(categoria));
        var request=pedido("10.00", "2026-11-05");request.setCategoriaId(4L);
        assertThrows(BusinessRuleException.class, () -> service.salvar(request));
    }
    @Test void salvaParcelasComGrupoUnicoEPreservaCentavosEFimDoMes() {
        when(usuarios.findById(7L)).thenReturn(Optional.of(usuario));
        when(transacoes.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        var lote=new TransacaoLoteRequest("PARCELADA", "MENSAL", List.of(
            pedido("33.34", "2028-01-31"),pedido("33.33", "2028-02-29"),pedido("33.33", "2028-03-31")));
        var resultado=service.salvarLote(lote,7L);
        assertEquals(3,resultado.size());
        assertNotNull(resultado.get(0).grupoId());
        assertEquals(1,resultado.stream().map(TransacaoResponse::grupoId).distinct().count());
        assertEquals(3,resultado.get(2).numeroOcorrencia());
        assertEquals(new BigDecimal("100.00"),resultado.stream().map(TransacaoResponse::valor).reduce(BigDecimal.ZERO, BigDecimal::add));
    }
    @Test void rejeitaLoteComDataForaDaSequenciaAntesDeSalvar() {
        when(usuarios.findById(7L)).thenReturn(Optional.of(usuario));
        var lote=new TransacaoLoteRequest("RECORRENTE","SEMANAL",List.of(
            pedido("10.00","2026-11-05"),pedido("10.00","2026-11-13")));
        assertThrows(BusinessRuleException.class,()->service.salvarLote(lote,7L));
        verify(transacoes,never()).saveAll(anyList());
    }
    @Test void rejeitaRecorrenciaComValoresDiferentes() {
        when(usuarios.findById(7L)).thenReturn(Optional.of(usuario));
        var lote=new TransacaoLoteRequest("RECORRENTE","MENSAL",List.of(
            pedido("10.00","2026-11-05"),pedido("20.00","2026-12-05")));
        assertThrows(BusinessRuleException.class,()->service.salvarLote(lote,7L));
    }
    @Test void rejeitaFrequenciaSemanalParaParcelas() {
        var lote=new TransacaoLoteRequest("PARCELADA","SEMANAL",List.of(pedido("10.00","2026-11-05")));
        assertThrows(BusinessRuleException.class,()->service.salvarLote(lote,7L));
    }
    Transacao sequencia() {
        var t=new Transacao(); t.setId(4L);t.setUsuario(usuario);t.setGrupoId("grupo");
        t.setModalidade("PARCELADA");t.setNumeroOcorrencia(2);t.setTotalOcorrencias(4);
        when(transacoes.findById(4L)).thenReturn(Optional.of(t));return t;
    }
    @Test void excluirProximasRestringeAoUsuarioGrupoENumero() {
        sequencia(); service.excluir(4L,7L,"ESTA_E_PROXIMAS");
        verify(transacoes).excluirSequencia(7L,"grupo",2);
        verify(transacoes,never()).delete(any());
    }
    @Test void excluirUmaPreservaAsDemais() {
        var t=sequencia();service.excluir(4L,7L,"SOMENTE_ESTA");
        verify(transacoes).delete(t);verify(transacoes,never()).excluirSequencia(any(),any(),any());
    }
    @Test void naoExcluiSequenciaDeOutroUsuario() {
        sequencia();assertThrows(OwnershipException.class,()->service.excluir(4L,8L,"ESTA_E_PROXIMAS"));
        verify(transacoes,never()).excluirSequencia(any(),any(),any());
    }
    @Test void editarOcorrenciaPreservaIdentificacaoDoGrupo() {
        var t=sequencia();when(transacoes.save(any())).thenAnswer(inv->inv.getArgument(0));
        var result=service.atualizar(4L,pedido("25.00","2026-11-20"));
        assertEquals("grupo",result.grupoId());assertEquals(2,result.numeroOcorrencia());
        assertEquals(new BigDecimal("25.00"),t.getValor());
    }
}
