package br.com.caixu.service;

import br.com.caixu.dto.UsuarioRequest;
import br.com.caixu.dto.UsuarioResponse;
import br.com.caixu.entity.Usuario;
import br.com.caixu.exception.ResourceNotFoundException;
import br.com.caixu.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::paraResponse)
                .toList();
    }

    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário não encontrado"));

        return paraResponse(usuario);
    }

    public UsuarioResponse salvar(UsuarioRequest request) {
        Usuario usuario = new Usuario();

        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(request.getSenha());
        usuario.setSaldoInicial(request.getSaldoInicial());

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return paraResponse(usuarioSalvo);
    }

    public UsuarioResponse atualizar(
            Long id,
            UsuarioRequest request
    ) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário não encontrado"));

        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(request.getSenha());
        usuario.setSaldoInicial(request.getSaldoInicial());

        Usuario usuarioAtualizado = usuarioRepository.save(usuario);

        return paraResponse(usuarioAtualizado);
    }

    public void excluir(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário não encontrado"));

        usuarioRepository.delete(usuario);
    }

    private UsuarioResponse paraResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getSaldoInicial()
        );
    }
}