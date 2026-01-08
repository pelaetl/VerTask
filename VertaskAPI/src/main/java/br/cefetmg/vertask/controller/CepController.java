// package br.cefetmg.vertask.controller;

// import br.cefetmg.vertask.api.brasilapi.BrasilApiCep2;
// import br.cefetmg.vertask.api.brasilapi.BrasilApiCepFeign;
// import lombok.RequiredArgsConstructor;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequestMapping("/api/v1/cep")
// @RequiredArgsConstructor
// public class CepController {

//     private final BrasilApiCepFeign brasilApiCepFeign;

//     @GetMapping("/{cep}")
//     public BrasilApiCep2 getBrasilApiCep2(@PathVariable String cep) {
//         return brasilApiCepFeign.buscarCepV2(cep);
//         //return null;
//     }

// }
