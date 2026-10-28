package br.com.caixu.repository;

import br.com.caixu.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuario_Id(Long usuarioId);
}