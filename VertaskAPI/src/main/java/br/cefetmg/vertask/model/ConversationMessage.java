package br.cefetmg.vertask.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMessage {
    Long id;
    Long conversationId;
    Long senderId;
    String content;
    LocalDateTime createdAt;
    LocalDateTime editedAt;
    LocalDateTime deletedAt;
    Long replyToId;
}
