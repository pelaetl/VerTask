package br.cefetmg.vertask.model;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Tarefa {
    private Long idTarefa;
    private String nome;
    private String descricao;
    private Long idAdministrador; // ID do Administrador que criou a tarefa
    private Integer clienteId; // referencia para cliente.id (pessoa ou empresa)
    private StatusTarefa statusTarefa; // Ex: "Pendente", "Em Progresso", "Concluída"
    private LocalDateTime dataInicio;
    private LocalDateTime dataEntrega;
    private List<Long> usuariosIds; // Lista de IDs dos usuários atribuídos à tarefa
    // Metadados do documento anexado (opcional)
    private String documentoNome;
    private String documentoMime;
    private Long documentoTamanho;
    private String documentoPath;
    // Observação livre registrada quando a tarefa é concluída
    private String observacao;
    // Se true, o administrador receberá notificações por e-mail quando a tarefa for iniciada e concluída
    private boolean notifyAdmin = false;
    // Se true, a tarefa está marcada como favorita/prioridade para o usuário (vem de tarefaUsuario)
    private boolean favorita = false;
    

}
