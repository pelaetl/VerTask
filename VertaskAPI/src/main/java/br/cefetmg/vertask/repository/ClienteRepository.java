package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.Cliente;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

@RegisterBeanMapper(Cliente.class)
public interface ClienteRepository {

    @SqlQuery("SELECT * FROM cliente WHERE id = :id")
    Cliente findById(@Bind("id") Integer id);

    @SqlQuery("SELECT * FROM cliente ORDER BY nome")
    List<Cliente> findAll();

    @SqlQuery("SELECT * FROM cliente WHERE cpf = :cpf")
    Cliente findByCpf(@Bind("cpf") String cpf);

    @SqlQuery("SELECT * FROM cliente WHERE cnpj = :cnpj")
    Cliente findByCnpj(@Bind("cnpj") String cnpj);

    @SqlUpdate("INSERT INTO cliente (tipo, nome, nome_fantasia, cpf, cnpj, endereco, telefone, email, honorario) "
            + "VALUES (:tipo, :nome, :nomeFantasia, :cpf, :cnpj, :endereco, :telefone, :email, :honorario)")
    @GetGeneratedKeys
    Integer insert(@BindBean Cliente c);

    @SqlUpdate("UPDATE cliente SET tipo=:tipo, nome=:nome, nome_fantasia=:nomeFantasia, cpf=:cpf, cnpj=:cnpj, endereco=:endereco, telefone=:telefone, email=:email, honorario=:honorario WHERE id=:id")
    int update(@BindBean Cliente c);

    @SqlUpdate("DELETE FROM cliente WHERE id = :id")
    int delete(@Bind("id") Integer id);
}
