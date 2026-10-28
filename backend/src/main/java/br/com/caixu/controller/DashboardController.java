package br.com.caixu.controller;

import br.com.caixu.dto.DashboardResponse;
import br.com.caixu.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> consultar(
            @RequestParam Long usuarioId
    ) {
        return ResponseEntity.ok(
                dashboardService.consultar(usuarioId)
        );
    }
}