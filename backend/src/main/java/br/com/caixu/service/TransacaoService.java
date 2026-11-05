package br.com.caixu.service;

import br.com.caixu.dto.TransacaoRequest;
import br.com.caixu.dto.TransacaoResponse;
import br.com.caixu.dto.TransacaoLoteRequest;
import br.com.caixu.exception.BusinessRuleException;
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
import java.util.ArrayList;
import java.util.Objects;
import java.util.UUID;

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
        Categoria categoria = resolverCategoria(
                request.getCategoriaId(),
                request.getUsuarioId(), request.getTipoMovimento()
        );

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

        Categoria categoria = resolverCategoria(
                request.getCategoriaId(),
                request.getUsuarioId(), request.getTipoMovimento()
        );

        preencherDados(transacao, request);
        transacao.setCategoria(categoria);

        return paraResponse(transacaoRepository.save(transacao));
    }

    public void excluir(Long id, Long usuarioId) {
        excluir(id, usuarioId, "SOMENTE_ESTA");
    }

    public void excluir(Long id, Long usuarioId, String escopo) {
        Transacao transacao = buscarEntidade(id);
        validarProprietario(transacao, usuarioId);
        if (!List.of("SOMENTE_ESTA", "ESTA_E_PROXIMAS").contains(escopo)) {
            throw new BusinessRuleException("Escopo de exclusão inválido.");
        }
        if ("ESTA_E_PROXIMAS".equals(escopo) && transacao.getGrupoId() != null) {
            transacaoRepository.excluirSequencia(usuarioId, transacao.getGrupoId(),
                    transacao.getNumeroOcorrencia());
        } else {
            transacaoRepository.delete(transacao);
        }
    }

    public List<TransacaoResponse> salvarLote(TransacaoLoteRequest lote, Long usuarioId) {
        List<TransacaoRequest> itens = lote.transacoes();
        boolean unica = "UNICA".equals(lote.modalidade());
        if ((unica && (itens.size() != 1 || lote.frequencia() != null))
                || (!unica && lote.frequencia() == null)
                || ("PARCELADA".equals(lote.modalidade()) && !"MENSAL".equals(lote.frequencia()))) {
            throw new BusinessRuleException("Confira a modalidade, a frequência e a quantidade.");
        }
        Usuario usuario = buscarUsuario(usuarioId);
        TransacaoRequest primeira = itens.get(0);
        Categoria categoria = resolverCategoria(primeira.getCategoriaId(), usuarioId,
                primeira.getTipoMovimento());
        String grupoId = unica ? null : UUID.randomUUID().toString();
        List<Transacao> registros = new ArrayList<>();
        for (int indice = 0; indice < itens.size(); indice++) {
            TransacaoRequest item = itens.get(indice);
            var dataEsperada = "SEMANAL".equals(lote.frequencia())
                    ? primeira.getDataTransacao().plusWeeks(indice)
                    : primeira.getDataTransacao().plusMonths(indice);
            if (!Objects.equals(item.getTipoMovimento(), primeira.getTipoMovimento())
                    || !Objects.equals(item.getCategoriaId(), primeira.getCategoriaId())
                    || !item.getDataTransacao().equals(dataEsperada)
                    || ("RECORRENTE".equals(lote.modalidade())
                        && item.getValor().compareTo(primeira.getValor()) != 0)) {
                throw new BusinessRuleException("As ocorrências devem manter o tipo, a categoria e o período informado.");
            }
            Transacao transacao = new Transacao();
            preencherDados(transacao, item);
            transacao.setUsuario(usuario);
            transacao.setCategoria(categoria);
            transacao.setModalidade(lote.modalidade());
            transacao.setGrupoId(grupoId);
            transacao.setNumeroOcorrencia(unica ? null : indice + 1);
            transacao.setTotalOcorrencias(unica ? null : itens.size());
            transacao.setFrequencia(lote.frequencia());
            registros.add(transacao);
        }
        return transacaoRepository.saveAll(registros).stream().map(this::paraResponse).toList();
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
                transacao.getCategoria() == null
                        ? null
                        : transacao.getCategoria().getId(),
                transacao.getUsuario().getId(),
                transacao.getModalidade(), transacao.getGrupoId(),
                transacao.getNumeroOcorrencia(), transacao.getTotalOcorrencias(),
                transacao.getFrequencia(), transacao.getCriadoEm()
        );
    }

    private Categoria resolverCategoria(Long categoriaId, Long usuarioId, String tipoMovimento) {
        if (categoriaId == null) {
            return null;
        }

        Categoria categoria = buscarCategoria(categoriaId);
        validarCategoriaDoUsuario(categoria, usuarioId);
        if (!categoria.getTipoCategoria().equals(tipoMovimento)) {
            throw new BusinessRuleException("A categoria deve ter o mesmo tipo do lançamento.");
        }

        return categoria;
    }
}