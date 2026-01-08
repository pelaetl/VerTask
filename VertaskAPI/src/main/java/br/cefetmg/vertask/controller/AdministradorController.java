package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Administrador;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import br.cefetmg.vertask.repository.AdministradorRepository;
import br.cefetmg.vertask.repository.UsuarioRepository;

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
@RequestMapping("/api/v1/administrador") // http://localhost:8080/api/v1/administrador
public class AdministradorController {

    // private List<Administrador> administradores;
    // private long nextId = 1L;

    private final AdministradorRepository administradorRepository;
    private UsuarioRepository usuarioRepository;

    public AdministradorController(AdministradorRepository administradorRepository, UsuarioRepository usuarioRepository) {
        this.administradorRepository = administradorRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // public AdministradorController() {
    // administradores = new ArrayList<>();

    // Administrador administrador1 = new Administrador();
    // administrador1.setId(nextId++);
    // administrador1.setNome("Administrador 1");
    // administrador1.setEmail("administrador1@gmail.com");
    // administrador1.setSenha("senha123");
    // administrador1.setSetorId(1L); // Assuming setorId is set to 1 for this example
    // administradores.add(administrador1);

    // Administrador administrador2 = new Administrador();
    // administrador2.setId(nextId++);
    // administrador2.setNome("Administrador 2");
    // administrador2.setEmail("administrador2@gmail.com");
    // administrador2.setSenha("senha456");
    // administrador2.setSetorId(2L); // Assuming setorId is set to 2 for this example
    // administradores.add(administrador2);

    // Administrador administrador3 = new Administrador();
    // administrador3.setId(nextId++);
    // administrador3.setNome("Administrador 3");
    // administrador3.setEmail("administrador3@gmail.com");
    // administrador3.setSenha("senha789");
    // administrador3.setSetorId(3L); // Assuming setorId is set to 3 for this example
    // administradores.add(administrador3);
    // }

    @GetMapping("/{id}")
    public ResponseEntity<Administrador> getById(@PathVariable Long id) {
        Administrador administrador = administradorRepository.findById(id);
        if (administrador != null) {
            return ResponseEntity.ok().body(administrador);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<List<Administrador>> getAll() {
        List<Administrador> administradores = administradorRepository.findAll();
        return ResponseEntity.ok().body(administradores);
    }

    // @PostMapping({ "", "/" })
    // public ResponseEntity<Administrador> create(@RequestBody Administrador
    // administrador) {
    // Long id = administradorRepository.insert(administrador);
    // administrador.setIdAdministrador(id);
    // return ResponseEntity.ok().body(administrador);
    // }

    @PostMapping({ "", "/" })
    public ResponseEntity<Administrador> cadastrarAdministrador(@RequestBody Administrador administrador) {
        // usa o método transacional do repositório (insere usuario e administrador)
        Long id = administradorRepository.insert(administrador);
        administrador.setIdAdministrador(id);
        return ResponseEntity.ok(administrador);
    }

    // @PutMapping({"/{id}", "/"})
    @PutMapping({ "", "/" })
    public ResponseEntity<Administrador> update(@RequestBody Administrador administrador) {
        if (administrador.getIdAdministrador() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador not found");
        }

        int qtd = administradorRepository.update(administrador);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum administrador alterado");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um administrador alterado");
        }

        return ResponseEntity.ok().body(administrador);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Administrador> delete(@PathVariable Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Id do Administrador nao encontrado");
        }

        Administrador administrador = administradorRepository.findById(id);
        if (administrador == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador not found");
        }

        int qtd = administradorRepository.delete(id);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum administrador excluido");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um administrador excluido");
        }

        return ResponseEntity.ok().body(administrador);
    }

    // private Administrador findById(Long id) {
    // for (Administrador administrador : administradores) {
    // if (administrador.getId() == id) {
    // return administrador;
    // }
    // }
    // return null;
    // }
}
