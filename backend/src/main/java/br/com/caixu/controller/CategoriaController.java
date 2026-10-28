package br.com.caixu.controller;

import br.com.caixu.dto.CategoriaRequest;
import br.com.caixu.dto.CategoriaResponse;
import br.com.caixu.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> listarPorUsuario(
            @RequestParam Long usuarioId
    ) {
        return ResponseEntity.ok(
                categoriaService.listarPorUsuario(usuarioId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponse> buscarPorId(
            @PathVariable Long id,
            @RequestParam Long usuarioId
    ) {
        return ResponseEntity.ok(
                categoriaService.buscarPorId(id, usuarioId)
        );
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(
            @Valid @RequestBody CategoriaRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(categoriaService.salvar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request
    ) {
        return ResponseEntity.ok(
                categoriaService.atualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @RequestParam Long usuarioId
    ) {
        categoriaService.excluir(id, usuarioId);

        return ResponseEntity.noContent().build();
    }
}