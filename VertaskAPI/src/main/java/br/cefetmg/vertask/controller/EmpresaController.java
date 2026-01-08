package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Empresa;
import br.cefetmg.vertask.repository.EmpresaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/empresa")
public class EmpresaController {

    private final EmpresaRepository empresaRepository;

    public EmpresaController(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Empresa>> getAll() {
        List<Empresa> lista = empresaRepository.findAll();
        return ResponseEntity.ok().body(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empresa> getById(@PathVariable Long id) {
        Empresa e = empresaRepository.findById(id);
        if (e == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok().body(e);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Empresa> create(@RequestBody Empresa empresa) {
        Long id = empresaRepository.insert(empresa);
        empresa.setIdEmpresa(id);
        return ResponseEntity.ok().body(empresa);
    }

    @PutMapping({"", "/"})
    public ResponseEntity<Empresa> update(@RequestBody Empresa empresa) {
        if (empresa.getIdEmpresa() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa id not provided");
        }
        int qtd = empresaRepository.update(empresa);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma empresa alterada");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma empresa alterada");
        }
        return ResponseEntity.ok().body(empresa);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Empresa> delete(@PathVariable Long id) {
        Empresa e = empresaRepository.findById(id);
        if (e == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa not found");
        }
        int qtd = empresaRepository.delete(id);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma empresa excluida");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma empresa excluida");
        }
        return ResponseEntity.ok().body(e);
    }

}
