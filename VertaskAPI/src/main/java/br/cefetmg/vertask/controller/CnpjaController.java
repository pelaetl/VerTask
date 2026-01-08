package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.service.CnpjaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/cnpja")
@CrossOrigin(origins = "http://localhost:8100")
public class CnpjaController {

    private final CnpjaService service;

    public CnpjaController(CnpjaService service) {
        this.service = service;
    }

    @GetMapping("/{cnpj}")
    public ResponseEntity<?> getByCnpj(@PathVariable String cnpj) {
        try {
            String digits = cnpj.replaceAll("\\D", "");
            if (digits.length() != 14) return ResponseEntity.badRequest().body(Map.of("message", "CNPJ inválido"));
            Map<String, Object> resp = service.lookup(digits);
            if (resp == null) return ResponseEntity.status(404).body(Map.of("message", "CNPJ não encontrado na base externa"));
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Erro ao consultar API externa: " + e.getMessage()));
        }
    }
}
