package br.cefetmg.vertask.repository;

import java.util.List;
import br.cefetmg.vertask.model.Funcionario;
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
@RegisterBeanMapper(Funcionario.class)
public interface FuncionarioRepository extends Transactional<FuncionarioRepository> {

    @SqlQuery("""
        SELECT
            f.id_funcionario AS idFuncionario,
            u.id_usuario        AS idUsuario,
            u.nome,
            u.email,
            u.senha,
            u.role,
            u.dtCriacao,
            u.dtAlteracao,
            f.id_setor          AS idSetor
        FROM funcionario f
        JOIN usuario u ON f.id_funcionario = u.id_usuario
    """)
    List<Funcionario> findAll();

    @SqlQuery("""
        SELECT
            f.id_funcionario AS idFuncionario,
            u.id_usuario        AS idUsuario,
            u.nome,
            u.email,
            u.senha,
            u.role,
            u.dtCriacao,
            u.dtAlteracao,
            f.id_setor          AS idSetor
        FROM funcionario f
        JOIN usuario u ON f.id_funcionario = u.id_usuario
        WHERE f.id_funcionario = :id
    """)
    Funcionario findById(@Bind("id") Long id);

    @Transaction
    default Long insert(@BindBean Funcionario funcionario) {
        Long idUsuario = insertUsuario(funcionario.getNome(), funcionario.getEmail(), funcionario.getSenha());
        insertFuncionario(idUsuario, funcionario.getIdSetor());
        return idUsuario;
    }

    @SqlUpdate("INSERT INTO usuario (nome, email, senha, role, dtAlteracao, dtCriacao) VALUES (:nome, :email, :senha, 'funcionario', NULL, NOW())")
    @GetGeneratedKeys
    Long insertUsuario(@Bind("nome") String nome, @Bind("email") String email, @Bind("senha") String senha);

    @SqlUpdate("INSERT INTO funcionario (id_funcionario, id_setor) VALUES (:id_funcionario, :id_setor)")
    void insertFuncionario(@Bind("id_funcionario") Long idFuncionario, @Bind("id_setor") Long idSetor);

    @Transaction
    default int update(@BindBean Funcionario funcionario) {
        int u = updateUsuario(funcionario.getIdFuncionario(), funcionario.getNome(), funcionario.getEmail(), funcionario.getSenha());
        int f = updateFuncionario(funcionario.getIdFuncionario(), funcionario.getIdSetor());
        return (u > 0 && f > 0) ? 1 : 0;
    }

    // ajustar bind para id_usuario e atualizar dtAlteracao
    @SqlUpdate("UPDATE usuario SET nome = :nome, email = :email, senha = :senha, dtAlteracao = NOW() WHERE id_usuario = :id_usuario")
    int updateUsuario(@Bind("id_usuario") Long id, @Bind("nome") String nome, @Bind("email") String email, @Bind("senha") String senha);

    // usar nomes de coluna snake_case consistentes
    @SqlUpdate("UPDATE funcionario SET id_setor = :id_setor WHERE id_funcionario = :id_funcionario")
    int updateFuncionario(@Bind("id_funcionario") Long idFuncionario, @Bind("id_setor") Long idSetor);

    @Transaction
    default int delete(@Bind("id") Long id) {
        int f = deleteFuncionario(id);
        int u = deleteUsuario(id);
        return (f > 0 && u > 0) ? 1 : 0;
    }

    @SqlUpdate("DELETE FROM funcionario WHERE id_funcionario = :id_funcionario")
    int deleteFuncionario(@Bind("id_funcionario") Long idFuncionario);

    @SqlUpdate("DELETE FROM usuario WHERE id_usuario = :id_usuario")
    int deleteUsuario(@Bind("id_usuario") Long idUsuario);
}