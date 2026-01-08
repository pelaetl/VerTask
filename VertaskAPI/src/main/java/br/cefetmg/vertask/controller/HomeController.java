package br.cefetmg.vertask.controller;

import br.cefetmg.vertask.model.Setor;
import br.cefetmg.vertask.model.Funcionario;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home") // http://localhost:8080/home
public class HomeController {

    // @GetMapping({ "/setor" })
    // public ResponseEntity<Setor> showSetor() {
    //     Setor setor = new Setor();
    //     setor.setIdSetor(1l);
    //     setor.setNome("Setor 1");
    //     setor.setDescricao("Descrição do Setor 1");

    //     return ResponseEntity.status(HttpStatus.OK).body(setor);

    // }

    // @GetMapping("/funcionario")
    // public ResponseEntity<Funcionario> showFuncionario() {
    //     Funcionario funcionario = new Funcionario();
    //     funcionario.setIdFuncionario(1l);
    //     funcionario.setNome("funcionario 1");
    //     funcionario.setEmail(" funcionario1@funcionario.com");
    //     funcionario.setSenha("123456789");
    //     funcionario.setIdSetor(1l);

    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(funcionario);

    // }
}
