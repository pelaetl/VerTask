// package br.cefetmg.vertask.controller;

// import br.cefetmg.vertask.model.Usuario;
// import br.cefetmg.vertask.model.Tarefa;
// import br.cefetmg.vertask.model.TarefaUsuario;
// import br.cefetmg.vertask.repository.TarefaUsuarioRepository;
// import br.cefetmg.vertask.repository.UsuarioRepository;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

// import org.springframework.beans.factory.annotation.Autowired;
// import br.cefetmg.vertask.service.EmailService;

// @CrossOrigin(origins = "http://localhost:8100") // Permite que seu frontend (por exemplo, Angular ou Ionic rodando em
//                                                 // localhost:8100) consiga acessar a API do backend sem bloqueio do
//                                                 // navegador.

// // A anotação @CrossOrigin(origins = "http://localhost:8100") permite que o seu
// // backend (Spring Boot) aceite requisições
// // vindas do endereço http://localhost:8100.

// // Para que serve?
// // CORS (Cross-Origin Resource Sharing): Por padrão, navegadores bloqueiam
// // requisições AJAX feitas de um domínio
// // diferente do backend (por exemplo, seu frontend Angular rodando em
// // localhost:8100 tentando acessar o backend em localhost:8080).
// // Com essa anotação, você libera o backend para aceitar requisições do
// // frontend, evitando erros de CORS.

// @RestController
// @RequestMapping("/api/v1/usuario")
// public class UsuarioController {


//     private final UsuarioRepository usuarioRepository;
//     // private final TarefaUsuarioRepository tarefaUsuarioRepository;

//     @Autowired
//     private EmailService emailService;

//     public UsuarioController(UsuarioRepository usuarioRepository) {
//         this.usuarioRepository = usuarioRepository;
//         // this.tarefaUsuarioRepository = tarefaUsuarioRepository;
//     }

//     // emailService.enviarEmail("games21092007@gmail.com", 
//     //     "Este é um email de teste enviado do backend Spring Boot.", 
//     //     "Este é um email de teste enviado do backend Spring Boot.</p>");

//     @PostMapping("/recuperar-senha")
//     public ResponseEntity<Map<String, String>> recuperarSenha(@RequestBody Map<String, String> request) {
//         String email = request.get("email");

//         if (email == null || email.isEmpty()) {
//             return ResponseEntity.badRequest().build();
//         }

//         // 1. Buscar o usuário pelo email
//         Usuario usuario = usuarioRepository.getByEmail(email); // OBS: Você precisará implementar este método no seu Repository

//         Map<String, String> response = new HashMap<>();

//         if (usuario != null) {
            
//             // 2. Ação de Recuperação (Recomendação: Mudar a senha e enviar a nova)
//             // OBSERVAÇÃO CRÍTICA DE SEGURANÇA: ENVIAR A SENHA ANTIGA É INSEGURO. 
//             // O ideal é gerar uma nova senha temporária ou um token de reset.
            
//             String senhaAntiga = usuario.getSenha(); // Se for estritamente o que você pediu

//             try {
//                 // 3. Enviar a senha por email
//                 String assunto = "[VerTask] Recuperação de Senha";
//                 String corpo = "<p>Olá, " + usuario.getNome() + ",</p>"
//                              + "<p>Sua senha registrada é: <strong>" + senhaAntiga + "</strong></p>"
//                              + "<p>Por favor, altere-a o mais rápido possível por motivos de segurança.</p>";

//                 emailService.enviarEmail(email, assunto, corpo);

//                 response.put("message", "Instruções de recuperação enviadas para o seu e-mail.");
//                 return ResponseEntity.ok(response);

//             } catch (Exception e) {
//                 // Log do erro (idealmente)
//                 System.err.println("Erro ao enviar email de recuperação: " + e.getMessage());
//                 response.put("message", "Erro ao processar a recuperação de senha.");
//                 return ResponseEntity.internalServerError().body(response);
//             }
//         }
        
//         // Retorna 200 OK mesmo se o usuário não for encontrado para evitar que hackers
//         // descubram quais e-mails estão cadastrados (melhor prática de segurança).
//         response.put("message", "Se o e-mail estiver cadastrado, as instruções foram enviadas.");
//         return ResponseEntity.ok(response);
//     }

