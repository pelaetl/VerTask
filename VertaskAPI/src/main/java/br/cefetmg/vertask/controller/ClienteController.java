package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Cliente;
import br.cefetmg.vertask.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteController {

    private final ClienteRepository repo;

    public ClienteController(ClienteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Cliente> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> get(@PathVariable Integer id) {
        Cliente c = repo.findById(id);
        if (c == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(c);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Cliente c) {
        // basic validation
        if (c.getTipo() == null) c.setTipo("empresa");
        if (!c.getTipo().equals("empresa") && !c.getTipo().equals("pessoa")) {
            return ResponseEntity.badRequest().body("tipo must be 'empresa' or 'pessoa'");
        }
        if (c.getTipo().equals("pessoa")) {
            String cpf = c.getCpf() == null ? "" : c.getCpf();
            // ensure remove non-digits
            cpf = cpf.replaceAll("\\D", "");
            if (cpf.length() != 11) return ResponseEntity.badRequest().body("CPF must have 11 digits");
            c.setCpf(cpf);
            c.setCnpj(null);
            c.setNomeFantasia(null);
        } else {
            String cnpj = c.getCnpj() == null ? "" : c.getCnpj();
            cnpj = cnpj.replaceAll("\\D", "");
            if (cnpj.length() != 14) return ResponseEntity.badRequest().body("CNPJ must have 14 digits");
            c.setCnpj(cnpj);
            c.setCpf(null);
        }
        if (c.getHonorario() == null) c.setHonorario(BigDecimal.ZERO);
        try {
            Integer id = repo.insert(c);
            c.setId(id);
            return ResponseEntity.ok(c);
        } catch (Exception ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof SQLIntegrityConstraintViolationException || (cause != null && cause.getMessage() != null && (cause.getMessage().contains("uq_cliente_cnpj") || cause.getMessage().contains("uq_cliente_cpf")))) {
                return ResponseEntity.status(409).body("Cliente com mesmo CPF/CNPJ já existe");
            }
            return ResponseEntity.status(500).body("Erro interno ao criar cliente: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Cliente c) {
        Cliente existing = repo.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        c.setId(id);
        // reuse create validation logic simply by calling create-like checks
        if (c.getTipo() == null) c.setTipo(existing.getTipo());
        if (c.getTipo().equals("pessoa")) {
            String cpf = c.getCpf() == null ? "" : c.getCpf();
            cpf = cpf.replaceAll("\\D", "");
            if (cpf.length() != 11) return ResponseEntity.badRequest().body("CPF must have 11 digits");
            c.setCpf(cpf); c.setCnpj(null); c.setNomeFantasia(null);
        } else {
            String cnpj = c.getCnpj() == null ? "" : c.getCnpj();
            cnpj = cnpj.replaceAll("\\D", "");
            if (cnpj.length() != 14) return ResponseEntity.badRequest().body("CNPJ must have 14 digits");
            c.setCnpj(cnpj); c.setCpf(null);
        }
        repo.update(c);
        return ResponseEntity.ok(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        Cliente existing = repo.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        repo.delete(id);
        return ResponseEntity.noContent().build();
    }

}
