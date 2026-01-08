-- Conversations / group chat tables for tasks
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tarefa_id INT NULL,
  name VARCHAR(160) NULL,
  description TEXT NULL,
  owner_id INT NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_conversations_tarefa (tarefa_id),
  KEY idx_conversations_owner (owner_id),
  CONSTRAINT fk_conversations_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefa(id_tarefa) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_message_id INT NULL,
  notifications VARCHAR(16) NOT NULL DEFAULT 'all',
  PRIMARY KEY (conversation_id, user_id),
  KEY idx_cm_user (user_id),
  KEY idx_cm_last_read (conversation_id, last_read_message_id),
  CONSTRAINT fk_cm_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_cm_user FOREIGN KEY (user_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversation_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  reply_to_id INT NULL,
  KEY idx_cm_conv_time (conversation_id, created_at),
  KEY idx_cm_sender_time (sender_id, created_at),
  CONSTRAINT fk_cmsg_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_cmsg_sender FOREIGN KEY (sender_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_cmsg_reply_to FOREIGN KEY (reply_to_id) REFERENCES conversation_messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversation_message_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  width INT NULL,
  height INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cma_message FOREIGN KEY (message_id) REFERENCES conversation_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversation_message_reactions (
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  emoji VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id, emoji),
  CONSTRAINT fk_cmr_message FOREIGN KEY (message_id) REFERENCES conversation_messages(id) ON DELETE CASCADE,
  CONSTRAINT fk_cmr_user FOREIGN KEY (user_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
