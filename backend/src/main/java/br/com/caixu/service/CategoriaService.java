package br.com.caixu.service;

import br.com.caixu.dto.CategoriaRequest;
import br.com.caixu.dto.CategoriaResponse;
import br.com.caixu.entity.Categoria;
import br.com.caixu.entity.Usuario;
import br.com.caixu.repository.CategoriaRepository;
import br.com.caixu.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public CategoriaService(
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarPorUsuario(Long usuarioId) {
        validarUsuario(usuarioId);

        return categoriaRepository.findByUsuario_Id(usuarioId)
                .stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorId(Long id, Long usuarioId) {
        Categoria categoria = buscarEntidade(id);
        validarProprietario(categoria, usuarioId);

        return paraResponse(categoria);
    }

    public CategoriaResponse salvar(CategoriaRequest request) {
        Usuario usuario = buscarUsuario(request.getUsuarioId());

        Categoria categoria = new Categoria();
        categoria.setNomeCategoria(request.getNomeCategoria());
        categoria.setTipoCategoria(request.getTipoCategoria());
        categoria.setUsuario(usuario);

        return paraResponse(categoriaRepository.save(categoria));
    }

    public CategoriaResponse atualizar(
            Long id,
            CategoriaRequest request
    ) {
        Categoria categoria = buscarEntidade(id);
        validarProprietario(categoria, request.getUsuarioId());

        categoria.setNomeCategoria(request.getNomeCategoria());
        categoria.setTipoCategoria(request.getTipoCategoria());

        return paraResponse(categoriaRepository.save(categoria));
    }

    public void excluir(Long id, Long usuarioId) {
        Categoria categoria = buscarEntidade(id);
        validarProprietario(categoria, usuarioId);

        categoriaRepository.delete(categoria);
    }

    private Categoria buscarEntidade(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Categoria não encontrada"));
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado"));
    }

    private void validarUsuario(Long usuarioId) {
        buscarUsuario(usuarioId);
    }

    private void validarProprietario(
            Categoria categoria,
            Long usuarioId
    ) {
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException(
                    "Categoria não pertence ao usuário informado"
            );
        }
    }

    private CategoriaResponse paraResponse(Categoria categoria) {
        return new CategoriaResponse(
                categoria.getId(),
                categoria.getNomeCategoria(),
                categoria.getTipoCategoria(),
                categoria.getUsuario().getId()
        );
    }
}