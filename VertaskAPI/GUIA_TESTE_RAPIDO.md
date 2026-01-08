# 🚀 Guia Rápido de Teste - Sistema de Lembretes

## Como Testar Agora Mesmo

### Opção 1: Usando Postman/Insomnia (RECOMENDADO)

1. Abra o Postman ou Insomnia
2. Crie uma nova requisição POST
3. URL: `http://localhost:8080/api/v1/lembretes/verificar`
4. Clique em "Send"
5. Verifique a resposta e os logs do backend

### Opção 2: Usando PowerShell

```powershell
# Verificar lembretes manualmente
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/lembretes/verificar" -Method Post

# Limpar cache (para testar novamente)
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/lembretes/limpar-cache" -Method Post
```

### Opção 3: Usando o Navegador (Console do DevTools)

1. Abra o navegador (Chrome, Firefox, Edge)
2. Pressione F12 para abrir o DevTools
3. Vá para a aba "Console"
4. Cole e execute:

```javascript
// Testar verificação de lembretes
fetch('http://localhost:8080/api/v1/lembretes/verificar', {
  method: 'POST'
})
.then(response => response.text())
.then(data => console.log('Resultado:', data))
.catch(error => console.error('Erro:', error));

// Limpar cache
fetch('http://localhost:8080/api/v1/lembretes/limpar-cache', {
  method: 'POST'
})
.then(response => response.text())
.then(data => console.log('Cache limpo:', data));
```

## 📝 Passo a Passo para Teste Completo

### 1️⃣ Preparar Tarefa de Teste

Crie uma tarefa com prazo de entrega daqui a **3 horas**:

**SQL Direto:**
```sql
-- Inserir tarefa de teste (ajuste o horário para daqui a 3 horas)
INSERT INTO tarefa (nome, descricao, dataInicio, dataEntrega, statusTarefa, id_administrador)
VALUES ('Tarefa Teste Lembrete', 
        'Esta é uma tarefa para testar o sistema de lembretes', 
        NOW(), 
        DATE_ADD(NOW(), INTERVAL 3 HOUR), 
        'PENDENTE', 
        1);

-- Pegar o ID da tarefa criada
SELECT LAST_INSERT_ID();

-- Atribuir usuário à tarefa (substitua 999 pelo ID da tarefa e 1 pelo ID do usuário)
INSERT INTO tarefaUsuario (id_tarefa, id_usuario, favorita)
VALUES (999, 1, false);
```

**Ou via API:**
```json
POST http://localhost:8080/api/v1/tarefa
Content-Type: application/json

{
  "nome": "Tarefa Teste Lembrete",
  "descricao": "Testar sistema de lembretes",
  "idAdministrador": 1,
  "statusTarefa": "PENDENTE",
  "dataInicio": "2026-01-06T10:00:00",
  "dataEntrega": "2026-01-06T13:00:00",  // Ajuste para daqui a 3 horas
  "usuariosIds": [1, 2]
}
```

### 2️⃣ Executar Verificação

Método A - Aguardar Execução Automática (00 ou 30 minutos de cada hora)

Método B - Forçar Execução:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/lembretes/verificar" -Method Post
```

### 3️⃣ Verificar Resultados

1. **Console do Backend** - Veja os logs:
   ```
   INFO  - Iniciando verificação de tarefas próximas do prazo...
   INFO  - Lembrete enviado para usuario@email.com...
   INFO  - Verificação concluída. X tarefas verificadas, Y emails enviados
   ```

2. **Email** - Verifique a caixa de entrada dos usuários responsáveis

3. **Teste Novamente** (mesmo horário):
   - Tente executar `/verificar` novamente
   - Deve informar que a tarefa já foi notificada
   - Use `/limpar-cache` se quiser forçar novo envio

## ⚠️ Troubleshooting

### Problema: Nenhum email enviado

**Possíveis causas:**

1. **Tarefa não está na janela de 3 horas**
   - Solução: Ajuste a `dataEntrega` para daqui a exatamente 3 horas

2. **Tarefa já está concluída**
   - Solução: Verifique se `statusTarefa` é PENDENTE ou EM_ANDAMENTO

3. **Tarefa já foi notificada hoje**
   - Solução: Execute `/limpar-cache` e tente novamente

4. **Sem usuários atribuídos**
   - Solução: Verifique a tabela `tarefaUsuario`

5. **Configuração de email inválida**
   - Solução: Verifique `application.properties`

### Verificar Configuração do Email

```properties
# Verifique estas configurações em application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=adm.vertask@gmail.com
spring.mail.password=ingq agjj fddq phpw
```

### Testar Envio de Email Manualmente

Execute este SQL para verificar se o email está funcionando:

```sql
-- Crie uma tarefa com prazo daqui a 3 horas exatas
SET @prazo = DATE_ADD(NOW(), INTERVAL 3 HOUR);

INSERT INTO tarefa (nome, descricao, dataInicio, dataEntrega, statusTarefa, id_administrador)
VALUES ('TESTE IMEDIATO', 'Teste', NOW(), @prazo, 'PENDENTE', 1);

-- Atribua a você mesmo
INSERT INTO tarefaUsuario (id_tarefa, id_usuario)
VALUES (LAST_INSERT_ID(), SEU_ID_USUARIO);
```

## 📊 Comandos Úteis para Debug

### Ver tarefas que seriam notificadas agora:

```sql
SELECT 
    t.id_tarefa,
    t.nome,
    t.dataEntrega,
    t.statusTarefa,
    TIMESTAMPDIFF(MINUTE, NOW(), t.dataEntrega) as minutos_restantes
FROM tarefa t
WHERE t.dataEntrega IS NOT NULL
  AND t.statusTarefa IN ('PENDENTE', 'EM_ANDAMENTO', 'ATRASADO')
  AND TIMESTAMPDIFF(MINUTE, NOW(), t.dataEntrega) BETWEEN 165 AND 195
ORDER BY t.dataEntrega;
```

### Ver usuários de uma tarefa:

```sql
SELECT u.* 
FROM usuario u
INNER JOIN tarefaUsuario tu ON u.id_usuario = tu.id_usuario
WHERE tu.id_tarefa = 123;  -- Substitua pelo ID da tarefa
```

## ✅ Sucesso!

Se você viu logs no console e recebeu emails, o sistema está funcionando perfeitamente! 🎉

O scheduler continuará executando automaticamente a cada 30 minutos.
