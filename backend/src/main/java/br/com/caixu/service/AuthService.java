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

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "E-mail ou senha inválidos"
                        ));

        if (!usuario.getSenha().equals(request.getSenha())) {
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
}