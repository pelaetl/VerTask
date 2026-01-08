package br.cefetmg.vertask.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
public class CnpjaService {

    private final WebClient webClient;

    public CnpjaService(WebClient cnpjaWebClient) {
        this.webClient = cnpjaWebClient;
    }

    public Map<String, Object> lookup(String cnpjDigits) {
        try {
            Map<String, Object> response = webClient.get()
                    .uri("/{cnpj}", cnpjDigits)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return response;
        } catch (WebClientResponseException.NotFound ex) {
            System.err.println("CNPJ não encontrado na API CnpJá: " + cnpjDigits);
            return null;
        } catch (WebClientResponseException ex) {
            System.err.println("Erro HTTP ao consultar CnpJá: " + ex.getStatusCode() + " - " + ex.getMessage());
            throw new RuntimeException("Erro ao consultar CnpJá: " + ex.getStatusCode() + " - " + ex.getMessage(), ex);
        } catch (Exception ex) {
            System.err.println("Erro inesperado ao consultar CnpJá: " + ex.getMessage());
            ex.printStackTrace();
            throw new RuntimeException("Erro ao consultar CnpJá: " + ex.getMessage(), ex);
        }
    }
}
