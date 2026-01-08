package br.cefetmg.vertask.config.security;

import br.cefetmg.vertask.model.Token;
import br.cefetmg.vertask.model.Usuario;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {
    @Value("${api.security.token.secret}")
    private String secret;

    public Token generateToken(Usuario user){
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String strToken = JWT.create()
                    .withIssuer("auth-api")
                    .withSubject(user.getEmail())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);

            return Token.builder()
                    .token(strToken)
                    .expiration(genExpirationLocalDateTime())
                    .build();
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Error while generating token", exception);
        }
    }

    public String validateToken(String token){
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("auth-api")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception){
            return "";
        }
    }

    private Instant genExpirationDate(){
        return genExpirationLocalDateTime().toInstant(ZoneOffset.of("-03:00"));
    }

    private LocalDateTime genExpirationLocalDateTime(){
        return LocalDateTime.now().plusHours(24);
    }
}
