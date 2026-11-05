package br.com.caixu.config;

import br.com.caixu.entity.Usuario;
import br.com.caixu.repository.UsuarioRepository;
import br.com.caixu.service.SenhaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;

@Component
@ConditionalOnProperty(name = "caixu.test-user.enabled", havingValue = "true")
public class UsuarioTesteInitializer implements ApplicationRunner {
    private final UsuarioRepository usuarios;
    private final SenhaService senhas;
    private final String email;
    private final String senha;

    public UsuarioTesteInitializer(
            UsuarioRepository usuarios,
            SenhaService senhas,
            @Value("${caixu.test-user.email:}") String email,
            @Value("${caixu.test-user.password:}") String senha
    ) {
        this.usuarios = usuarios;
        this.senhas = senhas;
        this.email = email;
        this.senha = senha;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() || senha.isBlank()) {
            throw new IllegalStateException(
                    "Defina CAIXU_TEST_USER_EMAIL e CAIXU_TEST_USER_PASSWORD antes de habilitar a conta de teste."
            );
        }

        String emailNormalizado = email.trim().toLowerCase(Locale.ROOT);
        if (usuarios.findByEmailIgnoreCase(emailNormalizado).isPresent()) {
            return;
        }

        Usuario usuario = new Usuario();
        usuario.setNome("Usuário de teste");
        usuario.setEmail(emailNormalizado);
        usuario.setSenha(senhas.gerarHash(senha));
        usuario.setSaldoInicial(new BigDecimal("1000.00"));
        usuarios.save(usuario);
    }
}
