package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.TarefaUsuario;
import br.cefetmg.vertask.model.Usuario;
import br.cefetmg.vertask.model.Tarefa;
import br.cefetmg.vertask.model.StatusTarefa;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

@RegisterBeanMapper(Usuario.class)
@RegisterBeanMapper(Tarefa.class)
@RegisterBeanMapper(TarefaUsuario.class)
public interface TarefaUsuarioRepository {

    @SqlUpdate("INSERT INTO tarefaUsuario (id_tarefa, id_usuario, favorita) VALUES (:idTarefa, :idUsuario, :favorita)")
    int atribuirUsuarioATarefa(@BindBean TarefaUsuario tarefaUsuario);

    @SqlUpdate("UPDATE tarefaUsuario SET favorita = :favorita WHERE id_tarefa = :idTarefa AND id_usuario = :idUsuario")
    int favoritar(@BindBean TarefaUsuario tarefaUsuario);

    @SqlUpdate("DELETE FROM tarefaUsuario WHERE id_tarefa = :idTarefa AND id_usuario = :idUsuario")
    int removerUsuarioDaTarefa(@Bind("idTarefa") Long idTarefa, @Bind("idUsuario") Long idUsuario);

    @SqlUpdate("DELETE FROM tarefaUsuario WHERE id_tarefa = :idTarefa")
    int removerTodasAtribuicoesDaTarefa(@Bind("idTarefa") Long idTarefa);

    @SqlQuery("SELECT COUNT(*) FROM tarefaUsuario WHERE id_tarefa = :idTarefa AND id_usuario = :idUsuario")
    int verificarAtribuicao(@Bind("idTarefa") Long idTarefa, @Bind("idUsuario") Long idUsuario);

    @SqlQuery("""
                SELECT u.id_usuario as idUsuario, u.nome, u.email, u.senha
                FROM usuario u
                INNER JOIN tarefaUsuario tu ON u.id_usuario = tu.id_usuario
                WHERE tu.id_tarefa = :idTarefa
            """)
    List<Usuario> buscarUsuariosPorTarefa(@Bind("idTarefa") Long idTarefa);

    @SqlQuery("""
                SELECT t.id_tarefa as idTarefa, t.nome, t.descricao,
                       t.id_administrador as idAdministrador, t.statusTarefa as statusTarefa,
                       t.dataInicio as dataInicio, t.dataEntrega as dataEntrega, tu.favorita as favorita
                FROM tarefa t
                INNER JOIN tarefaUsuario tu ON t.id_tarefa = tu.id_tarefa
                WHERE tu.id_usuario = :idUsuario
            """)
    List<Tarefa> buscarTarefasPorUsuario(@Bind("idUsuario") Long idUsuario);

    @SqlQuery("""
                SELECT tu.id_tarefa as idTarefa, tu.id_usuario as idUsuario, tu.favorita
                FROM tarefaUsuario tu
                WHERE tu.id_usuario = :idUsuario
            """)
    List<TarefaUsuario> buscarTarefasFavoritasPorUsuario(@Bind("idUsuario") Long idUsuario);

    @SqlQuery("""
                SELECT *
                FROM tarefaUsuario
                WHERE id_tarefa = :idTarefa AND id_usuario = :idUsuario
            """)
    TarefaUsuario findById(@Bind("idTarefa") Long idTarefa, @Bind("idUsuario") Long idUsuario);

    @SqlQuery("SELECT * FROM tarefaUsuario")
    List<TarefaUsuario> findAll();

    @SqlQuery("""
                SELECT t.id_tarefa as idTarefa, t.nome, t.descricao,
                       t.id_administrador as idAdministrador, t.statusTarefa as statusTarefa,
                       t.dataInicio as dataInicio, t.dataEntrega as dataEntrega, tu.favorita as favorita
                FROM tarefa t
                INNER JOIN tarefaUsuario tu ON t.id_tarefa = tu.id_tarefa
                WHERE tu.id_usuario = :idUsuario AND tu.favorita = true
            """)
    List<Tarefa> listarTarefasFavoritasPorUsuario(@Bind("idUsuario") Long idUsuario);



    @SqlQuery("""
                SELECT u.id_usuario as idUsuario, u.nome, u.email, u.senha
                FROM usuario u
                INNER JOIN tarefaUsuario tu ON u.id_usuario = tu.id_usuario
                WHERE tu.id_tarefa = :idTarefa
            """)
    List<Usuario> buscarResponsaveisPorTarefa(@Bind("idTarefa") Long idTarefa); 

}