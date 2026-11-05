package br.com.caixu.repository;

import br.com.caixu.entity.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByUsuario_Id(Long usuarioId);

    boolean existsByCategoria_IdAndTipoMovimentoNot(Long categoriaId, String tipoMovimento);

    @Modifying(flushAutomatically = true)
    @Query("delete from Transacao t where t.usuario.id = :usuarioId")
    int excluirPorUsuario(@Param("usuarioId") Long usuarioId);

    @Modifying(flushAutomatically = true)
    @Query("""
        delete from Transacao t where t.usuario.id = :usuarioId
        and t.grupoId = :grupoId and t.numeroOcorrencia >= :numero
        """)
    int excluirSequencia(@Param("usuarioId") Long usuarioId, @Param("grupoId") String grupoId,
                         @Param("numero") Integer numero);
    @Modifying(flushAutomatically = true)
    @Query("""
        update Transacao t
        set t.categoria = null
        where t.categoria.id = :categoriaId
        """)
    int desvincularCategoria(@Param("categoriaId") Long categoriaId);
}
