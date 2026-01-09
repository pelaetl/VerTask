# VerTask – Esquema do Banco de Dados

Resumo do modelo MySQL utilizado pelo sistema. Ordene as criações conforme a sequência abaixo para respeitar as dependências.

## Sequência de Criação

create database vertask;
use vertask;

```sql
CREATE TABLE usuario (
  id_usuario     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome           VARCHAR(70)  NOT NULL,
  email          VARCHAR(100) NOT NULL UNIQUE,
  senha          VARCHAR(250) NOT NULL,
  foto           VARCHAR(255),
  role           VARCHAR(45)  NOT NULL,
  dtAlteracao    DATETIME DEFAULT NULL,
  dtCriacao      DATETIME NOT NULL
);

CREATE TABLE setor (
  id_setor   INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  nome       VARCHAR(20)  NOT NULL,
  descricao  VARCHAR(200) NOT NULL
);

CREATE TABLE cliente (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  tipo          ENUM('empresa','pessoa') NOT NULL DEFAULT 'empresa',
  nome          VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cpf           VARCHAR(11) UNIQUE,
  cnpj          VARCHAR(14) UNIQUE,
  endereco      VARCHAR(500),
  telefone      VARCHAR(30),
  email         VARCHAR(150),
  honorario     DECIMAL(13,2) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE administrador (
  id_administrador INT,
  FOREIGN KEY (id_administrador) REFERENCES usuario(id_usuario)
);

CREATE TABLE funcionario (
  id_funcionario INT,
  id_setor       INT,
  FOREIGN KEY (id_setor)       REFERENCES setor(id_setor),
  FOREIGN KEY (id_funcionario) REFERENCES usuario(id_usuario)
);

CREATE TABLE tarefa (
  id_tarefa          INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  nome               VARCHAR(20)  NOT NULL,
  descricao          VARCHAR(200) NOT NULL,
  dataInicio         DATETIME     NOT NULL,
  dataEntrega        DATETIME     NOT NULL,
  statusTarefa       VARCHAR(50)  NOT NULL,
  id_administrador   INT,
  documento_nome     VARCHAR(255),
  documento_mime     VARCHAR(100),
  documento_tamanho  BIGINT,
  documento_path     VARCHAR(500),
  notify_admin       BOOLEAN DEFAULT FALSE,
  observacao         TEXT,
  cliente_id         INT,
  FOREIGN KEY (id_administrador) REFERENCES administrador(id_administrador),
  FOREIGN KEY (cliente_id)       REFERENCES cliente(id) ON DELETE SET NULL
);

CREATE TABLE tarefaUsuario (
  id_tarefa   INT,
  id_usuario  INT,
  favorita    BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_tarefa)  REFERENCES tarefa(id_tarefa)
);

CREATE TABLE mensagem (
  id_mensagem    INT PRIMARY KEY AUTO_INCREMENT,
  id_tarefa      INT NOT NULL,
  id_remetente   INT NULL,
  nome_remetente VARCHAR(255) NULL,
  conteudo       TEXT NOT NULL,
  data_envio     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tarefa) REFERENCES tarefa(id_tarefa)
);

CREATE TABLE conversations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tarefa_id   INT NULL,
  name        VARCHAR(160),
  description TEXT,
  owner_id    INT NULL,
  is_public   TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tarefa_id) REFERENCES tarefa(id_tarefa) ON DELETE SET NULL
);

CREATE TABLE conversation_members (
  conversation_id      INT NOT NULL,
  user_id              INT NOT NULL,
  role                 VARCHAR(16) NOT NULL DEFAULT 'member',
  joined_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_message_id INT NULL,
  notifications        VARCHAR(16) NOT NULL DEFAULT 'all',
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)         REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE conversation_messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id       INT NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at       TIMESTAMP NULL,
  deleted_at      TIMESTAMP NULL,
  reply_to_id     INT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)      REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_id)    REFERENCES conversation_messages(id) ON DELETE SET NULL
);

CREATE TABLE conversation_message_attachments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  url        VARCHAR(500) NOT NULL,
  mime_type  VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  width      INT NULL,
  height     INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES conversation_messages(id) ON DELETE CASCADE
);

CREATE TABLE conversation_message_reactions (
  message_id INT NOT NULL,
  user_id    INT NOT NULL,
  emoji      VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id, emoji),
  FOREIGN KEY (message_id) REFERENCES conversation_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
