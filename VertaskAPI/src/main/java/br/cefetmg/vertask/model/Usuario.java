package br.cefetmg.vertask.model;

// import lombok.*;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor

// @Builder
// @EqualsAndHashCode(of = "idUsuario")

// public class Usuario {
//      private Long idUsuario;
//      private String nome;
//      private String email;
//      private String senha;
//      private String tipo;
// }

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of = "idUsuario")
public class Usuario implements UserDetails {
    private Long idUsuario;
    private String nome;
    private String email;
    private String foto;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    private String role;

    private LocalDateTime dtCriacao;
    private LocalDateTime dtAlteracao;

    // public abstract String getRole();

    // DO
    // CHATTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTttttttttttttttttttttt
    // @Override
    // public Collection<? extends GrantedAuthority> getAuthorities() {
    // String roleValue = this.role;
    // if (roleValue == null || roleValue.isBlank()) {
    // roleValue = "USER";
    // }

    // // Normaliza o valor para evitar erros de case-sensitivity na validação de
    // roles
    // String normalizedRole = roleValue.trim().toUpperCase();

    // return List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole));
    // }

    // DOUGLAAAAAAAAAAAAAAAAAAAAAAAAAAASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSAs
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Normalize role value to avoid case-sensitivity or different naming (e.g. "administrador" vs "ADMIN")
        String roleValue = this.getRole();
        if (roleValue == null || roleValue.isBlank()) {
            roleValue = "USER";
        }
        roleValue = roleValue.trim().toUpperCase();
        return List.of(new SimpleGrantedAuthority("ROLE_" + roleValue));
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return this.senha;
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return this.email;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @JsonIgnore
    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getPrimeiroNome() {
        String[] nomes = this.nome.split(" ");
        if (nomes.length > 1) {
            return nomes[0];
        }
        return this.nome;
    }
}
