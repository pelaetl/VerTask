package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.ConversationMessage;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.core.Jdbi;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(ConversationMessage.class)
public interface ConversationMessageRepository {

    @SqlQuery("SELECT * FROM conversation_messages WHERE id = :id;")
    ConversationMessage findById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM conversation_messages WHERE conversation_id = :conversationId ORDER BY created_at ASC;")
    List<ConversationMessage> findByConversationId(@Bind("conversationId") Long conversationId);

    @SqlUpdate("""
        INSERT INTO conversation_messages (conversation_id, sender_id, content, reply_to_id)
        VALUES (:conversationId, :senderId, :content, :replyToId);
    """)
    @GetGeneratedKeys
    Long insert(@BindBean ConversationMessage msg);

    @SqlUpdate("UPDATE conversation_messages SET content = :content, edited_at = NOW() WHERE id = :id")
    int updateContent(@BindBean ConversationMessage msg);

    @SqlUpdate("UPDATE conversation_messages SET deleted_at = NOW() WHERE id = :id")
    int softDelete(@Bind("id") Long id);

    @Bean
    default ConversationMessageRepository getInstance(Jdbi jdbi) {
        return jdbi.onDemand(ConversationMessageRepository.class);
    }
}
