package br.com.caixu.controller;

import br.com.caixu.dto.UsuarioRequest;
import br.com.caixu.dto.UsuarioResponse;
import br.com.caixu.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("/api/usuarios") // todos
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }


    @GetMapping("/{id}") // o /{1} devolve usuario por ID
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(
            @Valid @RequestBody UsuarioRequest request
    ) {
        UsuarioResponse resposta = usuarioService.salvar(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resposta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequest request
    ) {
        return ResponseEntity.ok(
                usuarioService.atualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id
    ) {
        usuarioService.excluir(id);

        return ResponseEntity.noContent().build();
    }
}