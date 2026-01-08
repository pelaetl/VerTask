package br.cefetmg.vertask.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.CrossOrigin;
import br.cefetmg.vertask.repository.TarefaUsuarioRepository;
import br.cefetmg.vertask.service.EmailService;
import br.cefetmg.vertask.model.Tarefa;
import br.cefetmg.vertask.model.Usuario;
import br.cefetmg.vertask.model.TarefaUsuario;
import org.springframework.web.bind.annotation.RequestParam;

// @CrossOrigin(origins = "http://localhost:8100") //Permite que seu frontend (por exemplo, Angular ou Ionic rodando em localhost:8100) consiga acessar a API do backend sem bloqueio do navegador.


// A anotação @CrossOrigin(origins = "http://localhost:8100") permite que o seu backend (Spring Boot) aceite requisições
//vindas do endereço http://localhost:8100.

// Para que serve?
// CORS (Cross-Origin Resource Sharing): Por padrão, navegadores bloqueiam requisições AJAX feitas de um domínio
// diferente do backend (por exemplo, seu frontend Angular rodando em localhost:8100 tentando acessar o backend em localhost:8080).
// Com essa anotação, você libera o backend para aceitar requisições do frontend, evitando erros de CORS.
@RestController
@RequestMapping("/api/v1/tarefausuario") //http://localhost:8080/api/v1/tarefausuario
public class TarefaUsuarioController {
    private final TarefaUsuarioRepository tarefaUsuarioRepository;

    @Autowired
    private EmailService emailService;

    public TarefaUsuarioController(TarefaUsuarioRepository tarefaUsuarioRepository) {
        this.tarefaUsuarioRepository = tarefaUsuarioRepository;
    }

    // Espera URL: /api/v1/usuario/{id}/compras
    @GetMapping("/{id}/tarefas")
    public ResponseEntity<List<Tarefa>> getByUsuario(@PathVariable Long id) {
        List<Tarefa> tarefas = tarefaUsuarioRepository.buscarTarefasPorUsuario(id);
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/{idTarefa}/{idUsuario}")
    public ResponseEntity<TarefaUsuario> getById(@PathVariable Long idTarefa, @PathVariable Long idUsuario) {
        TarefaUsuario tarefaUsuario = tarefaUsuarioRepository.findById(idTarefa, idUsuario);
        if (tarefaUsuario != null) {
            return ResponseEntity.ok().body(tarefaUsuario);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PutMapping("/{idTarefa}/{idUsuario}/favorito")
    public ResponseEntity<TarefaUsuario> favoritarTarefa(@PathVariable Long idTarefa, @PathVariable Long idUsuario) {
        TarefaUsuario tarefaUsuario = tarefaUsuarioRepository.findById(idTarefa, idUsuario);
        if (tarefaUsuario == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }

        tarefaUsuario.setFavorita(true);
        tarefaUsuarioRepository.favoritar(tarefaUsuario);
        return ResponseEntity.ok().body(tarefaUsuario);
    }

    //metodo get nome responsaveis de uma tarefa por id da tarefa
    @GetMapping("/{idTarefa}/responsaveis")
    public ResponseEntity<List<Usuario>> getResponsaveisPorTarefa(@PathVariable Long idTarefa) {
        List<Usuario> usuarios = tarefaUsuarioRepository.buscarResponsaveisPorTarefa(idTarefa);
        return ResponseEntity.ok(usuarios);
    }

    @PutMapping("/{idTarefa}/{idUsuario}/desfavorito")
    public ResponseEntity<TarefaUsuario> desfavoritarTarefa(@PathVariable Long idTarefa, @PathVariable Long idUsuario) {
        TarefaUsuario tarefaUsuario = tarefaUsuarioRepository.findById(idTarefa, idUsuario);
        if (tarefaUsuario == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }

        tarefaUsuario.setFavorita(false);
        tarefaUsuarioRepository.favoritar(tarefaUsuario);
        return ResponseEntity.ok().body(tarefaUsuario);
    }

    @GetMapping("/{idTarefa}/{idUsuario}/isfavorito")
    public String isFavorito(@PathVariable Long idTarefa, @PathVariable Long idUsuario) {
        TarefaUsuario tarefaUsuario = tarefaUsuarioRepository.findById(idTarefa, idUsuario);
        if (tarefaUsuario != null) {
            return tarefaUsuario.getFavorita() ? "true" : "false";
        }
        return "false";
    }

    //quero retornar as tarefas favoritas de cada usuário
    @GetMapping("/{idUsuario}/favoritas")
    public ResponseEntity<List<Tarefa>> favoritas(@PathVariable Long idUsuario) {
        List<Tarefa> tarefas = tarefaUsuarioRepository.listarTarefasFavoritasPorUsuario(idUsuario);
        return ResponseEntity.ok(tarefas);
    }


    @GetMapping("/{tarefaId}/usuarios")
    public ResponseEntity<List<Usuario>> getUsuariosPorTarefa(@PathVariable Long tarefaId) {
        List<Usuario> usuarios = tarefaUsuarioRepository.buscarUsuariosPorTarefa(tarefaId);
        return ResponseEntity.ok(usuarios);
    }


    @GetMapping({ "", "/" })
    public ResponseEntity<List<TarefaUsuario>> getAll() {
        List<TarefaUsuario> tarefasUsuarios = tarefaUsuarioRepository.findAll();
        return ResponseEntity.ok().body(tarefasUsuarios);
    }


     @PostMapping("/{idTarefa}/novaTarefa")
    public ResponseEntity<String> novaTarefa(@PathVariable Long idTarefa) {
        // 1. Buscar a lista de usuários responsáveis
        List<Usuario> responsaveis = tarefaUsuarioRepository.buscarResponsaveisPorTarefa(idTarefa);

        if (responsaveis.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Nenhum responsável encontrado para a tarefa " + idTarefa);
        }

        // Se você tiver um serviço para buscar a Tarefa completa, é bom para ter o título no email
        // Ex: Tarefa tarefa = tarefaRepository.findById(idTarefa).orElse(null);

        // 2. Iterar e enviar o e-mail para cada usuário
        for (Usuario usuario : responsaveis) {
            try {
                String assunto = "Nova tarefa cadastrada para você no sistema";
                String corpo = "Olá " + usuario.getNome() + ",\n\n"
                             + "Uma nova tarefa [ID: " + idTarefa + "] foi cadastrada e está aguardando sua atenção no VerTask.\n"
                             + "Por favor, verifique os detalhes.\n\n"
                             + "Atenciosamente,\n"
                             + "Equipe VerTask";

                emailService.enviarEmail(usuario.getEmail(), assunto, corpo);

            } catch (Exception e) {
                // Logar o erro, mas continuar o loop para tentar enviar para os próximos
                System.err.println("Erro ao enviar e-mail para " + usuario.getEmail() + ": " + e.getMessage());
            }
        }

        return ResponseEntity.ok("E-mails de notificação iniciados com sucesso para " + responsaveis.size() + " usuários.");
    }

}