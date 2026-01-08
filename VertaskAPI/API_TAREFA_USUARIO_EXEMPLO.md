# API Tarefa com Usuários - Exemplos de Uso

## Criando uma Tarefa com Usuários

Agora quando você criar uma tarefa, pode incluir uma lista de IDs de usuários que serão automaticamente atribuídos à tarefa.

### Exemplo de Requisição POST para criar tarefa:

```json
POST /api/v1/tarefa
Content-Type: application/json

{
    "nome": "Desenvolver Nova Funcionalidade",
    "descricao": "Implementar sistema de relatórios",
    "idAdministrador": 1,
    "statusTarefa": "PENDENTE",
    "dataInicio": "2025-08-23T08:00:00",
    "dataEntrega": "2025-09-15T17:00:00",
    "usuariosIds": [2, 3, 5]
}
```

### O que acontece:
1. A tarefa é criada no banco
2. Automaticamente são criados registros em `tarefaUsuario` para cada usuário informado
3. Os usuários com IDs 2, 3 e 5 ficam atribuídos à tarefa

## Atualizando uma Tarefa com Usuários

### Exemplo de Requisição PUT para atualizar tarefa:

```json
PUT /api/v1/tarefa
Content-Type: application/json

{
    "idTarefa": 1,
    "nome": "Desenvolver Nova Funcionalidade - Atualizada",
    "descricao": "Implementar sistema de relatórios com dashboard",
    "idAdministrador": 1,
    "statusTarefa": "EM_PROGRESSO",
    "dataInicio": "2025-08-23T08:00:00",
    "dataEntrega": "2025-09-20T17:00:00",
    "usuariosIds": [2, 4, 6]
}
```

### O que acontece:
1. A tarefa é atualizada no banco
2. **Todos** os usuários atualmente atribuídos à tarefa são removidos
3. Os novos usuários (IDs 2, 4 e 6) são atribuídos à tarefa

## Consultando Usuários de uma Tarefa

### Exemplo de Requisição GET para buscar usuários de uma tarefa:

```http
GET /api/v1/tarefa/1/usuarios
```

### Resposta:
```json
[
    {
        "id_usuario": 2,
        "nome": "João Silva",
        "email": "joao@email.com"
    },
    {
        "id_usuario": 4,
        "nome": "Maria Santos",
        "email": "maria@email.com"
    },
    {
        "id_usuario": 6,
        "nome": "Pedro Costa",
        "email": "pedro@email.com"
    }
]
```

## Deletando uma Tarefa

Quando você deletar uma tarefa, todos os usuários atribuídos são automaticamente removidos:

```http
DELETE /api/v1/tarefa/1
```

### O que acontece:
1. Todos os registros de `tarefaUsuario` relacionados à tarefa são removidos
2. A tarefa é removida do banco

## Notas Importantes

- O campo `usuariosIds` é opcional. Se não for informado, a tarefa será criada sem usuários atribuídos
- Se for informado um array vazio `[]`, nenhum usuário será atribuído
- Ao atualizar, se `usuariosIds` não for informado (null), os usuários atuais permanecerão inalterados
- Se `usuariosIds` for informado na atualização, TODOS os usuários atuais serão substituídos pelos novos
