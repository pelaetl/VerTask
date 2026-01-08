# Sistema de Notificações por Email - Lembretes de Tarefas

## 📋 Descrição

Sistema automático que envia emails de lembrete aos usuários responsáveis quando faltam **3 horas** para o prazo de entrega de uma tarefa.

## ⚙️ Como Funciona

### 1. Verificação Automática
- O sistema executa automaticamente a **cada 30 minutos**
- Verifica todas as tarefas que estão entre 2h45min e 3h15min do prazo (janela de 30 minutos)
- Envia emails apenas para tarefas com status **PENDENTE**, **EM_ANDAMENTO** ou **ATRASADO**
- **Não envia** para tarefas já **CONCLUÍDAS** ou **CONCLUÍDAS_ATRASADAS**

### 2. Prevenção de Duplicatas
- Cada tarefa recebe apenas **1 email por dia**
- O cache é limpo automaticamente à meia-noite (00:00)
- Isso evita spam de emails repetidos

### 3. Destinatários
- Emails são enviados para **todos os usuários responsáveis** pela tarefa
- A lista de responsáveis vem da tabela `tarefaUsuario`

## 📧 Formato do Email

**Assunto:**
```
⏰ Lembrete: Tarefa próxima do prazo - [Nome da Tarefa]
```

**Corpo:**
```
Olá!

Este é um lembrete automático de que a tarefa '[Nome da Tarefa]' está próxima do prazo de entrega.

Detalhes da tarefa:
- Nome: [Nome]
- Descrição: [Descrição]
- Prazo de entrega: [dd/MM/yyyy às HH:mm]
- Tempo restante: aproximadamente 3 horas

Por favor, certifique-se de concluir esta tarefa dentro do prazo estabelecido.

Atenciosamente,
Sistema VerTask
```

## 🚀 Configuração

### Pré-requisitos
✅ Configuração de email no `application.properties` já está funcionando
✅ Tabelas `tarefa`, `tarefaUsuario` e `usuario` devem existir
✅ Spring Boot está configurado com `@EnableScheduling`

### Arquivos Criados/Modificados

1. **EmailService.java** - Adicionado método `enviarEmailLembretePrazo()`
2. **TarefaLembreteScheduler.java** - Scheduler que verifica tarefas a cada 30 minutos
3. **VerTaskApplication.java** - Adicionado `@EnableScheduling`
4. **LembreteController.java** - Endpoints para testes manuais

## 🧪 Testando o Sistema

### Método 1: Aguardar Execução Automática
O scheduler executa automaticamente a cada 30 minutos (00, 30 de cada hora).

### Método 2: Forçar Verificação Manual

**Via Postman/Insomnia:**
```http
POST http://localhost:8080/api/v1/lembretes/verificar
```

**Via cURL:**
```bash
curl -X POST http://localhost:8080/api/v1/lembretes/verificar
```

**Via navegador (JavaScript Console):**
```javascript
fetch('http://localhost:8080/api/v1/lembretes/verificar', {method: 'POST'})
  .then(r => r.text())
  .then(console.log);
```

### Método 3: Limpar Cache (Para Testes)
Se quiser testar novamente o envio de email para a mesma tarefa:

```http
POST http://localhost:8080/api/v1/lembretes/limpar-cache
```

## 📊 Logs

O sistema registra logs detalhados no console:

```
INFO  - Iniciando verificação de tarefas próximas do prazo (3 horas antes)...
INFO  - Lembrete enviado para usuario@email.com sobre tarefa 'Exemplo' - Email enviado com sucesso
INFO  - Lembretes enviados para tarefa 'Exemplo' (ID: 123) - 2 responsáveis notificados
INFO  - Verificação concluída. 10 tarefas verificadas, 2 emails enviados.
```

## 📝 Exemplo de Teste

Para testar, crie uma tarefa com prazo de entrega daqui a 3 horas:

1. Crie uma tarefa com `dataEntrega` = agora + 3 horas
2. Atribua usuários responsáveis
3. Aguarde a próxima execução do scheduler (00 ou 30 minutos)
   OU execute manualmente via endpoint `/api/v1/lembretes/verificar`
4. Verifique o email dos responsáveis

## 🔧 Ajustes Opcionais

### Alterar Frequência de Verificação

Edite o cron em `TarefaLembreteScheduler.java`:

```java
// A cada 15 minutos
@Scheduled(cron = "0 */15 * * * *")

// A cada hora
@Scheduled(cron = "0 0 * * * *")

// Às 9h e 15h todos os dias
@Scheduled(cron = "0 0 9,15 * * *")
```

### Alterar Janela de Tempo (3 horas)

Modifique as linhas em `TarefaLembreteScheduler.java`:

```java
// Para 2 horas (janela de 1h45 a 2h15)
if (minutosRestantes >= 105 && minutosRestantes <= 135)

// Para 1 hora (janela de 45min a 1h15)
if (minutosRestantes >= 45 && minutosRestantes <= 75)
```

## ✅ Checklist de Verificação

- [x] EmailService configurado com SMTP
- [x] Scheduler criado e funcionando
- [x] @EnableScheduling ativado
- [x] Endpoints de teste criados
- [x] Sistema previne emails duplicados
- [x] Logs informativos habilitados

## 🎯 Status do Sistema

**✅ BACKEND COMPLETO E FUNCIONAL**

O sistema está totalmente implementado e pronto para uso. Basta iniciar a aplicação Spring Boot e o scheduler começará a funcionar automaticamente!
