package br.com.caixu.controller;

import br.com.caixu.dto.DashboardResponse;
import br.com.caixu.service.DashboardService;
import br.com.caixu.service.SessaoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SessaoService sessaoService;

    public DashboardController(
            DashboardService dashboardService,
            SessaoService sessaoService
    ) {
        this.dashboardService = dashboardService;
        this.sessaoService = sessaoService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> consultar(
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = sessaoService.obterUsuarioId(httpRequest);

        return ResponseEntity.ok(
                dashboardService.consultar(usuarioId)
        );
    }
}