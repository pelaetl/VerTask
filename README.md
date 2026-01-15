# VerTask

O VerTask é um ecossistema centralizado projetado para otimizar o ciclo de vida das demandas corporativas. Unindo a robustez de um backend em Spring Boot à flexibilidade de uma interface Ionic/Angular, a plataforma oferece uma experiência web responsiva e segura para o controle total de operações, desde o planejamento inicial até a entrega final.

## 📹 Demonstração em Vídeo

[▶️ Assistir demonstração completa do sistema](https://youtu.be/vOLgercZUsk)

## 📖 Sobre o Projeto
O VerTask é uma plataforma de gerenciamento de fluxos de
trabalho desenhada para transformar tarefas abstratas em
processos visuais e auditáveis. O sistema centraliza a operação em
um ecossistema digital onde cada demanda é rastreada desde a
sua criação até a entrega final, o que facilita e melhora o trabalho em conjunto entre funcionários e gestores responsáveis por lidar com esses processos.

Muitas organizações ainda enfrentam problemas operacionais
devido ao uso de ferramentas fragmentadas (e-mail, WhatsApp e
planilhas) para a gestão de tarefas. Esta falta de padronização
resulta em:

- **Dificuldade na
monitorização do
progresso em tempo real.**

- **Falhas na comunicação
entre gestores e
colaboradores.**

- **Atrasos críticos por falta
de alertas automáticos.**

### Propósito do projeto

Dessa forma, a proposta do sistema é unificar todo o processo e atributos que compõe uma
tarefa num único local: os responsáveis, o prazo, a documentação
técnica (PDFs) necessária, um chat para troca de informações e os dados do cliente.

##  🚀 Tecnologias

### Backend (API)
- **Java** 24
- **Spring Boot** 3.5.0
- **Spring Data JPA** 
- **Spring Security** 
- **JWT** 
- **MySQL** 
- **Maven** 
- **Lombok**
- **Netty/Socket.IO** 

### Frontend (Ionic/Angular)
- **Angular** 
- **Ionic**
- **Angular CDK**
- **Chart.js**
- **PDF.js**
- **STOMP.js**
- **Auth0 JWT**
- **Capacitor**  
- **TypeScript** 
- **RxJS** 
- **Socket.IO Client**
- **SCSS**
- **ESLint**
- **Karma/Jasmine**

## 📁 Estrutura do Projeto
```
projetoCompleto/
├── VertaskAPI/                    # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml                    # Dependências Maven
│   ├── mvnw / mvnw.cmd            # Maven Wrapper
│   └── ScriptBD.txt               # Script SQL inicial
│
├── Vertask - Ionic/               # Frontend (Ionic/Angular)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/             # Páginas (tarefas, perfil, etc)
│   │   │   ├── services/          # Serviços (API calls, dados)
│   │   │   ├── model/             # Modelos/Interfaces
│   │   │   └── app.module.ts
│   │   ├── assets/
│   │   ├── theme/
│   │   └── index.html
│   ├── angular.json
│   ├── ionic.config.json
│   ├── capacitor.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                      # Este arquivo
```

## ⚙️ Configuração e Instalação
### 1. Clone o repositório


```bash
git clone https://github.com/pelaetl/VerTask.git
cd projetoCompleto
```


### 2. Configurar o Banco de Dados


#### MySQL local
Copie o script do arquivo DB_SCHEMA.md anexado neste repositorio 


### 3. Configurar o Backend


Navegue até `VertaskAPI/src/main/resources/` e crie/edite `application.properties`:


```properties
# Banco de Dados
spring.datasource.url=jdbc:mysql://localhost:3306/vertask?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=vertask_user
spring.datasource.password=sua_senha
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false


# Servidor
server.port=8080
server.servlet.context-path=/api


# JWT (se aplicável)
jwt.secret=sua_chave_secreta_muito_longa_e_segura_aqui
jwt.expiration=86400000


# Uploads
upload.dir=./uploads/tarefas
```


### 4. Instalar Dependências


**Backend:**
```bash
cd VertaskAPI
./mvnw clean install    # No Windows: mvnw.cmd clean install
```


**Frontend:**
```bash
cd "Vertask - Ionic"
npm install
```

## ▶️ Como Executar


### Backend (API)


```bash
cd VertaskAPI
./mvnw spring-boot:run   # No Windows: mvnw.cmd spring-boot:run
```

### Frontend (Ionic/Angular)


```bash
cd "Vertask - Ionic"
npm start        # Equivalente a: ionic serve
```
## 📁 Documentação Completa
Link: https://docs.google.com/document/d/13ZusiKqUu2w0N-FHyo3qJ9v_1SDz1HgZT4Bum5-6cgA/edit?usp=sharing

📄 [Baixar Documentação em PDF](https://github.com/pelaetl/VerTask/blob/main/Documentacao_do_Software_VerTask)

## 👤 Autor 
**Desenvolvido por Pedro de Laet Leite** - [@pelaetl](https://github.com/pelaetl) - pedroll2109@gmail.com


