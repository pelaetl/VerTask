package br.cefetmg.vertask.model;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {
    Long idEmpresa;
    String nome;
    String cnpj;
    String fantasia;
    String endereco;
    String telefone;
    String email;
    BigDecimal honorario;
}
