package br.cefetmg.vertask.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMember {
    Long conversationId;
    Long userId;
    String role;
    LocalDateTime joinedAt;
    Long lastReadMessageId;
    String notifications;
}
