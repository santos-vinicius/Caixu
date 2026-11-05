package br.com.caixu.config;

import br.com.caixu.service.CsrfService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

@Component
public class CsrfInterceptor implements HandlerInterceptor {

    private static final Set<String> METODOS_SEGUROS =
            Set.of("GET", "HEAD", "OPTIONS");

    private final CsrfService csrfService;

    public CsrfInterceptor(CsrfService csrfService) {
        this.csrfService = csrfService;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) {
        if (!METODOS_SEGUROS.contains(request.getMethod())) {
            csrfService.validar(request);
        }

        return true;
    }
}