package br.cefetmg.vertask.scheduler;

import br.cefetmg.vertask.model.Tarefa;
import br.cefetmg.vertask.model.Usuario;
import br.cefetmg.vertask.repository.TarefaRepository;
import br.cefetmg.vertask.repository.TarefaUsuarioRepository;
import br.cefetmg.vertask.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Scheduler responsável por verificar periodicamente tarefas próximas do prazo
 * e enviar emails de lembrete aos usuários responsáveis
 */
@Component
@Slf4j
public class TarefaLembreteScheduler {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private TarefaUsuarioRepository tarefaUsuarioRepository;

    @Autowired
    private EmailService emailService;

    // Armazena IDs de tarefas que já receberam notificação hoje
    private Set<Long> tarefasNotificadasHoje = new HashSet<>();

    /**
     * Executa a cada 30 minutos para verificar tarefas próximas do prazo (3 horas antes)
     * Cron: segundos minutos horas dia mês dia-da-semana
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void verificarTarefasProximasPrazo() {
        log.info("Iniciando verificação de tarefas próximas do prazo (3 horas antes)...");
        
        try {
            LocalDateTime agora = LocalDateTime.now();
            
            // Limpar lista de notificações às 00:00 (meia-noite)
            if (agora.getHour() == 0 && agora.getMinute() < 30) {
                tarefasNotificadasHoje.clear();
                log.info("Lista de tarefas notificadas foi limpa para o novo dia");
            }
            
            // Buscar todas as tarefas
            List<Tarefa> todasTarefas = tarefaRepository.findAll();
            int tarefasVerificadas = 0;
            int emailsEnviados = 0;
            
            for (Tarefa tarefa : todasTarefas) {
                // Verificar se a tarefa tem prazo de entrega e não está concluída
                if (tarefa.getDataEntrega() != null && 
                    tarefa.getStatusTarefa() != null &&
                    tarefa.getStatusTarefa() != br.cefetmg.vertask.model.StatusTarefa.CONCLUIDA &&
                    tarefa.getStatusTarefa() != br.cefetmg.vertask.model.StatusTarefa.CONCLUIDA_ATRASADA) {
                    
                    tarefasVerificadas++;
                    
                    // Calcular diferença em minutos entre agora e o prazo
                    long minutosRestantes = ChronoUnit.MINUTES.between(agora, tarefa.getDataEntrega());
                    
                    // Se faltam entre 2h45min e 3h15min (165 a 195 minutos) - janela de 30 minutos
                    if (minutosRestantes >= 165 && minutosRestantes <= 195) {
                        
                        // Verificar se já foi enviada notificação hoje para esta tarefa
                        if (tarefasNotificadasHoje.contains(tarefa.getIdTarefa())) {
                            log.debug("Tarefa {} já foi notificada hoje, pulando...", tarefa.getIdTarefa());
                            continue;
                        }
                        
                        // Buscar usuários responsáveis pela tarefa
                        List<Usuario> responsaveis = tarefaUsuarioRepository.buscarResponsaveisPorTarefa(tarefa.getIdTarefa());
                        
                        if (responsaveis != null && !responsaveis.isEmpty()) {
                            // Formatar data de entrega
                            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");
                            String prazoFormatado = tarefa.getDataEntrega().format(formatter);
                            
                            // Enviar email para cada responsável
                            for (Usuario usuario : responsaveis) {
                                try {
                                    String resultado = emailService.enviarEmailLembretePrazo(
                                        usuario.getEmail(),
                                        tarefa.getNome(),
                                        tarefa.getDescricao(),
                                        prazoFormatado
                                    );
                                    
                                    log.info("Lembrete enviado para {} sobre tarefa '{}' - {}", 
                                        usuario.getEmail(), tarefa.getNome(), resultado);
                                    emailsEnviados++;
                                    
                                } catch (Exception e) {
                                    log.error("Erro ao enviar lembrete para {} sobre tarefa {}: {}", 
                                        usuario.getEmail(), tarefa.getNome(), e.getMessage());
                                }
                            }
                            
                            // Marcar tarefa como notificada hoje
                            tarefasNotificadasHoje.add(tarefa.getIdTarefa());
                            
                            log.info("Lembretes enviados para tarefa '{}' (ID: {}) - {} responsáveis notificados", 
                                tarefa.getNome(), tarefa.getIdTarefa(), responsaveis.size());
                        }
                    }
                }
            }
            
            log.info("Verificação concluída. {} tarefas verificadas, {} emails enviados.", 
                tarefasVerificadas, emailsEnviados);
            
        } catch (Exception e) {
            log.error("Erro ao verificar tarefas próximas do prazo: {}", e.getMessage(), e);
        }
    }

    /**
     * Método para teste manual - pode ser removido em produção
     * Limpa o cache de notificações para permitir reenvio
     */
    public void limparCacheNotificacoes() {
        tarefasNotificadasHoje.clear();
        log.info("Cache de notificações foi limpo manualmente");
    }
}
