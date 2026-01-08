package br.cefetmg.vertask.config;

import br.cefetmg.vertask.repository.FuncionarioRepository;
import br.cefetmg.vertask.repository.SetorRepository;
import br.cefetmg.vertask.repository.TarefaRepository;
import br.cefetmg.vertask.repository.UsuarioRepository;
import br.cefetmg.vertask.repository.AdministradorRepository;
import br.cefetmg.vertask.repository.TarefaUsuarioRepository;
import br.cefetmg.vertask.repository.ChatMessageRepository;
import br.cefetmg.vertask.repository.EmpresaRepository;
import br.cefetmg.vertask.repository.ConversationRepository;
import br.cefetmg.vertask.repository.ConversationMessageRepository;
import br.cefetmg.vertask.repository.ConversationMemberRepository;
import br.cefetmg.vertask.repository.ClienteRepository;
import org.jdbi.v3.core.Jdbi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RepositoryConfig {

    @Bean
    public SetorRepository setorRepository(Jdbi jdbi) {
        return jdbi.onDemand(SetorRepository.class);
    }

    @Bean
    public EmpresaRepository empresaRepository(Jdbi jdbi) {
        return jdbi.onDemand(EmpresaRepository.class);
    }

    @Bean
    public FuncionarioRepository funcionarioRepository(Jdbi jdbi) {
        return jdbi.onDemand(FuncionarioRepository.class);
    }

    @Bean
    public TarefaRepository tarefaRepository(Jdbi jdbi) {
    return jdbi.onDemand(TarefaRepository.class);
    }

    @Bean
    public UsuarioRepository usuarioRepository(Jdbi jdbi) {
        return jdbi.onDemand(UsuarioRepository.class);
    }

    @Bean
    public AdministradorRepository administradorRepository(Jdbi jdbi) {
      return jdbi.onDemand(AdministradorRepository.class);
    
    }

    @Bean 
    public TarefaUsuarioRepository tarefaUsuarioRepository(Jdbi jdbi) {
        return jdbi.onDemand(TarefaUsuarioRepository.class);
    }

    @Bean
    public ChatMessageRepository chatMessageRepository(Jdbi jdbi) {
        return jdbi.onDemand(ChatMessageRepository.class);
    }

    @Bean
    public ConversationRepository conversationRepository(Jdbi jdbi) {
        return jdbi.onDemand(ConversationRepository.class);
    }

    @Bean
    public ConversationMessageRepository conversationMessageRepository(Jdbi jdbi) {
        return jdbi.onDemand(ConversationMessageRepository.class);
    }

    @Bean
    public ConversationMemberRepository conversationMemberRepository(Jdbi jdbi) {
        return jdbi.onDemand(ConversationMemberRepository.class);
    }

    @Bean
    public ClienteRepository clienteRepository(Jdbi jdbi) {
        return jdbi.onDemand(ClienteRepository.class);
    }
}
