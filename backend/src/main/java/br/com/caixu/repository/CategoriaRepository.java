package br.com.caixu.repository;

import br.com.caixu.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuario_Id(Long usuarioId);

    @Modifying(flushAutomatically = true)
    @Query("delete from Categoria c where c.usuario.id = :usuarioId")
    int excluirPorUsuario(@Param("usuarioId") Long usuarioId);
}
