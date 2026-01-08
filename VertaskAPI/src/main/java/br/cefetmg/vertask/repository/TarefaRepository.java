package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.Tarefa;

import org.jdbi.v3.core.Jdbi;
import java.time.LocalDate;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
@RegisterBeanMapper(Tarefa.class)
public interface TarefaRepository {

     // Listar todos os tarefas
    @SqlQuery("SELECT * FROM tarefa;")
    List<Tarefa> findAll();

    // Buscar tarefa por id
    @SqlQuery("SELECT * FROM tarefa WHERE id_tarefa = :id;")
    Tarefa findById(@Bind("id") Long id);

    // Inserir tarefa
    @SqlUpdate("""
                insert into tarefa (nome, descricao, dataInicio, dataEntrega, statusTarefa, id_administrador,
                cliente_id, notify_admin, documento_nome, documento_mime, documento_tamanho, documento_path, observacao)
                values (:nome, :descricao, :dataInicio, :dataEntrega, :statusTarefa, :idAdministrador,
                :clienteId, :notifyAdmin, :documentoNome, :documentoMime, :documentoTamanho, :documentoPath, :observacao);
            """)
    @GetGeneratedKeys
    Long insert(@BindBean Tarefa tarefa);

    // Método para obter uma instância do repositório usando Jdbi
    // que é uma biblioteca para acesso a banco de dados
    @Bean
    default TarefaRepository getInstance(Jdbi jdbi) {
        return jdbi.onDemand(TarefaRepository.class);
    }

    // Atualizar tarefa
    @SqlUpdate("""
        update tarefa
        set nome = :nome,
            descricao = :descricao,
            dataEntrega = :dataEntrega,
        statusTarefa = :statusTarefa,
        cliente_id = :clienteId,
        notify_admin = :notifyAdmin,
        observacao = :observacao
        where id_tarefa = :idTarefa;
    """)
    int update(@BindBean Tarefa tarefa);

    // Deletar tarefa
    @SqlUpdate("""
        delete from tarefa where id_tarefa = :id;
    """)
    int delete(@Bind("id") Long id);

    @SqlQuery("SELECT COUNT(*) FROM tarefa WHERE id_tarefa = :id;")
    int countById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM tarefa WHERE id_tarefa = :id;")
    Tarefa findByData(@Bind("id") Long id);

    //faça o findByDataEntrega agora
    @SqlQuery("SELECT * FROM tarefa WHERE data_entrega = :dataEntrega;")
    List<Tarefa> findByDataEntrega(@Bind("dataEntrega") LocalDate dataEntrega);

    //faça o count de tarefa em andamento
    @SqlQuery("SELECT COUNT(*) FROM tarefa WHERE statusTarefa = 'EM_ANDAMENTO';")
    int countByAndamento();

    @SqlQuery("SELECT COUNT(*) FROM tarefa WHERE statusTarefa = 'CONCLUIDA';")
    int countByConcluida();

    @SqlQuery("SELECT COUNT(*) FROM tarefa WHERE statusTarefa = 'ATRASADO';")
    int countByAtrasada();

    @SqlQuery("SELECT COUNT(*) FROM tarefa WHERE statusTarefa = 'PENDENTE';")
    int countByPendente();

    //count de tarefa em andamento por id usuario mas o id usuario fica na tabela tarefausuario que tem o idusuario e idtarefa
    @SqlQuery("""
        SELECT COUNT(*) FROM tarefausuario tu JOIN tarefa t ON tu.id_tarefa = t.id_tarefa
        WHERE tu.id_usuario = :idUsuario AND t.statusTarefa = 'EM_ANDAMENTO';
    """)
    int countByAndamentoPorUsuario(@Bind("idUsuario") Long idUsuario);

    @SqlQuery("""
        SELECT COUNT(*) FROM tarefausuario tu JOIN tarefa t ON tu.id_tarefa = t.id_tarefa
        WHERE tu.id_usuario = :idUsuario AND t.statusTarefa = 'CONCLUIDA';
    """)
    int countByConcluidaPorUsuario(@Bind("idUsuario") Long idUsuario);

    @SqlQuery("""
        SELECT COUNT(*) FROM tarefausuario tu JOIN tarefa t ON tu.id_tarefa = t.id_tarefa
        WHERE tu.id_usuario = :idUsuario AND t.statusTarefa = 'ATRASADO';
    """)
    int countByAtrasadaPorUsuario(@Bind("idUsuario") Long idUsuario);

    @SqlQuery("""
        SELECT COUNT(*) FROM tarefausuario tu JOIN tarefa t ON tu.id_tarefa = t.id_tarefa
        WHERE tu.id_usuario = :idUsuario AND t.statusTarefa = 'PENDENTE';
    """)
    int countByPendentePorUsuario(@Bind("idUsuario") Long idUsuario);


}
