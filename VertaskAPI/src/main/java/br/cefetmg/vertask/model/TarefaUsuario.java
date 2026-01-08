package br.cefetmg.vertask.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarefaUsuario {
    private Long idTarefa;
    private Long idUsuario;
    private Boolean favorita = false;

}
