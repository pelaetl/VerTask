package br.cefetmg.vertask.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mensagem {
    private Long idMensagem;
    private Long idTarefa;
    private Long idRemetente;
    private String nomeRemetente;
    private String conteudo;
    private LocalDateTime dataEnvio;
}
