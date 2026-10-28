package br.com.caixu.controller;

import br.com.caixu.dto.TransacaoRequest;
import br.com.caixu.dto.TransacaoResponse;
import br.com.caixu.service.TransacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @GetMapping
    public ResponseEntity<List<TransacaoResponse>> listarPorUsuario(
            @RequestParam Long usuarioId
    ) {
        return ResponseEntity.ok(
                transacaoService.listarPorUsuario(usuarioId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransacaoResponse> buscarPorId(
            @PathVariable Long id,
            @RequestParam Long usuarioId
    ) {
        return ResponseEntity.ok(
                transacaoService.buscarPorId(id, usuarioId)
        );
    }

    @PostMapping
    public ResponseEntity<TransacaoResponse> criar(
            @Valid @RequestBody TransacaoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(transacaoService.salvar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransacaoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody TransacaoRequest request
    ) {
        return ResponseEntity.ok(
                transacaoService.atualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @RequestParam Long usuarioId
    ) {
        transacaoService.excluir(id, usuarioId);

        return ResponseEntity.noContent().build();
    }
}