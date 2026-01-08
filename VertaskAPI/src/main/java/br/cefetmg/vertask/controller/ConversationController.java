package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Conversation;
import br.cefetmg.vertask.model.ConversationMessage;
import br.cefetmg.vertask.repository.ConversationRepository;
import br.cefetmg.vertask.repository.ConversationMessageRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversa")
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;

    public ConversationController(ConversationRepository conversationRepository, ConversationMessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    // get or create conversation for a task
    @PostMapping("/tarefa/{tarefaId}")
    public ResponseEntity<Conversation> getOrCreateForTarefa(@PathVariable Long tarefaId, @RequestBody(required = false) Conversation payload) {
        Conversation conv = conversationRepository.findByTarefaId(tarefaId);
        if (conv != null) {
            return ResponseEntity.ok(conv);
        }
        Conversation toInsert = new Conversation();
        toInsert.setTarefaId(tarefaId);
        toInsert.setName(payload != null ? payload.getName() : ("Tarefa " + tarefaId + " Chat"));
        toInsert.setDescription(payload != null ? payload.getDescription() : null);
        toInsert.setOwnerId(payload != null ? payload.getOwnerId() : null);
        toInsert.setIsPublic(payload != null ? payload.getIsPublic() : false);
        Long id = conversationRepository.insert(toInsert);
        toInsert.setId(id);
        return ResponseEntity.ok(toInsert);
    }

    @GetMapping("/{conversationId}/mensagens")
    public ResponseEntity<List<ConversationMessage>> listarMensagens(@PathVariable Long conversationId) {
        List<ConversationMessage> msgs = messageRepository.findByConversationId(conversationId);
        return ResponseEntity.ok(msgs);
    }

    @PostMapping("/{conversationId}/mensagens")
    public ResponseEntity<ConversationMessage> postarMensagem(@PathVariable Long conversationId, @RequestBody ConversationMessage body) {
        body.setConversationId(conversationId);
        Long id = messageRepository.insert(body);
        body.setId(id);
        return ResponseEntity.ok(body);
    }

}
