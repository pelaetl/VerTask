package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.StatusTarefa;
import br.cefetmg.vertask.model.Tarefa;
import br.cefetmg.vertask.model.TarefaUsuario;
import br.cefetmg.vertask.model.Usuario;
import br.cefetmg.vertask.repository.TarefaRepository;
import br.cefetmg.vertask.repository.TarefaUsuarioRepository;
import br.cefetmg.vertask.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import br.cefetmg.vertask.service.EmailService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// @CrossOrigin(origins = "http://localhost:8100") // Permite que seu frontend (por exemplo, Angular ou Ionic rodando em
                                                // localhost:8100) consiga acessar a API do backend sem bloqueio do
                                                // navegador.

// A anotação @CrossOrigin(origins = "http://localhost:8100") permite que o seu
// backend (Spring Boot) aceite requisições
// vindas do endereço http://localhost:8100.

// Para que serve?
// CORS (Cross-Origin Resource Sharing): Por padrão, navegadores bloqueiam
// requisições AJAX feitas de um domínio
// diferente do backend (por exemplo, seu frontend Angular rodando em
// localhost:8100 tentando acessar o backend em localhost:8080).
// Com essa anotação, você libera o backend para aceitar requisições do
// frontend, evitando erros de CORS.
@RestController
@RequestMapping("/api/v1/tarefa") // http://localhost:8080/api/v1/tarefa
public class TarefaController {

    // private int count tarefas;
    // private long nextId = 1L;

    private final TarefaRepository tarefaRepository;
    private final TarefaUsuarioRepository tarefaUsuarioRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    public TarefaController(TarefaRepository tarefaRepository,
            TarefaUsuarioRepository tarefaUsuarioRepository,
            UsuarioRepository usuarioRepository) {
        this.tarefaRepository = tarefaRepository;
        this.tarefaUsuarioRepository = tarefaUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
    }
    // public TarefaController() {
    // = new ArrayList<>();

    // Tarefa tarefa1 = new Tarefa();
    // tarefa1.setId(nextId++);
    // tarefa1.setNome("Tarefa 1");
    // tarefa1.setDescricao("Descrição do Tarefa 1");
    // tarefa1.setNumeroFuncinarios(10);
    // tarefas.add(tarefa1);

    // Tarefa tarefa2 = new Tarefa();
    // tarefa2.setId(nextId++);
    // tarefa2.setNome("Tarefa 2");
    // tarefa2.setDescricao("Descrição do Tarefa 2");
    // tarefa2.setNumeroFuncinarios(5);
    // tarefas.add(tarefa2);

    // Tarefa tarefa3 = new Tarefa();
    // tarefa3.setId(nextId++);
    // tarefa3.setNome("Tarefa 3");
    // tarefa3.setDescricao("Descrição do Tarefa 3");
    // tarefa3.setNumeroFuncinarios(8);
    // tarefas.add(tarefa3);
    // }

