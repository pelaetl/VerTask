package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.scheduler.TarefaLembreteScheduler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para testes e gerenciamento de lembretes de tarefas
 */
@RestController
@RequestMapping("/api/v1/lembretes")
@CrossOrigin(origins = "*")
@Slf4j
public class LembreteController {

    @Autowired
    private TarefaLembreteScheduler tarefaLembreteScheduler;

    /**
     * Endpoint para forçar verificação manual de tarefas próximas do prazo
     * Útil para testes
     * POST /api/v1/lembretes/verificar
     */
    @PostMapping("/verificar")
    public ResponseEntity<String> verificarManualmente() {
        try {
            log.info("Verificação manual de tarefas próximas do prazo solicitada");
            tarefaLembreteScheduler.verificarTarefasProximasPrazo();
            return ResponseEntity.ok("Verificação executada com sucesso! Confira os logs para ver os resultados.");
        } catch (Exception e) {
            log.error("Erro ao executar verificação manual: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("Erro ao executar verificação: " + e.getMessage());
        }
    }

    /**
     * Endpoint para limpar cache de notificações
     * Útil para testes (permite reenviar emails da mesma tarefa)
     * POST /api/v1/lembretes/limpar-cache
     */
    @PostMapping("/limpar-cache")
    public ResponseEntity<String> limparCache() {
        try {
            log.info("Limpeza manual do cache de notificações solicitada");
            tarefaLembreteScheduler.limparCacheNotificacoes();
            return ResponseEntity.ok("Cache de notificações limpo com sucesso!");
        } catch (Exception e) {
            log.error("Erro ao limpar cache: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("Erro ao limpar cache: " + e.getMessage());
        }
    }
}
