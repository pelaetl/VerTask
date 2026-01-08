# API de Tarefas com Atribuição de Usuários

A tabela `tarefaUsuario` agora será povoada automaticamente quando você criar ou atualizar tarefas com usuários atribuídos.

## Endpoints Disponíveis

### 1. Criar Tarefa com Usuários
**POST** `/api/v1/tarefa`

```json
{
  "nome": "Desenvolver API",
  "descricao": "Criar endpoints para o sistema",
  "idAdministrador": 1,
  "statusTarefa": "Pendente",
  "dataInicio": "2024-01-15T09:00:00",
  "dataEntrega": "2024-01-30T18:00:00",
  "usuariosIds": [2, 3, 5]
}
```

### 2. Atualizar Tarefa com Usuários
**PUT** `/api/v1/tarefa`

```json
{
  "idTarefa": 1,
  "nome": "Desenvolver API - Atualizada",
  "descricao": "Criar endpoints para o sistema com testes",
  "idAdministrador": 1,
  "statusTarefa": "Em Andamento",
  "dataInicio": "2024-01-15T09:00:00",
  "dataEntrega": "2024-02-05T18:00:00",
  "usuariosIds": [2, 4, 6]
}
```

### 3. Buscar Tarefa por ID (com usuários)
**GET** `/api/v1/tarefa/1`

Retorna:
```json
{
  "idTarefa": 1,
  "nome": "Desenvolver API",
  "descricao": "Criar endpoints para o sistema",
  "idAdministrador": 1,
  "statusTarefa": "Pendente",
  "dataInicio": "2024-01-15T09:00:00",
  "dataEntrega": "2024-01-30T18:00:00",
  "usuariosIds": [2, 3, 5]
}
```

### 4. Atribuir Usuário Individual à Tarefa
**POST** `/api/v1/tarefa/1/usuarios/7`

### 5. Remover Usuário de uma Tarefa
**DELETE** `/api/v1/tarefa/1/usuarios/3`

### 6. Listar Usuários de uma Tarefa
**GET** `/api/v1/tarefa/1/usuarios`

## Como Funciona

1. **Criação de Tarefa**: Quando você cria uma tarefa e inclui o campo `usuariosIds` no JSON, o sistema automaticamente povoa a tabela `tarefaUsuario`.

2. **Atualização de Tarefa**: Ao atualizar uma tarefa com novos `usuariosIds`, o sistema:
   - Remove todas as atribuições antigas da tarefa
   - Adiciona as novas atribuições

3. **Exclusão de Tarefa**: Quando uma tarefa é excluída, todas as suas atribuições na tabela `tarefaUsuario` são removidas automaticamente.

4. **Consulta de Tarefas**: Os endpoints GET agora retornam as tarefas com os IDs dos usuários atribuídos.

## Exemplo Prático

Para criar uma tarefa e atribuir usuários com IDs 2, 3 e 5:

```bash
curl -X POST http://localhost:8080/api/v1/tarefa \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste de Integração",
    "descricao": "Implementar testes automatizados",
    "idAdministrador": 1,
    "statusTarefa": "Pendente",
    "dataInicio": "2024-01-20T09:00:00",
    "dataEntrega": "2024-02-10T17:00:00",
    "usuariosIds": [2, 3, 5]
  }'
```

Após esta requisição, a tabela `tarefaUsuario` terá três registros:
- (idTarefa, idUsuario) = (nova_id, 2)
- (idTarefa, idUsuario) = (nova_id, 3)  
- (idTarefa, idUsuario) = (nova_id, 5)
