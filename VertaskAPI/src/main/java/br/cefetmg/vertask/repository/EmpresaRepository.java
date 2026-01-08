package br.cefetmg.vertask.repository;

import br.cefetmg.vertask.model.Empresa;

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
@RegisterBeanMapper(Empresa.class)
public interface EmpresaRepository {

    @SqlQuery("SELECT * FROM empresa;")
    List<Empresa> findAll();

    @SqlQuery("SELECT * FROM empresa WHERE id_empresa = :id;")
    Empresa findById(@Bind("id") Long id);

    @SqlUpdate("""
        insert into empresa (nome, cnpj, fantasia, endereco, telefone, email, honorario)
        values (:nome, :cnpj, :fantasia, :endereco, :telefone, :email, :honorario);
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Empresa empresa);

    @SqlUpdate("""
        update empresa
        set nome = :nome,
            cnpj = :cnpj,
            fantasia = :fantasia,
            endereco = :endereco,
            telefone = :telefone,
            email = :email,
            honorario = :honorario
        where id_empresa = :idEmpresa;
    """)
    int update(@BindBean Empresa empresa);

    @SqlUpdate("delete from empresa where id_empresa = :id;")
    int delete(@Bind("id") Long id);

    @Bean
    default EmpresaRepository getInstance(Jdbi jdbi) {
        return jdbi.onDemand(EmpresaRepository.class);
    }
}
