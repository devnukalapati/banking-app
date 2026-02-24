# NexaBank — Customer Registration App

A full-stack banking customer registration application built with **React** (frontend) and **Spring Boot** (backend), backed by **Supabase PostgreSQL**.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Provision the Database](#2-provision-the-database)
  - [3. Configure the Backend](#3-configure-the-backend)
  - [4. Configure the Frontend](#4-configure-the-frontend)
  - [5. Run the Backend](#5-run-the-backend)
  - [6. Run the Frontend](#6-run-the-frontend)
- [Environment Variables Reference](#environment-variables-reference)
- [Production Deployment](#production-deployment)
  - [Backend — JAR on a Linux Server](#backend--jar-on-a-linux-server)
  - [Frontend — Static Build via Nginx](#frontend--static-build-via-nginx)
  - [Docker (Optional)](#docker-optional)
- [API Reference](#api-reference)
- [Security Notes](#security-notes)

---

## Architecture Overview

```
┌──────────────────────┐        HTTP/REST        ┌──────────────────────────┐
│  React + Vite        │  ──────────────────────▶ │  Spring Boot 3.2         │
│  (port 5173 dev)     │                          │  (port 8080)             │
│  NexaBank branded UI │ ◀────────────────────── │  CustomerController      │
└──────────────────────┘    JSON responses        │  CustomerService         │
                                                  │  EncryptionService       │
                                                  └───────────┬──────────────┘
                                                              │ JDBC / JPA
                                                              ▼
                                                  ┌──────────────────────────┐
                                                  │  Supabase PostgreSQL     │
                                                  │  (customers table)       │
                                                  └──────────────────────────┘
```

**Key design decisions:**
- SSN is encrypted with **AES-256-GCM** before writing to the database. The plaintext SSN never persists anywhere.
- All API responses return a masked SSN (`***-**-XXXX`).
- The Supabase MCP URL is externalized via `${SUPABASE_MCP_URL}` — never hardcoded.

---

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Java (JDK) | 17 | Tested on JDK 21. [Download](https://adoptium.net/) |
| Apache Maven | 3.6 | [Download](https://maven.apache.org/download.cgi) |
| Node.js | 18 | Tested on v22. [Download](https://nodejs.org/) |
| npm | 9 | Bundled with Node.js |
| Git | 2.x | [Download](https://git-scm.com/) |
| Supabase account | — | [supabase.com](https://supabase.com/) — free tier is sufficient |

---

## Project Structure

```
banking/
├── .env.example                 # Root env vars (MCP URL)
├── .mcp.json                    # Supabase MCP config (URL from env)
├── .gitignore
├── database/
│   └── schema.sql               # Run once in Supabase SQL Editor
├── backend/                     # Spring Boot application
│   ├── .env.example
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/nexabank/
│       │   ├── BankingApplication.java
│       │   ├── config/          # CORS
│       │   ├── controller/      # REST endpoints
│       │   ├── dto/             # Request / Response objects
│       │   ├── exception/       # Custom exceptions + global handler
│       │   ├── model/           # JPA entity
│       │   ├── repository/      # Spring Data JPA
│       │   └── service/         # Business logic + AES encryption
│       └── test/                # Unit tests (10 tests)
└── frontend/                    # React + Vite application
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx / App.css
        ├── components/
        │   ├── Banner.jsx        # NexaBank top banner
        │   ├── CustomerForm.jsx  # Main form container
        │   └── form/             # Form section components
        └── services/
            └── customerApi.js    # Axios API client
```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:devnukalapati/banking-app.git
cd banking-app
```

---

### 2. Provision the Database

Log in to [supabase.com](https://supabase.com/), open your project's **SQL Editor**, and run the contents of:

```
database/schema.sql
```

This creates the `customers` table, an email index, and an `updated_at` auto-update trigger.

---

### 3. Configure the Backend

**a) Copy the example env file:**

```bash
cp backend/.env.example backend/.env
```

**b) Fill in `backend/.env`:**

```env
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<your-supabase-database-password>
ENCRYPTION_SECRET_KEY=<base64-encoded-32-byte-key>
CORS_ALLOWED_ORIGINS=http://localhost:5173
SERVER_PORT=8080
```

> **Finding your Supabase credentials:**
> Supabase Dashboard → Project → **Settings → Database** → Connection string (copy the password from there).

**c) Generate an AES-256 encryption key** (run once, save the output as `ENCRYPTION_SECRET_KEY`):

```bash
openssl rand -base64 32
```

> Store this key securely. Losing it means encrypted SSN data cannot be decrypted.

---

### 4. Configure the Frontend

```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> In development, the Vite proxy in `vite.config.js` forwards `/api` requests to `localhost:8080`, so this variable is only needed for production builds.

---

### 5. Run the Backend

```bash
cd backend

# Load environment variables and start
export $(cat .env | xargs)
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

To verify it is running:

```bash
curl http://localhost:8080/api/customers/00000000-0000-0000-0000-000000000000
# Expected: 404 Not Found
```

**Run tests:**

```bash
mvn test
```

---

### 6. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Full JDBC URL: `jdbc:postgresql://db.<ref>.supabase.co:5432/postgres` |
| `DATABASE_USERNAME` | Yes | Supabase DB username (default: `postgres`) |
| `DATABASE_PASSWORD` | Yes | Supabase DB password |
| `ENCRYPTION_SECRET_KEY` | Yes | Base64-encoded 32-byte AES key (`openssl rand -base64 32`) |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins, e.g. `http://localhost:5173` |
| `SERVER_PORT` | No | HTTP port (default: `8080`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | No (dev) | Backend base URL. Required for production builds. |

### Root (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_MCP_URL` | For MCP only | Full Supabase MCP URL including project ref and API key |

---

## Production Deployment

### Backend — JAR on a Linux Server

**1. Build the JAR:**

```bash
cd backend
mvn clean package -DskipTests
# Output: target/banking-backend-0.0.1-SNAPSHOT.jar
```

**2. Transfer to server:**

```bash
scp target/banking-backend-0.0.1-SNAPSHOT.jar user@your-server:/opt/nexabank/
```

**3. Create a systemd service** (`/etc/systemd/system/nexabank.service`):

```ini
[Unit]
Description=NexaBank Backend
After=network.target

[Service]
User=nexabank
WorkingDirectory=/opt/nexabank
EnvironmentFile=/opt/nexabank/.env
ExecStart=/usr/bin/java -jar banking-backend-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**4. Start the service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable nexabank
sudo systemctl start nexabank
sudo journalctl -u nexabank -f   # view logs
```

> Set `CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com` in the server's `.env`.

---

### Frontend — Static Build via Nginx

**1. Build the static assets:**

```bash
cd frontend
VITE_API_BASE_URL=https://api.your-domain.com npm run build
# Output: frontend/dist/
```

**2. Copy to server:**

```bash
scp -r dist/* user@your-server:/var/www/nexabank/
```

**3. Nginx config** (`/etc/nginx/sites-available/nexabank`):

```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;

    root /var/www/nexabank;
    index index.html;

    # React SPA — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Spring Boot
    location /api/ {
        proxy_pass         http://localhost:8080;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nexabank /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> For HTTPS, use [Certbot](https://certbot.eff.org/): `sudo certbot --nginx -d your-frontend-domain.com`

---

### Docker (Optional)

**Backend `Dockerfile`** (`backend/Dockerfile`):

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/banking-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend `Dockerfile`** (`frontend/Dockerfile`):

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

Pass secrets at runtime via `--env-file`, never baked into the image.

---

## API Reference

### `POST /api/customers`

Creates a new customer. SSN is encrypted before storage.

**Request body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1988-05-20",
  "email": "jane.smith@example.com",
  "phone": "+1-800-555-0199",
  "streetAddress": "456 Oak Ave",
  "city": "Austin",
  "state": "Texas",
  "zipCode": "73301",
  "country": "United States",
  "employmentStatus": "EMPLOYED",
  "employerName": "Acme Corp",
  "jobTitle": "Analyst",
  "yearsEmployed": 3,
  "annualSalary": 75000.00,
  "incomeSource": "EMPLOYMENT",
  "accountType": "CHECKING",
  "creditScoreRange": "740-799",
  "ssn": "123-45-6789"
}
```

**Response `201 Created`:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "ssnMasked": "***-**-6789",
  "createdAt": "2026-02-23T20:00:00"
}
```

---

### `GET /api/customers/{id}`

Retrieves a customer by UUID. SSN is returned masked.

**Response `200 OK`:** Same shape as above.

---

### Error responses

| Status | Scenario |
|--------|----------|
| `400` | Validation failure — `fieldErrors` map included |
| `404` | Customer ID not found |
| `409` | Email already registered |
| `500` | Unexpected server error |

---

## Security Notes

- **SSN** is encrypted with AES-256-GCM (random IV per record). The plaintext SSN is never logged or stored.
- **Encryption key** must be kept secret and backed up. Rotation requires re-encrypting all records.
- **Environment variables** — never commit `.env` files. Use secrets managers (AWS Secrets Manager, HashiCorp Vault, etc.) in production.
- **HTTPS** — always terminate TLS in production. The Nginx config above includes Certbot instructions.
- **Supabase RLS** — consider enabling Row Level Security on the `customers` table for additional database-layer access control.
