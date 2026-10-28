package br.com.caixu.dto;

public class LoginResponse {

    private Long usuarioId;
    private String nome;
    private String email;

    public LoginResponse(
            Long usuarioId,
            String nome,
            String email
    ) {
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.email = email;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }
}