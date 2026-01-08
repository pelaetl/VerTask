package br.cefetmg.vertask.service;

import br.cefetmg.vertask.model.ChatMessage;
import br.cefetmg.vertask.model.Mensagem;
import br.cefetmg.vertask.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository repository;

    public ChatService(ChatMessageRepository repository) {
        this.repository = repository;
    }

    public Mensagem saveFromChatMessage(ChatMessage msg) {
        Mensagem db = new Mensagem();
        db.setIdTarefa(msg.getTarefaId());
        db.setIdRemetente(msg.getSenderId());
        db.setNomeRemetente(msg.getSenderName());
        db.setConteudo(msg.getContent());
        db.setDataEnvio(msg.getTimestamp() != null ? msg.getTimestamp() : LocalDateTime.now());

        Long id = repository.insert(db);
        db.setIdMensagem(id);
        return db;
    }

    public List<Mensagem> getMensagensPorTarefa(Long tarefaId) {
        return repository.findByTarefa(tarefaId);
    }
}
