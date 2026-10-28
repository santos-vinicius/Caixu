package br.com.caixu.service;

import br.com.caixu.dto.TransacaoRequest;
import br.com.caixu.dto.TransacaoResponse;
import br.com.caixu.entity.Categoria;
import br.com.caixu.entity.Transacao;
import br.com.caixu.entity.Usuario;
import br.com.caixu.exception.OwnershipException;
import br.com.caixu.exception.ResourceNotFoundException;
import br.com.caixu.repository.CategoriaRepository;
import br.com.caixu.repository.TransacaoRepository;
import br.com.caixu.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    public TransacaoService(
            TransacaoRepository transacaoRepository,
            UsuarioRepository usuarioRepository,
            CategoriaRepository categoriaRepository
    ) {
        this.transacaoRepository = transacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<TransacaoResponse> listarPorUsuario(Long usuarioId) {
        validarUsuario(usuarioId);

        return transacaoRepository.findByUsuario_Id(usuarioId)
                .stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransacaoResponse buscarPorId(
            Long id,
            Long usuarioId
    ) {
        Transacao transacao = buscarEntidade(id);
        validarProprietario(transacao, usuarioId);

        return paraResponse(transacao);
    }

    public TransacaoResponse salvar(TransacaoRequest request) {
        Usuario usuario = buscarUsuario(request.getUsuarioId());
        Categoria categoria = buscarCategoria(request.getCategoriaId());

        validarCategoriaDoUsuario(categoria, request.getUsuarioId());

        Transacao transacao = new Transacao();
        preencherDados(transacao, request);
        transacao.setUsuario(usuario);
        transacao.setCategoria(categoria);

        return paraResponse(transacaoRepository.save(transacao));
    }

    public TransacaoResponse atualizar(
            Long id,
            TransacaoRequest request
    ) {
        Transacao transacao = buscarEntidade(id);
        validarProprietario(transacao, request.getUsuarioId());

        Categoria categoria = buscarCategoria(request.getCategoriaId());
        validarCategoriaDoUsuario(categoria, request.getUsuarioId());

        preencherDados(transacao, request);
        transacao.setCategoria(categoria);

        return paraResponse(transacaoRepository.save(transacao));
    }

    public void excluir(Long id, Long usuarioId) {
        Transacao transacao = buscarEntidade(id);
        validarProprietario(transacao, usuarioId);

        transacaoRepository.delete(transacao);
    }

    private void preencherDados(
            Transacao transacao,
            TransacaoRequest request
    ) {
        transacao.setValor(request.getValor());
        transacao.setDataTransacao(request.getDataTransacao());
        transacao.setTipoMovimento(request.getTipoMovimento());
        transacao.setMetodoPagamento(request.getMetodoPagamento());
        transacao.setStatus(request.getStatus());
        transacao.setDescricao(request.getDescricao());
    }

    private Transacao buscarEntidade(Long id) {
        return transacaoRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Transação não encontrada"));
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário não encontrado"));
    }

    private Categoria buscarCategoria(Long categoriaId) {
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Categoria não encontrada"));
    }

    private void validarUsuario(Long usuarioId) {
        buscarUsuario(usuarioId);
    }

    private void validarProprietario(
            Transacao transacao,
            Long usuarioId
    ) {
        if (!transacao.getUsuario().getId().equals(usuarioId)) {
            throw new OwnershipException(
                    "Transação não pertence ao usuário informado"
            );
        }
    }

    private void validarCategoriaDoUsuario(
            Categoria categoria,
            Long usuarioId
    ) {
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new OwnershipException(
                    "Categoria não pertence ao usuário informado"
            );
        }
    }

    private TransacaoResponse paraResponse(Transacao transacao) {
        return new TransacaoResponse(
                transacao.getId(),
                transacao.getValor(),
                transacao.getDataTransacao(),
                transacao.getTipoMovimento(),
                transacao.getMetodoPagamento(),
                transacao.getStatus(),
                transacao.getDescricao(),
                transacao.getCategoria().getId(),
                transacao.getUsuario().getId()
        );
    }
}