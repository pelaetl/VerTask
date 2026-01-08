package br.cefetmg.vertask.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${cnpja.api.base-url}")
    private String cnpjaBaseUrl;

    @Bean
    public WebClient cnpjaWebClient(WebClient.Builder builder) {
        return builder.baseUrl(cnpjaBaseUrl).build();
    }
}
