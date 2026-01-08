package br.cefetmg.vertask.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Administrador extends Usuario {
    private Long idAdministrador;

    @Override
     public String getRole() {
          return "ADMINISTRADOR";
     }
}
