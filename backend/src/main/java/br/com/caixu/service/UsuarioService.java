package br.com.caixu.service;

import br.com.caixu.dto.UsuarioRequest;
import br.com.caixu.dto.UsuarioResponse;
import br.com.caixu.dto.UsuarioAtualizacaoRequest;
import br.com.caixu.exception.BusinessRuleException;
import br.com.caixu.repository.CategoriaRepository;
import br.com.caixu.repository.TransacaoRepository;
import org.springframework.transaction.annotation.Transactional;
import br.com.caixu.entity.Usuario;
import br.com.caixu.exception.ResourceNotFoundException;
import br.com.caixu.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final SenhaService senhaService;

    private final CategoriaRepository categoriaRepository;
    private final TransacaoRepository transacaoRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, SenhaService senhaService,
                          CategoriaRepository categoriaRepository, TransacaoRepository transacaoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.senhaService = senhaService;
        this.categoriaRepository = categoriaRepository;
        this.transacaoRepository = transacaoRepository;
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

        usuario.setNome(request.getNome().trim());
        usuario.setEmail(request.getEmail().trim().toLowerCase(java.util.Locale.ROOT));
        usuario.setSenha(senhaService.gerarHash(request.getSenha()));
        usuario.setSaldoInicial(request.getSaldoInicial());

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return paraResponse(usuarioSalvo);
    }

    public UsuarioResponse atualizar(
            Long id,
            UsuarioAtualizacaoRequest request
    ) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário não encontrado"));

        boolean alterandoEmail = !usuario.getEmail().equalsIgnoreCase(request.email().trim());
        if ((alterandoEmail || request.senha() != null)
                && !senhaService.verificar(request.senhaAtual(), usuario.getSenha())) {
            throw new BusinessRuleException("Confirme sua senha atual para alterar o e-mail ou a senha.");
        }
        if (request.senha() != null) {
            if (request.senha().isBlank()) {
                throw new BusinessRuleException("A nova senha não pode ficar em branco.");
            }
            usuario.setSenha(senhaService.gerarHash(request.senha()));
        }
        usuario.setNome(request.nome().trim());
        usuario.setEmail(request.email().trim().toLowerCase(java.util.Locale.ROOT));
        usuario.setSaldoInicial(request.saldoInicial());

        Usuario usuarioAtualizado = usuarioRepository.save(usuario);

        return paraResponse(usuarioAtualizado);
    }

    public void excluir(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário não encontrado"));

        transacaoRepository.excluirPorUsuario(id);
        categoriaRepository.excluirPorUsuario(id);
        usuarioRepository.delete(usuario);
        usuarioRepository.flush();
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