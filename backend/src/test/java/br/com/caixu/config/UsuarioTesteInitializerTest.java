package br.com.caixu.config;

import br.com.caixu.entity.Usuario;
import br.com.caixu.repository.UsuarioRepository;
import br.com.caixu.service.SenhaService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioTesteInitializerTest {
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final SenhaService senhas = mock(SenhaService.class);

    @Test
    void usaCredenciaisFornecidasEArmazenaSomenteOHash() {
        when(usuarios.findByEmailIgnoreCase("dev@exemplo.invalid")).thenReturn(Optional.empty());
        when(senhas.gerarHash("senha-apenas-do-teste")).thenReturn("hash-calculado");
        var initializer = new UsuarioTesteInitializer(
                usuarios, senhas, " DEV@exemplo.invalid ", "senha-apenas-do-teste"
        );

        initializer.run(null);

        var captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarios).save(captor.capture());
        assertEquals("dev@exemplo.invalid", captor.getValue().getEmail());
        assertEquals("hash-calculado", captor.getValue().getSenha());
        assertEquals(new BigDecimal("1000.00"), captor.getValue().getSaldoInicial());
    }

    @Test
    void naoAlteraUsuarioExistente() {
        when(usuarios.findByEmailIgnoreCase("dev@exemplo.invalid"))
                .thenReturn(Optional.of(new Usuario()));
        var initializer = new UsuarioTesteInitializer(
                usuarios, senhas, "dev@exemplo.invalid", "senha-apenas-do-teste"
        );

        initializer.run(null);

        verify(usuarios, never()).save(any());
        verifyNoInteractions(senhas);
    }

    @Test
    void configuracaoIncompletaNaoCriaContaNemAdotaSenhaPadrao() {
        for (String[] dados : new String[][]{{"", "senha-apenas-do-teste"}, {"dev@exemplo.invalid", ""}}) {
            var initializer = new UsuarioTesteInitializer(usuarios, senhas, dados[0], dados[1]);
            assertThrows(IllegalStateException.class, () -> initializer.run(null));
        }
        verifyNoInteractions(usuarios, senhas);
    }
}
