package br.cefetmg.vertask.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/**
 * CPF endpoint disabled — user requested cancellation of CPF integration.
 * This controller returns HTTP 410 Gone for any lookup attempts.
 */
@RestController
@RequestMapping("/api/v1/cpf")
public class CpfController {

    @GetMapping("/{cpf}")
    public ResponseEntity<Object> lookup(@PathVariable String cpf) {
        return ResponseEntity.status(HttpStatus.GONE)
                .body(Map.of("cpf", cpf, "error", "CPF lookup integration has been removed by user"));
    }

}
