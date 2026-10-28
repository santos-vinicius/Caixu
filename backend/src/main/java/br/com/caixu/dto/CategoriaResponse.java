package br.com.caixu.dto;

public class CategoriaResponse {

    private Long id;
    private String nomeCategoria;
    private String tipoCategoria;
    private Long usuarioId;

    public CategoriaResponse(
            Long id,
            String nomeCategoria,
            String tipoCategoria,
            Long usuarioId
    ) {
        this.id = id;
        this.nomeCategoria = nomeCategoria;
        this.tipoCategoria = tipoCategoria;
        this.usuarioId = usuarioId;
    }

    public Long getId() {
        return id;
    }

    public String getNomeCategoria() {
        return nomeCategoria;
    }

    public String getTipoCategoria() {
        return tipoCategoria;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }
}