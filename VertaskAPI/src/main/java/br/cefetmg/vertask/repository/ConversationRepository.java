package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.Conversation;
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
@RegisterBeanMapper(Conversation.class)
public interface ConversationRepository {

    @SqlQuery("SELECT * FROM conversations WHERE id = :id;")
    Conversation findById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM conversations WHERE tarefa_id = :tarefaId;")
    Conversation findByTarefaId(@Bind("tarefaId") Long tarefaId);

    @SqlUpdate("""
        insert into conversations (tarefa_id, name, description, owner_id, is_public)
        values (:tarefaId, :name, :description, :ownerId, :isPublic);
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Conversation conv);

    @SqlUpdate("""
        update conversations set name = :name, description = :description, is_public = :isPublic
        where id = :id;
    """)
    int update(@BindBean Conversation conv);

    @Bean
    default ConversationRepository getInstance(Jdbi jdbi) {
        return jdbi.onDemand(ConversationRepository.class);
    }
}
