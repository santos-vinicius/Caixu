package br.com.caixu.controller;

import br.com.caixu.service.CsrfService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CsrfController {

    private final CsrfService csrfService;

    public CsrfController(CsrfService csrfService) {
        this.csrfService = csrfService;
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> obterToken(
            HttpServletRequest request
    ) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(Map.of("token", csrfService.obterToken(request)));
    }
}