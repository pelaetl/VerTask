package br.cefetmg.vertask.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint que o cliente usará para se conectar (com SockJS fallback)
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
        // Em produção, substitua '*' por domínios permitidos.
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefixo para as mensagens enviadas do cliente para o servidor (-> @MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
        // Tópicos que o servidor usará para enviar mensagens aos clientes
        config.enableSimpleBroker("/topic", "/user");
        // Prefixo para mensagens privadas de usuário
        config.setUserDestinationPrefix("/user");
    }
}
