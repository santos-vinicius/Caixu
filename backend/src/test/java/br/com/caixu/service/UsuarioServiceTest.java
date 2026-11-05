package br.com.caixu.service;

import br.com.caixu.dto.UsuarioAtualizacaoRequest;
import br.com.caixu.entity.Usuario;
import br.com.caixu.exception.BusinessRuleException;
import br.com.caixu.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock UsuarioRepository usuarios;
    @Mock CategoriaRepository categorias;
    @Mock TransacaoRepository transacoes;
    @Mock SenhaService senhas;
    UsuarioService service;
    Usuario usuario;
    @BeforeEach void preparar() {
        service=new UsuarioService(usuarios,senhas,categorias,transacoes);
        usuario=new Usuario();usuario.setId(7L);usuario.setNome("Ana");usuario.setEmail("ana@teste.local");
        usuario.setSenha("hash-original");usuario.setSaldoInicial(BigDecimal.ZERO);
        when(usuarios.findById(7L)).thenReturn(Optional.of(usuario));
    }
    @Test void atualizaPerfilSemRegravarSenha() {
        when(usuarios.save(any())).thenAnswer(inv->inv.getArgument(0));
        service.atualizar(7L,new UsuarioAtualizacaoRequest("Ana Silva","ana@teste.local",new BigDecimal("150.00"),null,null));
        assertEquals("hash-original",usuario.getSenha());verifyNoInteractions(senhas);
    }
    @Test void trocarEmailExigeSenhaAtual() {
        assertThrows(BusinessRuleException.class,()->service.atualizar(7L,
            new UsuarioAtualizacaoRequest("Ana","nova@teste.local",BigDecimal.ZERO,null,null)));
        verify(usuarios,never()).save(any());
    }
    @Test void atualizaSenhaSomenteAposConfirmacao() {
        when(senhas.verificar("atual","hash-original")).thenReturn(true);
        when(senhas.gerarHash("nova")).thenReturn("novo-hash");
        when(usuarios.save(any())).thenAnswer(inv->inv.getArgument(0));
        service.atualizar(7L,new UsuarioAtualizacaoRequest("Ana","ana@teste.local",BigDecimal.ZERO,"nova","atual"));
        assertEquals("novo-hash",usuario.getSenha());
    }
    @Test void excluirContaRemoveDependenciasNaOrdemCorreta() {
        service.excluir(7L);
        var ordem=inOrder(transacoes,categorias,usuarios);
        ordem.verify(transacoes).excluirPorUsuario(7L);
        ordem.verify(categorias).excluirPorUsuario(7L);
        ordem.verify(usuarios).delete(usuario);
        ordem.verify(usuarios).flush();
    }
}
