package br.cefetmg.vertask.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    // Armazena códigos temporariamente (em produção, use Redis ou cache)
    private final Map<String, String> codigosVerificacao = new HashMap<>();

    public String enviarEmail(String destinatario, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatario);
            email.setSubject(assunto);
            email.setText(mensagem);
            javaMailSender.send(email);
            return "Email enviado com sucesso para " + destinatario;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email: " + e.getMessage();
        }
    
    }


     public String enviarEmailNovaTarefa(String[] destinatarios, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatarios);
            email.setSubject(assunto);
            email.setText(mensagem);
            javaMailSender.send(email);
            return "Email enviado com sucesso para " + String.join(", ", destinatarios);
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email: " + e.getMessage();
        }
    }


    public String enviarEmailTarefaConcluida(String destinatario, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatario);
            email.setSubject(assunto);
            email.setText(mensagem);
            javaMailSender.send(email);
            return "Email enviado com sucesso para " + destinatario;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email: " + e.getMessage();
        }
    
    }

    public String enviarEmailTarefaIniciada(String destinatario, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatario);
            email.setSubject(assunto);
            email.setText(mensagem);
            javaMailSender.send(email);
            return "Email enviado com sucesso para " + destinatario;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email: " + e.getMessage();
        }
    }


    public String enviarEmailEsqueceuSenha(String destinatario, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatario);
            email.setSubject(assunto);
            email.setText(mensagem);
            javaMailSender.send(email);
            return "Email enviado com sucesso para " + destinatario;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email: " + e.getMessage();
        }
    
    }


    public String enviarEmailLembreteTarefa(String[] destinatarios, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatarios);
            email.setSubject(assunto);
            email.setText(mensagem);
            javaMailSender.send(email);
            return "Email enviado com sucesso para " + destinatarios;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email: " + e.getMessage();
        }
    
    }

    // ===== MÉTODOS PARA CÓDIGO DE VERIFICAÇÃO =====

    public String gerarCodigoVerificacao() {
        Random random = new Random();
        int codigo = 100000 + random.nextInt(900000);
        return String.valueOf(codigo);
    }

    public String enviarCodigoVerificacao(String destinatario) {
        try {
            String codigo = gerarCodigoVerificacao();
            
            // Armazena o código para validação posterior
            codigosVerificacao.put(destinatario, codigo);

            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatario);
            email.setSubject("Código de Verificação - VerTask");
            email.setText(
                "Olá!\n\n" +
                "Seu código de verificação é: " + codigo + "\n\n" +
                "Este código é válido por 10 minutos.\n\n" +
                "Se você não solicitou este código, ignore este email.\n\n" +
                "Atenciosamente,\n" +
                "Equipe VerTask"
            );

            javaMailSender.send(email);
            return "Código enviado com sucesso para " + destinatario;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar código: " + e.getMessage();
        }
    }

    public boolean validarCodigo(String email, String codigo) {
        String codigoArmazenado = codigosVerificacao.get(email);
        if (codigoArmazenado != null && codigoArmazenado.equals(codigo)) {
            codigosVerificacao.remove(email); // Remove após validação
            return true;
        }
        return false;
    }

    public void removerCodigo(String email) {
        codigosVerificacao.remove(email);
    }

    /**
     * Envia email de lembrete quando faltam 3 horas para o prazo da tarefa
     */
    public String enviarEmailLembretePrazo(String destinatario, String nomeTarefa, String descricaoTarefa, String prazoFormatado) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatario);
            email.setSubject("⏰ Lembrete: Tarefa próxima do prazo - " + nomeTarefa);
            email.setText(
                "Olá!\n\n" +
                "Este é um lembrete automático de que a tarefa '" + nomeTarefa + "' está próxima do prazo de entrega.\n\n" +
                "Detalhes da tarefa:\n" +
                "- Nome: " + nomeTarefa + "\n" +
                "- Descrição: " + descricaoTarefa + "\n" +
                "- Prazo de entrega: " + prazoFormatado + "\n" +
                "- Tempo restante: aproximadamente 3 horas\n\n" +
                "Por favor, certifique-se de concluir esta tarefa dentro do prazo estabelecido.\n\n" +
                "Atenciosamente,\n" +
                "Sistema VerTask"
            );
            javaMailSender.send(email);
            return "Email de lembrete enviado com sucesso para " + destinatario;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email de lembrete: " + e.getMessage();
        }
    }
}