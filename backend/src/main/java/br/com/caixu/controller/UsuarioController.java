package br.com.caixu.controller;

import br.com.caixu.dto.UsuarioRequest;
import br.com.caixu.dto.UsuarioResponse;
import br.com.caixu.dto.UsuarioAtualizacaoRequest;
import br.com.caixu.service.SessaoService;
import br.com.caixu.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final SessaoService sessaoService;

    public UsuarioController(
            UsuarioService usuarioService,
            SessaoService sessaoService
    ) {
        this.usuarioService = usuarioService;
        this.sessaoService = sessaoService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar(
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = sessaoService.obterUsuarioId(httpRequest);
        UsuarioResponse usuario = usuarioService.buscarPorId(usuarioId);

        return ResponseEntity.ok(List.of(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest
    ) {
        sessaoService.validarUsuario(httpRequest, id);

        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(
            @Valid @RequestBody UsuarioRequest request
    ) {
        UsuarioResponse resposta = usuarioService.salvar(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioAtualizacaoRequest request,
            HttpServletRequest httpRequest
    ) {
        sessaoService.validarUsuario(httpRequest, id);

        return ResponseEntity.ok(
                usuarioService.atualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            HttpServletRequest httpRequest
    ) {
        sessaoService.validarUsuario(httpRequest, id);

        usuarioService.excluir(id);
        httpRequest.getSession(false).invalidate();

        return ResponseEntity.noContent().build();
    }
}