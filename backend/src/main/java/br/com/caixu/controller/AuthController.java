package br.com.caixu.controller;

import br.com.caixu.dto.LoginRequest;
import br.com.caixu.dto.LoginResponse;
import br.com.caixu.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.com.caixu.exception.InvalidCredentialsException;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        LoginResponse response = authService.login(request);

        HttpSession sessao = httpRequest.getSession();
        httpRequest.changeSessionId();

        sessao.setAttribute("usuarioId", response.getUsuarioId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> consultarSessao(
            HttpServletRequest httpRequest
    ) {
        HttpSession sessao = httpRequest.getSession(false);

        if (sessao == null
                || !(sessao.getAttribute("usuarioId") instanceof Long usuarioId)) {
            throw new InvalidCredentialsException(
                    "Faça login para continuar."
            );
        }

        LoginResponse response = authService.buscarUsuarioDaSessao(usuarioId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest httpRequest
    ) {
        HttpSession sessao = httpRequest.getSession(false);

        if (sessao != null) {
            sessao.invalidate();
        }

        return ResponseEntity.noContent().build();
    }
}