    @GetMapping("/{id}")
    public ResponseEntity<Tarefa> getById(@PathVariable Long id) {
        Tarefa tarefa = tarefaRepository.findById(id);
        if (tarefa != null) {
            atualizarStatusSeAtrasada(tarefa);
            // Buscar os usuários atribuídos à tarefa
            List<Usuario> usuarios = tarefaUsuarioRepository.buscarUsuariosPorTarefa(id);
            List<Long> usuariosIds = usuarios.stream()
                    .map(Usuario::getIdUsuario)
                    .toList();
            tarefa.setUsuariosIds(usuariosIds);

            return ResponseEntity.ok().body(tarefa);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/existe")
    public ResponseEntity<Boolean> existeTarefaComNome(@RequestParam String nome) {
        List<Tarefa> tarefas = tarefaRepository.findAll();
        boolean existe = tarefas.stream().anyMatch(tarefa -> tarefa.getNome().equalsIgnoreCase(nome));
        return ResponseEntity.ok(existe);
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<List<Tarefa>> getAll() {
        List<Tarefa> tarefas = tarefaRepository.findAll();

        // Para cada tarefa, buscar os usuários atribuídos
        for (Tarefa tarefa : tarefas) {
        atualizarStatusSeAtrasada(tarefa);
            List<Usuario> usuarios = tarefaUsuarioRepository.buscarUsuariosPorTarefa(tarefa.getIdTarefa());
            List<Long> usuariosIds = usuarios.stream()
                    .map(Usuario::getIdUsuario)
                    .toList();
            tarefa.setUsuariosIds(usuariosIds);
        }

        return ResponseEntity.ok().body(tarefas);
    }

    // @PostMapping({ "", "/" })
    // public ResponseEntity<Tarefa> create(@RequestBody Tarefa tarefa) {
    // // Inserir a tarefa primeiro
    // Long id = tarefaRepository.insert(tarefa);
    // tarefa.setIdTarefa(id);

    // // Debug: verificar se usuariosIds não é null
    // System.out.println("Usuários IDs recebidos: " + tarefa.getUsuariosIds());

    // // Atribuir usuários à tarefa se foram fornecidos
    // if (tarefa.getUsuariosIds() != null && !tarefa.getUsuariosIds().isEmpty()) {
    // for (Long usuarioId : tarefa.getUsuariosIds()) {
    // System.out.println("Atribuindo usuário " + usuarioId + " à tarefa " + id);
    // TarefaUsuario tarefaUsuario = new TarefaUsuario(id, usuarioId);
    // int resultado =
    // tarefaUsuarioRepository.atribuirUsuarioATarefa(tarefaUsuario);
    // System.out.println("Resultado da inserção: " + resultado);
    // }
    // } else {
    // System.out.println("Nenhum usuário foi fornecido para a tarefa");
    // }

    // return ResponseEntity.ok().body(tarefa);
    // }

    @PostMapping({ "", "/" })
    public ResponseEntity<Tarefa> create(@RequestBody Tarefa tarefa) {
        try {

            // Inserir a tarefa primeiro
            Long id = tarefaRepository.insert(tarefa);
            tarefa.setIdTarefa(id);

            // Atribuir usuários à tarefa se foram fornecidos
            if (tarefa.getUsuariosIds() != null && !tarefa.getUsuariosIds().isEmpty()) {
                for (Long usuarioId : tarefa.getUsuariosIds()) {
                    TarefaUsuario tarefaUsuario = new TarefaUsuario(id, usuarioId, false);

                    int resultado = tarefaUsuarioRepository.atribuirUsuarioATarefa(tarefaUsuario);
                }

                // Verificar se os registros foram inseridos
                System.out.println("Verificando atribuições...");
                for (Long usuarioId : tarefa.getUsuariosIds()) {
                    int count = tarefaUsuarioRepository.verificarAtribuicao(id, usuarioId);
                    System.out.println(
                            "Verificação - Tarefa " + id + " + Usuário " + usuarioId + ": " + count + " registros");
                }

            } else {
                System.out.println("AVISO: Nenhum usuário foi fornecido para a tarefa");
            }

            return ResponseEntity.ok().body(tarefa);

        } catch (Exception e) {
            System.err.println("ERRO ao criar tarefa: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para criar tarefa com arquivo (multipart/form-data)
    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping(value = {"", "/"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Tarefa> createWithFile(@RequestPart("tarefa") String tarefaJson,
            @RequestPart(value = "documento", required = false) MultipartFile documento) {
        try {
            // Use Spring-configured ObjectMapper so Java Time (LocalDateTime) is handled the same as @RequestBody
            Tarefa tarefa = objectMapper.readValue(tarefaJson, Tarefa.class);

            // salvar arquivo se presente
            if (documento != null && !documento.isEmpty()) {
                String uploadsDir = "uploads/tarefas"; // relative to app working dir
                Path uploadPath = Paths.get(uploadsDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String originalFilename = documento.getOriginalFilename();
                String fileId = UUID.randomUUID().toString();
                String storedFileName = fileId + "_" + (originalFilename != null ? originalFilename.replaceAll("\\s+", "_") : "attachment");
                Path target = uploadPath.resolve(storedFileName).normalize();
                Files.copy(documento.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

                tarefa.setDocumentoNome(originalFilename);
                tarefa.setDocumentoMime(documento.getContentType());
                tarefa.setDocumentoTamanho(documento.getSize());
                tarefa.setDocumentoPath(target.toString());
            }

            Long id = tarefaRepository.insert(tarefa);
            tarefa.setIdTarefa(id);

            // Atribuir usuários à tarefa se foram fornecidos
            if (tarefa.getUsuariosIds() != null && !tarefa.getUsuariosIds().isEmpty()) {
                for (Long usuarioId : tarefa.getUsuariosIds()) {
                    TarefaUsuario tarefaUsuario = new TarefaUsuario(id, usuarioId, false);

                    int resultado = tarefaUsuarioRepository.atribuirUsuarioATarefa(tarefaUsuario);
                }
            }

            return ResponseEntity.ok().body(tarefa);

        } catch (Exception e) {
            System.err.println("ERRO ao criar tarefa com arquivo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para download do documento anexado a uma tarefa
    @GetMapping("/{id}/documento")
    public ResponseEntity<Resource> downloadDocumento(@PathVariable Long id) {
        Tarefa tarefa = tarefaRepository.findById(id);
        if (tarefa == null || tarefa.getDocumentoPath() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            Path file = Paths.get(tarefa.getDocumentoPath());
            if (!Files.exists(file)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Resource resource = new UrlResource(file.toUri());
            String mime = tarefa.getDocumentoMime() != null ? tarefa.getDocumentoMime() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mime))
                    .header("Content-Disposition", "attachment; filename=\"" + tarefa.getDocumentoNome() + "\"")
                    .body(resource);

        } catch (Exception e) {
            System.err.println("Erro ao servir documento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // @PutMapping({"/{id}", "/"})
    @PutMapping({ "", "/" })
    public ResponseEntity<Tarefa> update(@RequestBody Tarefa tarefa) {
        // id tarefa tem que estar preenchido no corpo da requisição pois o sistema pega
        // ele por aqui
        // e não pelo path variable já que é um RequestBody
        // no corpo da requisição tem que ter o tarefa com o id preenchido

        if (tarefa.getIdTarefa() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }

        int qtd = tarefaRepository.update(tarefa);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum tarefa alterado");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um tarefa alterado");
        }

        // Atualizar as atribuições de usuários se foram fornecidas
        if (tarefa.getUsuariosIds() != null) {
            // Primeiro remove todas as atribuições existentes
            tarefaUsuarioRepository.removerTodasAtribuicoesDaTarefa(tarefa.getIdTarefa());

            // Depois adiciona as novas atribuições
            for (Long usuarioId : tarefa.getUsuariosIds()) {
                TarefaUsuario tarefaUsuario = new TarefaUsuario(tarefa.getIdTarefa(), usuarioId, false);
                tarefaUsuarioRepository.atribuirUsuarioATarefa(tarefaUsuario);
            }
        }

        return ResponseEntity.ok().body(tarefa);
    }

    private void atualizarStatusSeAtrasada(Tarefa tarefa) {
        if (tarefa == null) {
            return;
        }
        // Não alterar status se já estiver concluída (inclusive concluída atrasada)
        if (tarefa.getStatusTarefa() == StatusTarefa.CONCLUIDA
                || tarefa.getStatusTarefa() == StatusTarefa.CONCLUIDA_ATRASADA
                || tarefa.getDataEntrega() == null) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now();
        if (tarefa.getDataEntrega().isBefore(agora) || tarefa.getDataEntrega().isEqual(agora)) {
            if (tarefa.getStatusTarefa() != StatusTarefa.ATRASADO) {
                tarefa.setStatusTarefa(StatusTarefa.ATRASADO);
                tarefaRepository.update(tarefa);
            }
        }
    }

    @PutMapping("/{id}/iniciar")
    public ResponseEntity<Tarefa> iniciarTarefa(@PathVariable Long id) {
        Tarefa tarefa = tarefaRepository.findById(id);
        if (tarefa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }

        tarefa.setStatusTarefa(StatusTarefa.EM_ANDAMENTO);
        tarefaRepository.update(tarefa);
        // Tentar notificar o administrador por e-mail quando a tarefa for iniciada
        try {
            // Somente notificar se a tarefa estiver configurada para notificar o administrador
            if (tarefa.isNotifyAdmin()) {
                Long idAdmin = tarefa.getIdAdministrador();
                if (idAdmin != null) {
                    Usuario administrador = usuarioRepository.findById(idAdmin);
                    if (administrador != null && administrador.getEmail() != null && !administrador.getEmail().isBlank()) {
                        String tituloTarefa = (tarefa.getNome() != null && !tarefa.getNome().isBlank())
                                ? tarefa.getNome()
                                : ("Tarefa #" + id);

                        String assunto = "Tarefa iniciada: " + tituloTarefa;
                        String corpo = "Olá " + administrador.getNome() + ",\n\n"
                                + "A tarefa \"" + tituloTarefa + "\" (ID: " + id
                                + ") foi marcada como iniciada." + "\n"
                                + "Acesse o VerTask para acompanhar o progresso." + "\n\n"
                                + "Atenciosamente,\n"
                                + "Equipe VerTask";

                        String retornoEnvio = emailService.enviarEmailTarefaIniciada(administrador.getEmail(), assunto, corpo);
                        if (retornoEnvio != null && retornoEnvio.startsWith("Erro")) {
                            // Log do erro para diagnóstico; não impedimos o início da tarefa
                            System.err.println("Falha ao enviar e-mail de início: " + retornoEnvio);
                        }
                    } else {
                        System.out.println("Administrador sem e-mail para notificação (id=" + idAdmin + ")");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao tentar notificar administrador sobre início de tarefa: " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok().body(tarefa);
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<Tarefa> concluirTarefa(@PathVariable Long id) {
        Tarefa tarefa = tarefaRepository.findById(id);
        if (tarefa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }
        // Se a data de entrega já passou, marca como CONCLUIDA_ATRASADA
        if (tarefa.getDataEntrega() != null && LocalDateTime.now().isAfter(tarefa.getDataEntrega())) {
            tarefa.setStatusTarefa(StatusTarefa.CONCLUIDA_ATRASADA);
        } else {
            tarefa.setStatusTarefa(StatusTarefa.CONCLUIDA);
        }
        tarefaRepository.update(tarefa);
        // Notificar administrador se configurado
        try {
            if (tarefa.isNotifyAdmin()) {
                Long idAdmin = tarefa.getIdAdministrador();
                if (idAdmin != null) {
                    Usuario administrador = usuarioRepository.findById(idAdmin);
                    if (administrador != null && administrador.getEmail() != null && !administrador.getEmail().isBlank()) {
                        String tituloTarefa = (tarefa.getNome() != null && !tarefa.getNome().isBlank())
                                ? tarefa.getNome()
                                : ("Tarefa #" + id);

                        String assunto = "Tarefa concluída: " + tituloTarefa;
                        String corpo = "Olá " + administrador.getNome() + ",\n\n"
                                + "A tarefa \"" + tituloTarefa + "\" (ID: " + id
                                + ") foi marcada como concluída." + "\n"
                                + "Acesse o VerTask para revisar os detalhes." + "\n\n"
                                + "Atenciosamente,\n"
                                + "Equipe VerTask";

                        String retornoEnvio = emailService.enviarEmailTarefaConcluida(administrador.getEmail(), assunto, corpo);
                        if (retornoEnvio != null && retornoEnvio.startsWith("Erro")) {
                            System.err.println("Falha ao enviar e-mail de conclusão: " + retornoEnvio);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao tentar notificar administrador sobre conclusão de tarefa: " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok().body(tarefa);
    }

    // PATCH endpoint para atualizar apenas o status da tarefa (usado pelo Kanban)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Tarefa> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Tarefa tarefa = tarefaRepository.findById(id);
        if (tarefa == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String novoStatus = body.get("status");
        // opcional: observacao enviada quando a tarefa é marcada como concluída
        String observacao = body.get("observacao");
        if (novoStatus == null || novoStatus.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            StatusTarefa st = StatusTarefa.valueOf(novoStatus);
            
            // Se está marcando como CONCLUIDA, verifica se a data de entrega já passou
            if (st == StatusTarefa.CONCLUIDA && tarefa.getDataEntrega() != null) {
                LocalDateTime agora = LocalDateTime.now();
                if (agora.isAfter(tarefa.getDataEntrega())) {
                    // Se a data de entrega já passou, marca como CONCLUIDA_ATRASADA
                    st = StatusTarefa.CONCLUIDA_ATRASADA;
                }
            }
            
            tarefa.setStatusTarefa(st);
            if (observacao != null) {
                tarefa.setObservacao(observacao);
            }
            tarefaRepository.update(tarefa);
            return ResponseEntity.ok().body(tarefa);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            System.err.println("Erro ao atualizar status da tarefa: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{idTarefa}/{idAdministrador}/tarefaConcluida")
    public ResponseEntity<String> notificarAdministradorConclusao(
            @PathVariable Long idTarefa,
            @PathVariable Long idAdministrador) {

        Tarefa tarefa = tarefaRepository.findById(idTarefa);
        if (tarefa == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Tarefa não encontrada para o id " + idTarefa);
        }

        if (tarefa.getIdAdministrador() == null || !tarefa.getIdAdministrador().equals(idAdministrador)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("O administrador informado não está associado a esta tarefa.");
        }

        Usuario administrador = usuarioRepository.findById(idAdministrador);
        if (administrador == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Administrador não encontrado para o id " + idAdministrador);
        }

        if (administrador.getEmail() == null || administrador.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Administrador não possui e-mail cadastrado.");
        }

        String tituloTarefa = (tarefa.getNome() != null && !tarefa.getNome().isBlank())
                ? tarefa.getNome()
                : ("Tarefa #" + idTarefa);

        String assunto = "Tarefa concluída: " + tituloTarefa;
        String corpo = "Olá " + administrador.getNome() + ",\n\n"
                + "A tarefa \"" + tituloTarefa + "\" (ID: " + idTarefa
                + ") foi marcada como concluída pelos responsáveis." + "\n"
                + "Acesse o VerTask para revisar os detalhes e realizar possíveis ações adicionais." + "\n\n"
                + "Atenciosamente,\n"
                + "Equipe VerTask";

        try {
            String retornoEnvio = emailService.enviarEmailTarefaConcluida(administrador.getEmail(), assunto, corpo);
            if (retornoEnvio != null && retornoEnvio.startsWith("Erro")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(retornoEnvio);
            }
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail de conclusão para o administrador "
                    + administrador.getEmail() + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao enviar e-mail para o administrador.");
        }

        return ResponseEntity.ok("Administrador notificado sobre a conclusão da tarefa.");
    }

    @PostMapping("/{idTarefa}/{idAdministrador}/tarefaIniciada")
    public ResponseEntity<String> notificarAdministradorInicio(
            @PathVariable Long idTarefa,
            @PathVariable Long idAdministrador) {

        Tarefa tarefa = tarefaRepository.findById(idTarefa);
        if (tarefa == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Tarefa não encontrada para o id " + idTarefa);
        }

        if (tarefa.getIdAdministrador() == null || !tarefa.getIdAdministrador().equals(idAdministrador)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("O administrador informado não está associado a esta tarefa.");
        }

        Usuario administrador = usuarioRepository.findById(idAdministrador);
        if (administrador == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Administrador não encontrado para o id " + idAdministrador);
        }

        if (administrador.getEmail() == null || administrador.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Administrador não possui e-mail cadastrado.");
        }

        String tituloTarefa = (tarefa.getNome() != null && !tarefa.getNome().isBlank())
                ? tarefa.getNome()
                : ("Tarefa #" + idTarefa);

        String assunto = "Tarefa iniciada: " + tituloTarefa;
        String corpo = "Olá " + administrador.getNome() + ",\n\n"
                + "A tarefa \"" + tituloTarefa + "\" (ID: " + idTarefa
                + ") foi iniciada pelos responsáveis." + "\n"
                + "Acesse o VerTask para acompanhar o progresso e realizar possíveis ações administrativas." + "\n\n"
                + "Atenciosamente,\n"
                + "Equipe VerTask";

        try {
            String retornoEnvio = emailService.enviarEmailTarefaIniciada(administrador.getEmail(), assunto, corpo);
            if (retornoEnvio != null && retornoEnvio.startsWith("Erro")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(retornoEnvio);
            }
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail de início para o administrador "
                    + administrador.getEmail() + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao enviar e-mail para o administrador.");
        }

        return ResponseEntity.ok("Administrador notificado sobre o início da tarefa.");
    }

    // private void notificarConclusaoAdministrador(Tarefa tarefa) {
    //     if (tarefa.getIdAdministrador() == null) {
    //         return;
    //     }
    //     Usuario administrador = usuarioRepository.findById(tarefa.getIdAdministrador());
    //     if (administrador == null || administrador.getEmail() == null || administrador.getEmail().isBlank()) {
    //         return;
    //     }

    //     emailService.enviarEmailTarefaConcluida(administrador.getEmail(), tarefa);
    // }

    // @GetMapping("/path")
    // public ResponseEntity<Tarefa> pagarTarefaPorData(@PathVariable Long id) {
    // Tarefa tarefa = tarefaRepository.findById(id);
    // if (tarefa == null) {
    // throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
    // }

    // tarefa.setStatusTarefa(StatusTarefa.EM_ANDAMENTO);
    // tarefaRepository.update(tarefa);
    // return ResponseEntity.ok().body(tarefa);
    // }

    @GetMapping("/{idUsuario}/count/em-andamento")
    public ResponseEntity<Integer> getCountByUsuarioEmAndamento(@PathVariable Long idUsuario) {
        int count = tarefaRepository.countByAndamentoPorUsuario(idUsuario);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{idUsuario}/count/concluida")
    public ResponseEntity<Integer> getCountByUsuarioConcluida(@PathVariable Long idUsuario) {
        int count = tarefaRepository.countByConcluidaPorUsuario(idUsuario);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{idUsuario}/count/pendente")
    public ResponseEntity<Integer> getCountByUsuarioPendente(@PathVariable Long idUsuario) {
        int count = tarefaRepository.countByPendentePorUsuario(idUsuario);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{idUsuario}/count/atrasada")
    public ResponseEntity<Integer> getCountByUsuarioAtrasada(@PathVariable Long idUsuario) {
        int count = tarefaRepository.countByAtrasadaPorUsuario(idUsuario);
        return ResponseEntity.ok(count);
    }

    //depois só tirar o /admin e tirar la no service e no security tambem
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Tarefa> delete(@PathVariable Long id) {
        // id não tem que estar preenchido no corpo da requisição pois o sistema pega
        // ele pelo path variable
        // e não pelo RequestBody já que é um PathVariable
        // no corpo da requisição não precisa ter o tarefa

        if (id == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Id do Tarefa nao encontrado");
        }

        Tarefa tarefa = tarefaRepository.findById(id);
        if (tarefa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }

        // Primeiro remove todas as atribuições de usuários da tarefa
        tarefaUsuarioRepository.removerTodasAtribuicoesDaTarefa(id);

        int qtd = tarefaRepository.delete(id);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum tarefa excluido");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um tarefa excluido");
        }

        return ResponseEntity.ok().body(tarefa);
    }

    @PostMapping("/{id}/notificar-usuarios")
    public ResponseEntity<Map<String, String>> notificarUsuarios(@PathVariable Long id) {
        Tarefa tarefa = tarefaRepository.findById(id);
        if (tarefa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }

        List<Usuario> usuarios = tarefaUsuarioRepository.buscarUsuariosPorTarefa(id);
        if (usuarios == null || usuarios.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Nenhum usuário atribuído para notificar"));
        }

        usuarios.forEach(usuario ->
                System.out.printf("Notificando usuário %s (%s) sobre a tarefa %s%n",
                        usuario.getNome(), usuario.getEmail(), tarefa.getNome())
        );

        return ResponseEntity.ok(Map.of("message", "Notificações processadas"));
    }

    // Endpoint para atribuir um usuário específico a uma tarefa
    @PostMapping("/{tarefaId}/usuarios/{usuarioId}")
    public ResponseEntity<String> atribuirUsuario(@PathVariable Long tarefaId, @PathVariable Long usuarioId) {
        // Verificar se a tarefa existe
        Tarefa tarefa = tarefaRepository.findById(tarefaId);
        if (tarefa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa not found");
        }

        // Verificar se já existe a atribuição
        int existe = tarefaUsuarioRepository.verificarAtribuicao(tarefaId, usuarioId);
        if (existe > 0) {
            return ResponseEntity.ok("Usuário já atribuído a esta tarefa");
        }

        TarefaUsuario tarefaUsuario = new TarefaUsuario(tarefaId, usuarioId, false);
        int resultado = tarefaUsuarioRepository.atribuirUsuarioATarefa(tarefaUsuario);

        if (resultado > 0) {
            return ResponseEntity.ok("Usuário atribuído à tarefa com sucesso");
        } else {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atribuir usuário à tarefa");
        }
    }

    // Endpoint para remover um usuário de uma tarefa
    @DeleteMapping("/{tarefaId}/usuarios/{usuarioId}")
    public ResponseEntity<String> removerUsuario(@PathVariable Long tarefaId, @PathVariable Long usuarioId) {
        int resultado = tarefaUsuarioRepository.removerUsuarioDaTarefa(tarefaId, usuarioId);

        if (resultado > 0) {
            return ResponseEntity.ok("Usuário removido da tarefa com sucesso");
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Atribuição não encontrada");
        }
    }

    // Endpoint para listar todos os usuários de uma tarefa

}
