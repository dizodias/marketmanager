# MarketManager

[![English](https://img.shields.io/badge/README-English-blue)](README.en.md)

Sistema full stack para **gestão de estoque de supermercados**: cadastro de produtos, categorias, tipos, movimentações de estoque, painel administrativo e **monitor em tempo real** da API e do inventário.

## Visão geral

| Camada | Tecnologia | Pasta |
|--------|------------|--------|
| Backend | Spring Boot 4, Java 17, JPA, MySQL, JWT, WebSocket | `src/main/java/com/marketmanager/api` |
| Frontend | React 19, Vite, Axios, i18n (PT/EN/ES) | `react-dashboard/` |

### Funcionalidades principais

- Autenticação JWT (admin e usuários)
- CRUD de produtos, categorias e tipos de produto
- Movimentações de estoque (entrada, saída, ajuste, etc.)
- Histórico de alterações por produto
- Dashboard com feed HTTP e eventos de estoque via STOMP
- Modo simples/técnico no monitor
- Tema claro/escuro e sugestão automática de SKU no cadastro

### Arquitetura do backend

Fluxo: **Controller → Service → Repository → MySQL**

- **DTO** + Bean Validation (`@Valid`) na entrada
- **GlobalExceptionHandler** para erros padronizados (404, 409, 422, 400)
- Seeds iniciais (admin, categorias e tipos) via `DataSeeder`

## Pré-requisitos

- Java 17 (JDK)
- Node.js 18+ e npm
- MySQL 8 em execução local
- Maven Wrapper incluído (`mvnw` / `mvnw.cmd`)

## Configuração do banco

1. Inicie o MySQL.
2. Ajuste credenciais em `src/main/resources/application.properties` se necessário:

```properties
spring.datasource.username=root
spring.datasource.password=admin
```

3. O banco `marketmanager_db` é criado automaticamente na primeira execução.

## Como rodar localmente

### 1. Backend (porta 8080)

Na **raiz deste repositório**:

**Windows (PowerShell):**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
./mvnw spring-boot:run
```

API: `http://localhost:8080`

### 2. Frontend (porta 5173)

Em outro terminal:

```bash
cd react-dashboard
npm install
npm run dev
```

Acesse: **http://localhost:5173**

O Vite faz proxy de `/api` e `/ws` para o backend.

### 3. Login padrão

| Campo | Valor |
|-------|--------|
| E-mail | `admin@marketmanager.com` |
| Senha | `admin` |

## Comandos úteis

```powershell
.\mvnw.cmd test
```

```bash
cd react-dashboard
npm run build
npm run lint
```

## Estrutura do repositório

```
.
├── src/main/java/com/marketmanager/api/
├── src/main/resources/application.properties
├── react-dashboard/
├── docs/
├── pom.xml
└── mvnw / mvnw.cmd
```
