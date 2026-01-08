package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Mensagem;
import br.cefetmg.vertask.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tarefa")
public class ChatRestController {

    private final ChatService chatService;

    public ChatRestController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{id}/mensagens")
    public ResponseEntity<List<Mensagem>> listarMensagens(@PathVariable("id") Long tarefaId) {
        List<Mensagem> mensagens = chatService.getMensagensPorTarefa(tarefaId);
        return ResponseEntity.ok(mensagens);
    }
}
