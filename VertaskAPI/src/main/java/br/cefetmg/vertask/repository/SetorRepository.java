package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.Setor;

import org.jdbi.v3.core.Jdbi;
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
@RegisterBeanMapper(Setor.class)
public interface SetorRepository {

    // Listar todos os setores
    @SqlQuery("SELECT * FROM setor;")
    List<Setor> findAll();

    // Buscar setor por id
    @SqlQuery("SELECT * FROM setor WHERE id_setor = :id;")
    Setor findById(@Bind("id") Long id);

    // Inserir setor
    @SqlUpdate("""
                insert into setor (nome, descricao)
                values (:nome, :descricao);
            """)
    @GetGeneratedKeys
    Long insert(@BindBean Setor setor);

    // Método para obter uma instância do repositório usando Jdbi
    // que é uma biblioteca para acesso a banco de dados
    @Bean
    default SetorRepository getInstance(Jdbi jdbi) {
        return jdbi.onDemand(SetorRepository.class);
    }

    // Atualizar setor
    @SqlUpdate("""
        update setor
        set nome = :nome,
            descricao = :descricao
        where id_setor = :idSetor;
    """)
    int update(@BindBean Setor setor);

    // Deletar setor
    @SqlUpdate("""
        delete from setor where id_setor = :id;
    """)
    int delete(@Bind("id") Long id);
}
