-- Migration: create unified cliente table (empresa OR pessoa)
CREATE TABLE IF NOT EXISTS cliente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('empresa','pessoa') NOT NULL DEFAULT 'empresa',
  nome VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255) NULL,
  cpf VARCHAR(11) NULL,
  cnpj VARCHAR(14) NULL,
  endereco VARCHAR(500) NULL,
  telefone VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  honorario DECIMAL(13,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cliente_cpf (cpf),
  UNIQUE KEY uq_cliente_cnpj (cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If you already have a table `empresa`, you can migrate its rows with the following (verify column names first):
-- INSERT INTO cliente (tipo, nome, nome_fantasia, cnpj, endereco, telefone, email, honorario, created_at, updated_at)
-- SELECT 'empresa', nome, nome_fantasia, cnpj, endereco, telefone, email, honorario, created_at, updated_at
-- FROM empresa;
