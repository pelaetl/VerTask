package br.cefetmg.vertask.service;

import br.cefetmg.vertask.model.CpfInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class CpfLookupService {

    private final WebClient webClient;
    private final boolean configured;

    public CpfLookupService(@Value("${cpf.lookup.base-url:}") String baseUrl, WebClient.Builder builder) {
        if (baseUrl == null || baseUrl.isBlank()) {
            // mark as not configured so we can give a clear error later
            this.webClient = builder.build();
            this.configured = false;
        } else {
            this.webClient = builder.baseUrl(baseUrl).build();
            this.configured = true;
        }
    }

    /**
     * Query external CPF lookup provider. The provider's path can be either configured as base URL
     * with a placeholder (e.g. https://api.example.com/cpf) or a complete URL; the service appends
     * the CPF as path segment.
     */
    public Mono<CpfInfo> lookupByCpf(String cpf) {
        if (!configured) {
            return Mono.error(new IllegalStateException("cpf.lookup.base-url is not configured in application.properties. Set property 'cpf.lookup.base-url' to your provider base URL (e.g. https://api.example.com/cpf)"));
        }
        String path = "/" + cpf;
        return webClient.get()
                .uri(path)
                .header(HttpHeaders.ACCEPT, "application/json")
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> {
                    // try to map common fields; adapt to your provider
                    String nome = null;
                    if (body.containsKey("nome")) nome = String.valueOf(body.get("nome"));
                    if (nome == null && body.containsKey("name")) nome = String.valueOf(body.get("name"));
                    CpfInfo info = new CpfInfo(cpf, nome, body);
                    return info;
                });
    }
}
