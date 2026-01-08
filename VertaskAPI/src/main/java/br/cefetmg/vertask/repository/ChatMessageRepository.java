package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.Mensagem;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Mensagem.class)
public interface ChatMessageRepository {

    @SqlUpdate("INSERT INTO mensagem (id_tarefa, id_remetente, nome_remetente, conteudo, data_envio) VALUES (:idTarefa, :idRemetente, :nomeRemetente, :conteudo, :dataEnvio)")
    @GetGeneratedKeys
    Long insert(@BindBean Mensagem mensagem);

    @SqlQuery("SELECT id_mensagem as idMensagem, id_tarefa as idTarefa, id_remetente as idRemetente, nome_remetente as nomeRemetente, conteudo, data_envio as dataEnvio FROM mensagem WHERE id_tarefa = :idTarefa ORDER BY data_envio ASC")
    List<Mensagem> findByTarefa(@Bind("idTarefa") Long idTarefa);
}
