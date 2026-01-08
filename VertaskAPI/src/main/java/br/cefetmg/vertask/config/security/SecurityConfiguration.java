package br.cefetmg.vertask.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;



import org.springframework.security.config.Customizer;



import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

// @Configuration
// @EnableWebSecurity
// @RequiredArgsConstructor
// public class SecurityConfiguration {
//     private final SecurityFilter securityFilter;

//     public static final String AUTH_URI = "/api/auth/";
//     public static final String ADMIN_URI = "/api/v1/tarefa/admin/";
//     public static final String PUBLIC_URI = "/api/v1/public/";

//     @Bean
//     public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfiguration) throws Exception {
//         return authConfiguration.getAuthenticationManager();
//     }

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
//         return httpSecurity
//                 .csrf(csrf -> csrf.disable())
//                 .cors(cors -> cors.configurationSource(request -> {
//                     CorsConfiguration configuration = new CorsConfiguration();
//                     String originHeader = request.getHeader("Origin");
//                     if (originHeader != null && !originHeader.isBlank()) {
//                         configuration.setAllowedOrigins(List.of(originHeader));
//                     } else {
//                         configuration.setAllowedOrigins(Arrays.asList("http://localhost:8100"));
//                     }
//                     configuration.setAllowedMethods(List.of("POST", "PUT", "PATCH", "GET", "OPTIONS", "DELETE"));
//                     configuration.setAllowedHeaders(Arrays.asList("*"));
//                     return configuration;
//                 }))
//                 //deixa as requisicoes stateless ou seja via toke
//                 .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                 .authorizeHttpRequests(authorize -> authorize
//                         .requestMatchers(AUTH_URI + "**").permitAll()
//             .requestMatchers(HttpMethod.POST, "/api/v1/usuario/recuperar-senha").permitAll()
//             .requestMatchers(HttpMethod.POST, "/api/v1/administrador/**").permitAll()
//             .requestMatchers(HttpMethod.POST, "/api/v1/funcionario/**").permitAll()
//             //isso foi agora, qualquer coisa apaga
//             .requestMatchers(HttpMethod.PUT, "/api/v1/funcionario/**").permitAll()
//                         .requestMatchers(ADMIN_URI + "**").hasRole("ADMIN") //esse é do Douglas
//                         .requestMatchers(ADMIN_URI + "**").hasRole("administrador") //esse é do Douglas
//                         //esse é do chat 
//                         .anyRequest().authenticated())
//                 .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
//                 .build();
//     }

//     // @Bean
//     // public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity)
//     // throws Exception {
//     // return httpSecurity
//     // .csrf(csrf -> csrf.disable())
//     // .cors(cors -> cors.configurationSource(request -> {
//     // CorsConfiguration configuration = new CorsConfiguration();
//     // configuration.setAllowedOrigins(Arrays.asList("http://localhost:8100"));
//     // configuration.setAllowedMethods(List.of("POST", "PUT", "PATCH", "GET",
//     // "OPTIONS", "DELETE"));
//     // configuration.setAllowedHeaders(Arrays.asList("*"));
//     // return configuration;
//     // }))
//     // .sessionManagement(session ->
//     // session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//     // .authorizeHttpRequests(authorize -> authorize
//     // .requestMatchers("/api/auth/**").permitAll()
//     // .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
//     // .anyRequest().authenticated()
//     // )
//     // .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
//     // .build();
//     // }
//     //...exi

//     @Bean
//     public PasswordEncoder getPasswordEncoder() {
//         BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
//         return encoder;
//     }
// }

//DO CHAT, TUDO ACIMA FOI COMENTADO PARA LIBERAR TODAS AS ROTAS, É DO DOUGLAS
//Eu só cometei isso acima e a classe do controller
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        //Permite localhost:8100 (Angular/Ionic)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:8100",
            "http://127.0.0.1:8100"
        ));
        
        //Permite todos os métodos HTTP
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        //Permite todos os headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        //Permite credenciais (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        //Tempo de cache para preflight requests
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }


    //Bean para AuthenticationManager (mock)
    @Bean
    public AuthenticationManager authenticationManager() {
        return authentication -> {
            throw new UnsupportedOperationException("Autenticação desabilitada");
        };
    }

    //Bean para PasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}