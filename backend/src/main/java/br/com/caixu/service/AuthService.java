package br.com.caixu.service;

import br.com.caixu.dto.LoginRequest;
import br.com.caixu.dto.LoginResponse;
import br.com.caixu.entity.Usuario;
import br.com.caixu.exception.InvalidCredentialsException;
import br.com.caixu.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final SenhaService senhaService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            SenhaService senhaService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.senhaService = senhaService;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository
                .findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "E-mail ou senha inválidos"
                        )
                );

        if (!senhaService.verificar(request.getSenha(), usuario.getSenha())) {
            throw new InvalidCredentialsException(
                    "E-mail ou senha inválidos"
            );
        }

        return new LoginResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }

    public LoginResponse buscarUsuarioDaSessao(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Sessão inválida. Faça login novamente."
                        )
                );

        return new LoginResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }
}