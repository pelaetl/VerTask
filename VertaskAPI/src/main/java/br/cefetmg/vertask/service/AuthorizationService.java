package br.cefetmg.vertask.service;

import br.cefetmg.vertask.config.security.TokenService;
import br.cefetmg.vertask.model.LoginRequest;
import br.cefetmg.vertask.model.LoginResponse;
import br.cefetmg.vertask.model.Token;
import br.cefetmg.vertask.model.Usuario;
import br.cefetmg.vertask.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorizationService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    private static final String lockedExceptionMessage = "Email não verificado, acessar a caixa de correios e clicar no link de validação.";
    private static final String DisabledExceptionMessage = "Usuario desabilitado, procure o suporte técnico.";
    private static final String AuthenticationExceptionMessage = "Login ou senha não conferem.";

    public LoginResponse login(
            LoginRequest data,
            HttpServletRequest request,
            AuthenticationManager authenticationManager)
    {
        //Criar este objeto utilizado para a autenticação.
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.getEmail(), data.getSenha());

        //Buscar o usuario no banco para logar na base de sessions autorizadas e não autorizadas.
        var usuario = usuarioRepository.getByEmail(data.getEmail());

        //Realiza a autenticação e se der erro captura o erro correto.
        Authentication auth = null;
        try{
            auth = authenticationManager.authenticate(usernamePassword);
        }catch(LockedException e){
            log.error(lockedExceptionMessage + " - " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.LOCKED, lockedExceptionMessage, e);
        }catch(DisabledException e){
            log.error(DisabledExceptionMessage + " - " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.LOCKED, DisabledExceptionMessage, e);
        }catch (BadCredentialsException badCredentialsException){
            // Fallback para senhas legadas não criptografadas
            if (usuario != null && legacyPasswordMatches(usuario, data.getSenha())) {
                String encodedPassword = passwordEncoder.encode(data.getSenha());
                try {
                usuarioRepository.update(
                        usuario.getIdUsuario(),
                        usuario.getNome(),
                        usuario.getEmail(),
                        encodedPassword,
                        usuario.getFoto());
                    usuario.setSenha(encodedPassword);
                } catch (Throwable dbException) {
                    log.error("Erro ao atualizar senha legada para usuário {} - {}", usuario.getEmail(), dbException.getMessage());
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar senha do usuário.", dbException);
                }

                auth = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
            } else {
                log.error(AuthenticationExceptionMessage + " - " + badCredentialsException.getMessage() + "(" + badCredentialsException.getClass().getName() + ")");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, AuthenticationExceptionMessage, badCredentialsException);
            }
        }catch (AuthenticationException e){
            log.error(AuthenticationExceptionMessage + " - " + e.getMessage() + "(" + e.getClass().getName() + ")");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, AuthenticationExceptionMessage, e);
        }

        Token token = tokenService.generateToken((Usuario) auth.getPrincipal());

        var loginResponseDto = new LoginResponse(token, usuario);

        //var defaultResponseDto = new DefaultResponseDto("Login efetuado com sucesso", 200, loginResponseDto);

        return loginResponseDto;
    }

    public Usuario register(Usuario data) {
        //Verificar se o usuario já existe
        Usuario usuario = null;
        try{
            usuario = usuarioRepository.getByEmail(data.getEmail());
            if (usuario != null){
                throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Usuário já existente");
            }
        }catch (Throwable e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro de banco de dados: " + e.getMessage(), e);
        }

        //codificar a senha e cria usuário para iserir no banco.
        String encryptedPassword = passwordEncoder.encode(data.getSenha());
        usuario = Usuario.builder()
                .nome(data.getNome())
                .email(data.getEmail())
                .senha(encryptedPassword)
        .foto(data.getFoto())
                .role(data.getRole())
                .build();

        //Tenta inserir no banco de dados o usuario
        try{
            usuarioRepository.insert(usuario);
        }catch (Throwable e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro de banco de dados: " + e.getMessage(), e);
        }

        return usuario;
    }

    /*
    public DefaultResponseDto sendRecoveryPassWordLink(AuthenticationDto data) {
        return null;
    }

    public DefaultResponseDto sendRecoveryPassWordEnd(AuthenticationDto data) {
        return null;
    }
    */

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserDetails user = null;
        try{
            user = usuarioRepository.getByEmail(username);
        }catch (Throwable e){
            throw new UsernameNotFoundException("Erro ao consultar usuário pelo email: " + username + " - " + e.getMessage());
        }

        return user;
    }

    private boolean legacyPasswordMatches(Usuario usuario, String rawPassword) {
        if (usuario.getSenha() == null) {
            return false;
        }

        // Se já estiver em formato BCrypt, deixe que o AuthenticationManager trate
        if (usuario.getSenha().startsWith("$2a$") || usuario.getSenha().startsWith("$2b$") || usuario.getSenha().startsWith("$2y$")) {
            return false;
        }

        return usuario.getSenha().equals(rawPassword);
    }
}
