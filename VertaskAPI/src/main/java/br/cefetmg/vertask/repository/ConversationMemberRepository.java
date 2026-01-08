package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.ConversationMember;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.core.Jdbi;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(ConversationMember.class)
public interface ConversationMemberRepository {

    @SqlQuery("SELECT * FROM conversation_members WHERE conversation_id = :conversationId")
    List<ConversationMember> findByConversationId(@Bind("conversationId") Long conversationId);

    @SqlUpdate("INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, last_read_message_id, notifications) VALUES (:conversationId, :userId, :role, NOW(), :lastReadMessageId, :notifications)")
    int addMember(@BindBean ConversationMember member);

    @SqlUpdate("DELETE FROM conversation_members WHERE conversation_id = :conversationId AND user_id = :userId")
    int removeMember(@Bind("conversationId") Long conversationId, @Bind("userId") Long userId);

    @SqlQuery("SELECT COUNT(*) FROM conversation_members WHERE conversation_id = :conversationId AND user_id = :userId")
    int exists(@Bind("conversationId") Long conversationId, @Bind("userId") Long userId);

    default ConversationMemberRepository getInstance(Jdbi jdbi) {
        return jdbi.onDemand(ConversationMemberRepository.class);
    }
}