//     @GetMapping("")
//     public ResponseEntity<List<Usuario>> getAll() {
//         List<Usuario> usuarios = usuarioRepository.findAll();
//         return ResponseEntity.ok(usuarios);

//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<Usuario> getById(@PathVariable Long id) {
//         Usuario usuario = usuarioRepository.findById(id);
//         if (usuario != null) {
//             return ResponseEntity.ok(usuario);
//         }
//         return ResponseEntity.notFound().build();
//     }

//     @PostMapping("")
//     public ResponseEntity<Usuario> create(@RequestBody Usuario usuario) {
//         Long id = usuarioRepository.insert(usuario);
//         usuario.setIdUsuario(id);
//         return ResponseEntity.ok(usuario);
//     }

//     @PostMapping("/auth")
//     public ResponseEntity<Usuario> autenticar(@RequestBody Usuario usuario) {
//         Usuario usuarioAutenticado = usuarioRepository.autenticar(usuario.getEmail(), usuario.getSenha());
//         if (usuarioAutenticado != null) {
//             return ResponseEntity.ok(usuarioAutenticado);
//         }
//         return ResponseEntity.status(401).build(); // Unauthorized
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<Usuario> update(@RequestBody Usuario usuario) {
//         int qtd = usuarioRepository.update(usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(),
//                 usuario.getSenha());
//         if (qtd > 0) {
//             return ResponseEntity.ok(usuario);
//         }
//         return ResponseEntity.notFound().build();
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<Void> delete(@PathVariable Long id) {
//         int qtd = usuarioRepository.delete(id);
//         if (qtd > 0) {
//             return ResponseEntity.ok().build();
//         }
//         return ResponseEntity.notFound().build();
//     }
// }

// Definitivamente no BACKEND é a forma mais correta e segura. Vou explicar por
// quê:

// 🚫 Por que NÃO fazer no Frontend (Ionic)
// Problemas de Segurança:
// Credenciais expostas - Email/senha SMTP ficariam no código fonte
// Qualquer pessoa pode ver as credenciais inspecionando o código
// Não há como proteger informações sensíveis no frontend
// Problemas Técnicos:
// CORS - Servidores SMTP bloqueiam requisições de browsers
// Performance - App trava enquanto envia emails
// Confiabilidade - Se app fechar, email pode não ser enviado
// Limitações do browser - Não pode acessar protocolos SMTP diretamente
// ✅ Por que fazer no BACKEND é melhor
// Segurança:
// Credenciais protegidas - Ficam no servidor, não expostas
// Controle de acesso - Só APIs autorizadas enviam emails
// Auditoria - Log de todos os emails enviados
// Performance:
// Não bloqueia o frontend
// Processamento assíncrono - Emails enviados em background
// Retry automático se falhar
// Funcionalidades avançadas:
// Templates profissionais - HTML rico com Thymeleaf
// Agendamento - Emails de prazo automáticos
// Filas - Para alto volume
// Logs e monitoramento
// 🏗️ Arquitetura Recomendada
// Frontend faz:
// Cria/edita tarefas via API
// Mostra feedback "Email será enviado"
// Backend faz:
// Recebe dados da tarefa
// Busca funcionários responsáveis
// Monta template do email
// Envia via SMTP
// Agenda notificações de prazo
// 💡 Exemplo prático no seu projeto
// Frontend (apenas dispara):
// Backend (faz o trabalho pesado):
// 🎯 Resumo
// Aspecto Frontend Backend
// Segurança ❌ Exposto ✅ Protegido
// Performance ❌ Bloqueia ✅ Assíncrono
// Confiabilidade ❌ Pode falhar ✅ Retry automático
// Manutenção ❌ Difícil ✅ Centralizado
// Templates ❌ Limitado ✅ HTML rico
// 📋 Próximos passos para seu projeto
// Adicionar dependências de email no Spring Boot
// Configurar SMTP no application.properties
// Criar EmailService com templates
// Integrar nos controllers de Tarefa
// Implementar scheduler para prazos
// Testar criação de tarefas
// Conclusão: Sempre faça envio de emails no backend. É mais seguro, confiável e
// profissional! 🚀

// Quer que eu te ajude a implementar o EmailService no seu Spring Boot?





package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Usuario;
import org.springframework.security.crypto.password.PasswordEncoder;
import br.cefetmg.vertask.repository.UsuarioRepository;
import br.cefetmg.vertask.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// @CrossOrigin(origins = "http://localhost:8100") 
@RestController
@RequestMapping("/api/v1/usuario")
public class UsuarioController {


    private final UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // =========================================================================
    // 1. ENDPOINT ESPECÍFICO (Recuperar Senha)
    // Este deve ser processado primeiro, e o Regex abaixo garantirá que ele não 
    // seja confundido com /{id}.
    // =========================================================================
    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> recuperarSenha(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "O campo 'email' é obrigatório.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // 1. Buscar o usuário pelo email
        Usuario usuario = usuarioRepository.getByEmail(email); 

        Map<String, String> response = new HashMap<>();

        if (usuario != null) {
            
            // CRÍTICA DE SEGURANÇA: O ideal é gerar uma nova senha temporária ou um token de reset.
            // Aqui mantemos o comportamento solicitado de enviar a senha antiga (NÃO RECOMENDADO EM PRODUÇÃO)
            String senhaAntiga = usuario.getSenha(); 

            try {
                // 2. Enviar a senha por email
                String assunto = "[VerTask] Recuperação de Senha";
                String corpo = "Olá, " + usuario.getNome()
                             + "Sua senha registrada é: " + senhaAntiga
                             + "Por favor, altere-a o mais rápido possível por motivos de segurança.";

                emailService.enviarEmail(email, assunto, corpo);

                response.put("message", "Instruções de recuperação enviadas para o seu e-mail.");
                return ResponseEntity.ok(response);

            } catch (Exception e) {
                System.err.println("Erro ao enviar email de recuperação: " + e.getMessage());
                response.put("message", "Erro ao processar a recuperação de senha.");
                return ResponseEntity.internalServerError().body(response);
            }
        }
        
        // Melhores Práticas: Retorna OK mesmo se não encontrar para evitar enumeração de usuários.
        response.put("message", "Se o e-mail estiver cadastrado, as instruções foram enviadas.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/enviar-codigo")
    public ResponseEntity<Map<String, String>> enviarCodigo(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "O campo 'email' é obrigatório.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Map<String, String> response = new HashMap<>();

        try {
            // Envia código de verificação
            String resultado = emailService.enviarCodigoVerificacao(email);
            response.put("message", resultado);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erro ao enviar código: " + e.getMessage());
            response.put("message", "Erro ao enviar código de verificação.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/validar-codigo")
    public ResponseEntity<Map<String, String>> validarCodigo(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String codigo = request.get("codigo");

        if (email == null || codigo == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Email e código são obrigatórios.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Map<String, String> response = new HashMap<>();

        boolean valido = emailService.validarCodigo(email, codigo);
        
        if (valido) {
            response.put("message", "Código validado com sucesso.");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Código inválido ou expirado.");
            return ResponseEntity.status(400).body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String novaSenha = request.get("novaSenha");

        if (email == null || email.isEmpty() || novaSenha == null || novaSenha.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Email e novaSenha são obrigatórios.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Map<String, String> response = new HashMap<>();

        Usuario usuario = usuarioRepository.getByEmail(email);
        if (usuario == null) {
            // Do not reveal whether the email exists; return OK for security best-practices
            response.put("message", "Se o e-mail estiver cadastrado, a senha foi atualizada.");
            return ResponseEntity.ok(response);
        }

        try {
            String hashed = passwordEncoder.encode(novaSenha);
            int qtd = usuarioRepository.update(usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(), hashed, usuario.getFoto());
            if (qtd > 0) {
                response.put("message", "Senha atualizada com sucesso.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Não foi possível atualizar a senha.");
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            System.err.println("Erro ao atualizar senha: " + e.getMessage());
            response.put("message", "Erro ao processar a alteração de senha.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // =========================================================================
    // 2. ENDPOINT ESPECÍFICO (Autenticação)
    // =========================================================================
    @PostMapping("/auth")
    public ResponseEntity<Usuario> autenticar(@RequestBody Usuario usuario) {
        // Buscamos o usuário pelo email primeiro
        Usuario encontrado = usuarioRepository.getByEmail(usuario.getEmail());
        if (encontrado == null) {
            return ResponseEntity.status(401).build();
        }

        String senhaFornecida = usuario.getSenha() == null ? "" : usuario.getSenha();
        String senhaArmazenada = encontrado.getSenha() == null ? "" : encontrado.getSenha();

        boolean ok;
        // Se a senha armazenada aparenta ser um hash BCrypt (começa com $2a$ or $2b$), use PasswordEncoder
        if (senhaArmazenada.startsWith("$2a$") || senhaArmazenada.startsWith("$2b$") || senhaArmazenada.startsWith("$2y$")) {
            ok = passwordEncoder.matches(senhaFornecida, senhaArmazenada);
        } else {
            // Fallback para compatibilidade: compara texto puro (útil durante desenvolvimento)
            ok = senhaArmazenada.equals(senhaFornecida);
        }

        if (ok) {
            // Não retorne a senha no corpo da resposta por segurança
            encontrado.setSenha(null);
            return ResponseEntity.ok(encontrado);
        }
        return ResponseEntity.status(401).build(); // Unauthorized
    }
    
    // =========================================================================
    // 3. ENDPOINTS GENÉRICOS (Listar e Criar)
    // =========================================================================
    @GetMapping("")
    public ResponseEntity<List<Usuario>> getAll() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return ResponseEntity.ok(usuarios);

    }

    @PostMapping("")
    public ResponseEntity<Usuario> create(@RequestBody Usuario usuario) {
        Long id = usuarioRepository.insert(usuario);
        usuario.setIdUsuario(id);
        return ResponseEntity.ok(usuario);
    }

    // =========================================================================
    // 4. ENDPOINTS COM PATH VARIABLE ID (AGORA RESTRITOS POR REGEX)
    // A regex ":\\d+" garante que esta rota só será acionada se o path for um número.
    // Isso evita o conflito com "/recuperar-senha" e "/auth".
    // =========================================================================

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Usuario> getById(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Correção: Adicionado @PathVariable para receber o ID do path, embora o objeto Usuario também o tenha
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Usuario> update(@PathVariable Long id, @RequestBody Usuario usuario) {
        // Garantir que o ID do path seja usado para a atualização
        if (!id.equals(usuario.getIdUsuario())) {
            // Se o ID do path e o ID do corpo não baterem, retorna Bad Request
            return ResponseEntity.badRequest().build(); 
        }

    int qtd = usuarioRepository.update(
        usuario.getIdUsuario(),
        usuario.getNome(),
        usuario.getEmail(),
        usuario.getSenha(),
        usuario.getFoto());
        if (qtd > 0) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        int qtd = usuarioRepository.delete(id);
        if (qtd > 0) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }



     @PostMapping("/{id}/foto")
    public ResponseEntity<?> uploadFoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        try {
            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            }
            String filename = "user-" + id + "-" + System.currentTimeMillis() + ext;
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // Update DB with the stored filename (you can change to store full path or URL if desired)
            int qtd = usuarioRepository.updateFoto(id, filename);
            if (qtd > 0) {
                Map<String, String> resp = new HashMap<>();
                resp.put("foto", filename);
                resp.put("message", "Foto enviada com sucesso");
                return ResponseEntity.ok(resp);
            } else {
                // delete file if DB update failed
                try { Files.deleteIfExists(target); } catch (IOException ignored) {}
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao salvar arquivo: " + e.getMessage());
        }
    }

    // Serves the stored photo by user id (reads filename from DB and returns file bytes)
    @GetMapping("/{id}/foto")
    public ResponseEntity<Resource> getFoto(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id);
        if (usuario == null || usuario.getFoto() == null) {
            return ResponseEntity.notFound().build();
        }
        Path uploadDir = Paths.get("uploads");
        Path filePath = uploadDir.resolve(usuario.getFoto());
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        try {
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}