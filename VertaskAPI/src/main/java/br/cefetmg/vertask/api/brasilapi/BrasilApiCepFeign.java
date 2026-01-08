// package br.cefetmg.vertask.api.brasilapi;

// import org.springframework.cloud.openfeign.FeignClient;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;

// //chamada para a API BrasilAPI
// @FeignClient (name = "brasilapi", url = "https://brasilapi.com.br")
// public interface BrasilApiCepFeign {

//     @GetMapping(path = "/api/cep/v2/{cep}")
//     BrasilApiCep2 buscarCepV2(@PathVariable("cep") String cep); // Passa o id na UR

// }
