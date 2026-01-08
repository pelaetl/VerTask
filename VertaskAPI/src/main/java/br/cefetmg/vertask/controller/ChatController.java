package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.ChatMessage;
import br.cefetmg.vertask.model.Mensagem;
import br.cefetmg.vertask.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @MessageMapping("/tarefa/{id}/chat")
    public void chatMessage(@DestinationVariable("id") Long tarefaId, ChatMessage message) {
        // ensure tarefaId set and timestamp
        message.setTarefaId(tarefaId);
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }

        // persist message to DB
        Mensagem saved = chatService.saveFromChatMessage(message);

        // prepare broadcast payload that includes generated id (frontend expects 'id' or 'id' property)
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", saved.getIdMensagem());
        payload.put("tarefaId", saved.getIdTarefa());
        payload.put("senderId", saved.getIdRemetente());
        payload.put("senderName", saved.getNomeRemetente());
        payload.put("content", saved.getConteudo());
        payload.put("timestamp", saved.getDataEnvio());
        // if the client sent a tempId (used for optimistic UI), include it in the broadcast
        if (message.getTempId() != null) {
            payload.put("tempId", message.getTempId());
        }

        // broadcast to subscribers of the tarefa topic
        String destination = "/topic/tarefa/" + tarefaId;
        messagingTemplate.convertAndSend(destination, payload);
    }
}
