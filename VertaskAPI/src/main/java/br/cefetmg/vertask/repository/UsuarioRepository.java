package br.cefetmg.vertask.repository;

import java.util.List;
import br.cefetmg.vertask.model.Usuario;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

@Repository
@RegisterBeanMapper(Usuario.class)
public interface UsuarioRepository {

    @SqlQuery("SELECT id_usuario AS idUsuario, nome, email, senha, role, foto, dtCriacao, dtAlteracao FROM usuario")
    List<Usuario> findAll();

    @SqlQuery("SELECT id_usuario AS idUsuario, nome, email, senha, role, foto, dtCriacao, dtAlteracao FROM usuario WHERE email = :email")
    public Usuario getByEmail(@Bind("email") String email);

    @SqlQuery("SELECT id_usuario AS idUsuario, nome, email, senha, role, foto, dtCriacao, dtAlteracao FROM usuario WHERE id_usuario = :id")
    Usuario findById(@Bind("id") Long id);

    // INSERT com binds explícitos para evitar problemas de BindBean
    // @SqlUpdate("INSERT INTO usuario (nome, email, senha, tipo) VALUES (:nome, :email, :senha, :tipo)")
    // @GetGeneratedKeys
    // Long insert(@Bind("nome") String nome, @Bind("email") String email, @Bind("senha") String senha, @Bind("tipo") String tipo);

    @SqlUpdate("INSERT INTO usuario (nome, email, senha, role, foto, dtAlteracao, dtCriacao) VALUES (:nome, :email, :senha, :role, :foto, NULL, NOW())")
    @GetGeneratedKeys
    Long insert(@BindBean Usuario user);

    // UPDATE corrigido (sem vírgula antes do WHERE)
    @SqlUpdate("UPDATE usuario SET nome = :nome, email = :email, senha = :senha, foto = :foto, dtAlteracao = NOW() WHERE id_usuario = :id")
    int update(@Bind("id") Long id, @Bind("nome") String nome, @Bind("email") String email, @Bind("senha") String senha, @Bind("foto") String foto);

    @SqlUpdate("DELETE FROM usuario WHERE id_usuario = :id")
    int delete(@Bind("id") Long id);

    @SqlQuery("SELECT id_usuario AS idUsuario, nome, email, senha, role, foto, dtCriacao, dtAlteracao FROM usuario WHERE email = :email AND senha = :senha")
    Usuario autenticar(@Bind("email") String email, @Bind("senha") String senha);

    @SqlUpdate("UPDATE usuario SET foto = :foto WHERE id_usuario = :id")
    int updateFoto(@Bind("id") Long id, @Bind("foto") String foto);
}