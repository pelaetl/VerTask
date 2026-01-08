package br.cefetmg.vertask.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Funcionario extends Usuario {
     Long idFuncionario;
     Long idSetor;

     @Override
     public String getRole() {
          return "FUNCIONARIO";
     }
}
