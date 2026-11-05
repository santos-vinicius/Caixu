package br.com.caixu.service;

import br.com.caixu.exception.InvalidCredentialsException;
import br.com.caixu.exception.OwnershipException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

@Service
public class SessaoService {

    public Long obterUsuarioId(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);

        if (sessao == null
                || !(sessao.getAttribute("usuarioId") instanceof Long usuarioId)) {
            throw new InvalidCredentialsException(
                    "Faça login para continuar."
            );
        }

        return usuarioId;
    }

    public void validarUsuario(
            HttpServletRequest request,
            Long usuarioIdSolicitado
    ) {
        Long usuarioIdAutenticado = obterUsuarioId(request);

        if (!usuarioIdAutenticado.equals(usuarioIdSolicitado)) {
            throw new OwnershipException(
                    "Você não tem permissão para acessar este usuário."
            );
        }
    }
}