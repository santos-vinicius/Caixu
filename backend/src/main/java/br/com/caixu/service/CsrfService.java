package br.com.caixu.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class CsrfService {

    private static final String ATRIBUTO = "csrfToken";
    private final SecureRandom random = new SecureRandom();

    public String obterToken(HttpServletRequest request) {
        HttpSession sessao = request.getSession();

        synchronized (sessao) {
            String token = (String) sessao.getAttribute(ATRIBUTO);

            if (token == null) {
                byte[] bytes = new byte[32];
                random.nextBytes(bytes);

                token = Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(bytes);

                sessao.setAttribute(ATRIBUTO, token);
            }

            return token;
        }
    }

    public void validar(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);
        String recebido = request.getHeader("X-CSRF-TOKEN");
        String esperado = sessao == null
                ? null
                : (String) sessao.getAttribute(ATRIBUTO);

        if (esperado == null || recebido == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Token CSRF ausente ou inválido."
            );
        }

        boolean valido = MessageDigest.isEqual(
                esperado.getBytes(StandardCharsets.UTF_8),
                recebido.getBytes(StandardCharsets.UTF_8)
        );

        if (!valido) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Token CSRF ausente ou inválido."
            );
        }
    }
}