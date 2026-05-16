# MarketManager

[![Português](https://img.shields.io/badge/README-Português-green)](README.md)

Full-stack **supermarket inventory management**: product catalog, categories, product types, stock movements, admin area, and a **real-time monitor** for API traffic and inventory events.

## Overview

| Layer | Stack | Location |
|-------|--------|----------|
| Backend | Spring Boot 4, Java 17, JPA, MySQL, JWT, WebSocket | `src/main/java/com/marketmanager/api` |
| Frontend | React 19, Vite, Axios, i18n (PT/EN/ES) | `react-dashboard/` |

### Main features

- JWT authentication (admin and standard users)
- CRUD for products, categories, and product types
- Stock movements (receipt, sale, adjustment, etc.)
- Per-product change history
- Dashboard with HTTP feed and inventory events over STOMP
- Simple/technical monitor modes
- Light/dark theme and automatic SKU suggestions

### Backend architecture

Request flow: **Controller → Service → Repository → MySQL**

- **DTOs** + Bean Validation (`@Valid`) on input
- **GlobalExceptionHandler** for consistent API errors
- Initial data seed via `DataSeeder`

## Prerequisites

- Java 17 (JDK)
- Node.js 18+ and npm
- MySQL 8 running locally
- Maven Wrapper included (`mvnw` / `mvnw.cmd`)

## Database setup

1. Start MySQL.
2. Update `src/main/resources/application.properties` if needed:

```properties
spring.datasource.username=root
spring.datasource.password=admin
```

3. Database `marketmanager_db` is created on first run.

## Run locally

### 1. Backend (port 8080)

From the **repository root**:

**Windows (PowerShell):**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
./mvnw spring-boot:run
```

API: `http://localhost:8080`

### 2. Frontend (port 5173)

In a second terminal:

```bash
cd react-dashboard
npm install
npm run dev
```

Open: **http://localhost:5173**

### 3. Default login

| Field | Value |
|-------|--------|
| Email | `admin@marketmanager.com` |
| Password | `admin` |

## Useful commands

```bash
./mvnw test
cd react-dashboard && npm run build && npm run lint
```

On Windows use `.\mvnw.cmd` instead of `./mvnw`.

## Repository layout

```
.
├── src/main/java/com/marketmanager/api/
├── src/main/resources/application.properties
├── react-dashboard/
├── docs/
├── pom.xml
└── mvnw / mvnw.cmd
```
