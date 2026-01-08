package br.cefetmg.vertask.repository;

import java.util.List;
import br.cefetmg.vertask.model.Administrador;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.transaction.Transaction;
import org.jdbi.v3.sqlobject.transaction.Transactional;
import org.springframework.stereotype.Repository;

@Repository
@RegisterBeanMapper(Administrador.class)
public interface AdministradorRepository extends Transactional<AdministradorRepository> {

    // Listar todos os administradors (join com usuario e setor)
    @SqlQuery("""
        SELECT
            f.id_administrador AS idAdministrador,
            u.id_usuario        AS idUsuario,
            u.nome,
            u.email,
            u.senha,
            u.role,
            u.dtCriacao,
            u.dtAlteracao
        FROM administrador f
        JOIN usuario u ON f.id_administrador = u.id_usuario
    """)
    List<Administrador> findAll();

    // Buscar administrador por id
    @SqlQuery("""
        SELECT
            f.id_administrador AS idAdministrador,
            u.id_usuario        AS idUsuario,
            u.nome,
            u.email,
            u.senha,
            u.role,
            u.dtCriacao,
            u.dtAlteracao
        FROM administrador f
        JOIN usuario u ON f.id_administrador = u.id_usuario
        WHERE f.id_administrador = :id
    """)
    Administrador findById(@Bind("id") Long id);

    // Inserir administrador (dois passos: usuario e administrador)
    @Transaction
    default Long insert(@BindBean Administrador administrador) {
        // 1. Inserir em usuario (define role e timestamps)
        Long idUsuario = insertUsuario(administrador.getNome(), administrador.getEmail(), administrador.getSenha());
        // 2. Inserir em administrador (aponta para o id do usuario)
        insertAdministrador(idUsuario);
        return idUsuario;
    }

    @SqlUpdate("INSERT INTO usuario (nome, email, senha, role, dtAlteracao, dtCriacao) VALUES (:nome, :email, :senha, 'administrador', NULL, NOW())")
    @GetGeneratedKeys
    Long insertUsuario(@Bind("nome") String nome, @Bind("email") String email, @Bind("senha") String senha);

    @SqlUpdate("INSERT INTO administrador (id_administrador) VALUES (:id_administrador)")
    void insertAdministrador(@Bind("id_administrador") Long idAdministrador);

    // Atualizar administrador (atualiza usuario e administrador)
    @Transaction
    default int update(@BindBean Administrador administrador) {
        // Administrador doesn't hold additional columns besides the FK to usuario in your schema,
        // so updating the usuario row is sufficient.
        int u = updateUsuario(administrador.getIdAdministrador(), administrador.getNome(), administrador.getEmail(), administrador.getSenha());
        return (u > 0) ? 1 : 0;
    }

    @SqlUpdate("UPDATE usuario SET nome = :nome, email = :email, senha = :senha, dtAlteracao = NOW() WHERE id_usuario = :id")
    int updateUsuario(@Bind("id") Long id, @Bind("nome") String nome, @Bind("email") String email, @Bind("senha") String senha);

    // Deletar administrador (deleta de administrador e usuario)
    @Transaction
    default int delete(@Bind("id") Long id) {
        int f = deleteAdministrador(id);
        int u = deleteUsuario(id);
        return (f > 0 && u > 0) ? 1 : 0;
    }

    @SqlUpdate("DELETE FROM administrador WHERE id_administrador = :id")
    int deleteAdministrador(@Bind("id") Long id);

    @SqlUpdate("DELETE FROM usuario WHERE id_usuario = :id")
    int deleteUsuario(@Bind("id") Long id);
}

