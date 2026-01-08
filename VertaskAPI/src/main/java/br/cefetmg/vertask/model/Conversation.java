package br.cefetmg.vertask.model;

import lombok.*;
import java.time.LocalDateTime;
import java.math.BigInteger;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    Long id;
    Long tarefaId;
    String name;
    String description;
    Long ownerId;
    Boolean isPublic;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
