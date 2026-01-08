package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Setor;
import br.cefetmg.vertask.repository.SetorRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

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
@RequestMapping("/api/v1/setor") // http://localhost:8080/api/v1/setor
public class SetorController {

    // private List<Setor> setores;
    // private long nextId = 1L;

    private final SetorRepository setorRepository;

    public SetorController(SetorRepository setorRepository) {
        this.setorRepository = setorRepository;
    }

    // public SetorController() {
    // setores = new ArrayList<>();

    // Setor setor1 = new Setor();
    // setor1.setId(nextId++);
    // setor1.setNome("Setor 1");
    // setor1.setDescricao("Descrição do Setor 1");
    // setor1.setNumeroFuncinarios(10);
    // setores.add(setor1);

    // Setor setor2 = new Setor();
    // setor2.setId(nextId++);
    // setor2.setNome("Setor 2");
    // setor2.setDescricao("Descrição do Setor 2");
    // setor2.setNumeroFuncinarios(5);
    // setores.add(setor2);

    // Setor setor3 = new Setor();
    // setor3.setId(nextId++);
    // setor3.setNome("Setor 3");
    // setor3.setDescricao("Descrição do Setor 3");
    // setor3.setNumeroFuncinarios(8);
    // setores.add(setor3);
    // }

    @GetMapping("/{id}")
    public ResponseEntity<Setor> getById(@PathVariable Long id) {
        Setor setor = setorRepository.findById(id);
        if (setor != null) {
            return ResponseEntity.ok().body(setor);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/existe")
    public ResponseEntity<Boolean> existeSetorComNome(@RequestParam String nome) {
        List<Setor> setores = setorRepository.findAll();
        boolean existe = setores.stream().anyMatch(setor -> setor.getNome().equalsIgnoreCase(nome));
        return ResponseEntity.ok(existe);
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<List<Setor>> getAll() {
        List<Setor> setores = setorRepository.findAll();
        return ResponseEntity.ok().body(setores);
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<Setor> create(@RequestBody Setor setor) {
        Long id = setorRepository.insert(setor);
        setor.setIdSetor(id);
        return ResponseEntity.ok().body(setor);
    }

    // @PutMapping({"/{id}", "/"})
    @PutMapping({ "", "/" })
    public ResponseEntity<Setor> update(@RequestBody Setor setor) {
        // id setor tem que estar preenchido no corpo da requisição pois o sistema pega
        // ele por aqui
        // e não pelo path variable já que é um RequestBody
        // no corpo da requisição tem que ter o setor com o id preenchido

        if (setor.getIdSetor() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Setor not found");
        }

        int qtd = setorRepository.update(setor);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum setor alterado");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um setor alterado");
        }

        return ResponseEntity.ok().body(setor);
    }



    // preciso fazer sem passar na url o id, pois o angular não está passando
    // mas deixo o outro método com id na url caso precise futuramente
    @PutMapping("/{id}")
    public ResponseEntity<Setor> update(@PathVariable Long id, @RequestBody Setor setor) {
        // Verifica se o setor existe
        Setor setorExistente = setorRepository.findById(id);
        if (setorExistente == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Setor not found");
        }

        // Define o ID do setor recebido no corpo da requisição
        setor.setIdSetor(id);

        // Atualiza o setor
        int qtd = setorRepository.update(setor);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum setor alterado");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um setor alterado");
        }

        return ResponseEntity.ok().body(setor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Setor> delete(@PathVariable Long id) {
        // id não tem que estar preenchido no corpo da requisição pois o sistema pega
        // ele pelo path variable
        // e não pelo RequestBody já que é um PathVariable
        // no corpo da requisição não precisa ter o setor

        if (id == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Id do Setor nao encontrado");
        }

        Setor setor = setorRepository.findById(id);
        if (setor == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Setor not found");
        }

        int qtd = setorRepository.delete(id);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum setor excluido");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um setor excluido");
        }

        return ResponseEntity.ok().body(setor);
    }

    // private Setor findById(Long id) {
    // for (Setor setor : setores) {
    // if (setor.getId() == id) {
    // return setor;
    // }
    // }
    // return null;
    // }
}
