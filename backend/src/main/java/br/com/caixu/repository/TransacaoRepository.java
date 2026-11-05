package br.com.caixu.repository;

import br.com.caixu.entity.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByUsuario_Id(Long usuarioId);
    @Modifying(flushAutomatically = true)
    @Query("""
        update Transacao t
        set t.categoria = null
        where t.categoria.id = :categoriaId
        """)
    int desvincularCategoria(@Param("categoriaId") Long categoriaId);
}