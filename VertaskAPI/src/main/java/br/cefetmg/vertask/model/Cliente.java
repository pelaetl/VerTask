package br.cefetmg.vertask.model;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    private Integer id;
    private String tipo; // 'empresa' or 'pessoa'
    private String nome;
    private String nomeFantasia;
    private String cpf;   // somente dígitos (11)
    private String cnpj;  // somente dígitos (14)
    private String endereco;
    private String telefone;
    private String email;
    private BigDecimal honorario;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
