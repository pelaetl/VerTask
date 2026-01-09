# VerTask

VerTask é uma plataforma completa e centralizada de gerenciamento de tarefas que permite planejar, acompanhar, reportar andamento e concluir tarefas em equipe. Integra um backend robusto em Spring Boot, que oferece APIs seguras para autenticação, usuários e tarefas, e um frontend em Ionic/Angular pensado para uma interface web responsiva. Organize entregas, atribua responsáveis, vincule clientes e mantenha documentos centralizados, tudo em um fluxo simples e moderno.

## 📖 Sobre o Projeto
O VerTask permite cadastrar e gerenciar tarefas, responsáveis, clientes e arquivos associados. O backend expõe APIs REST e o frontend entrega uma interface web responsiva construída com Ionic/Angular.

##  Tecnologias

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

## 📜 Scripts Disponíveis


### Backend (VertaskAPI)


| Comando | Descrição |
|---------|-----------|
| `./mvnw clean install` | Compila e instala dependências |
| `./mvnw spring-boot:run` | Executa a aplicação |
| `./mvnw test` | Roda testes unitários |
| `./mvnw clean package` | Gera JAR executável |


### Frontend (Vertask - Ionic)


| Comando | Descrição |
|---------|-----------|
| `npm start` | Servidor de desenvolvimento (porta 4200) |
| `npm run build` | Build de produção |
| `npm run test` | Testes (Karma/Jasmine) |
| `npm run lint` | Linter (ESLint) |
| `npm run watch` | Build em modo watch |
| `ionic capacitor add` | Adiciona plataforma nativa (iOS/Android) |
| `ionic capacitor build ios` | Build para iOS |
| `ionic capacitor build android` | Build para Android |



