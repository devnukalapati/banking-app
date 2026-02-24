# NexaBank — Full-Stack Banking Application

A full-stack banking application built with **React + Vite** (frontend) and **Spring Boot 3** (backend), backed by **Supabase PostgreSQL** in production and **H2 in-memory** for local development.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [User Flows](#user-flows)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Provision the Database](#2-provision-the-database)
  - [3. Configure the Backend](#3-configure-the-backend)
  - [4. Configure the Frontend](#4-configure-the-frontend)
  - [5. Run the Backend](#5-run-the-backend)
  - [6. Run the Frontend](#6-run-the-frontend)
- [Environment Variables Reference](#environment-variables-reference)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Production Deployment](#production-deployment)
  - [Backend — JAR on a Linux Server](#backend--jar-on-a-linux-server)
  - [Frontend — Static Build via Nginx](#frontend--static-build-via-nginx)
  - [Docker (Optional)](#docker-optional)
- [Security Notes](#security-notes)

---

## Features

| Feature | Description |
|---|---|
| **Credit Card Catalog** | Landing page showcasing 4 NexaBank card products with offers and an Apply Now button per card |
| **Customer Application** | Multi-section form (personal, address, employment, financial, SSN) with the selected card shown at the top |
| **Application Decision** | Instant decision — 80% Approved, 10% Pending, 10% Declined — with a distinct result page per outcome |
| **User Registration** | Approved applicants set a username and BCrypt-hashed password |
| **MFA Verification** | 4-digit one-time code (default `9999`) — used in both the registration and login flows |
| **Banking Dashboard** | Post-login screen showing balance, account details, customer profile, and a transaction history |
| **Login Flow** | Returning users authenticate with username + password, then pass the MFA challenge |
| **Logo Navigation** | Clicking the NexaBank logo from any screen returns to the landing page |

---

## Architecture Overview

```
┌──────────────────────────┐       HTTP / REST        ┌────────────────────────────────┐
│  React + Vite            │  ─────────────────────▶  │  Spring Boot 3.2               │
│  (port 5173 dev)         │                          │                                │
│                          │  ◀─────────────────────  │  Controllers                   │
│  Pages                   │       JSON responses      │    CustomerController          │
│    LandingPage           │                          │    UserController              │
│    CustomerForm          │                          │    AccountController           │
│    ApprovedPage          │                          │                                │
│    PendingPage           │                          │  Services                      │
│    DeclinedPage          │                          │    CustomerService             │
│    UserRegistrationPage  │                          │    UserRegistrationService     │
│    MfaPage               │                          │    UserLoginService            │
│    WelcomePage           │                          │    AccountService              │
│    LoginPage             │                          │    EncryptionService           │
│    DashboardPage         │                          └───────────────┬────────────────┘
└──────────────────────────┘                                          │ JPA / JDBC
                                                                      ▼
                                                          ┌───────────────────────────┐
                                                          │  H2 (dev profile)         │
                                                          │  Supabase PostgreSQL (prod)│
                                                          │                           │
                                                          │  Tables                   │
                                                          │    customers              │
                                                          │    app_users              │
                                                          │    bank_accounts          │
                                                          │    transactions           │
                                                          └───────────────────────────┘
```

**Key design decisions:**
- SSN encrypted with **AES-256-GCM** (random IV per record) — plaintext never persists.
- Passwords hashed with **BCrypt** via `spring-security-crypto`.
- Spring **`dev` profile** uses H2 in-memory with `ddl-auto=create-drop` — no database setup needed locally.
- Spring **`prod` profile** targets Supabase PostgreSQL with `ddl-auto=validate`.
- Bank account and demo transactions are provisioned automatically on first MFA verification.

---

## User Flows

### New Customer — Apply and Register

```
Landing Page (card catalog)
  └─ Apply Now →
      Customer Application Form (shows selected card at top)
        └─ Submit →
            ├─ APPROVED → Set Up Your Account →
            │     User Registration (username + password) →
            │     MFA Verification (enter 9999) →
            │     Welcome Page →
            │     Go to Dashboard → Banking Dashboard
            │
            ├─ PENDING  → Under Review page
            └─ DECLINED → Not Approved page
```

### Returning User — Log In

```
Landing Page
  └─ Sign in →
      Login Page (username + password) →
      MFA Verification (enter 9999) →
      Banking Dashboard
```

### Banking Dashboard

Displays after successful login or registration:
- Balance card with account number, type, and currency
- Customer profile (name, username, MFA status, member since)
- Account details (account number, type, currency)
- Recent transactions list (newest first, colour-coded credits/debits)

---

## Project Structure

```
banking/
├── .mcp.json                        # Supabase MCP config (gitignored)
├── .gitignore
├── database/
│   └── schema.sql                   # Run once in Supabase SQL Editor (prod)
│
├── backend/                         # Spring Boot application
│   ├── .env                         # Local secrets (gitignored)
│   ├── .env.example
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/nexabank/
│       │   │   ├── BankingApplication.java
│       │   │   ├── config/
│       │   │   │   ├── AppConfig.java        # BCryptPasswordEncoder bean
│       │   │   │   └── CorsConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── CustomerController.java
│       │   │   │   ├── UserController.java
│       │   │   │   └── AccountController.java
│       │   │   ├── dto/                      # Request / Response DTOs
│       │   │   ├── exception/                # Custom exceptions + GlobalExceptionHandler
│       │   │   ├── model/
│       │   │   │   ├── Customer.java
│       │   │   │   ├── AppUser.java
│       │   │   │   ├── BankAccount.java
│       │   │   │   ├── Transaction.java
│       │   │   │   ├── ApplicationStatus.java  # APPROVED | PENDING | DECLINED
│       │   │   │   └── TransactionType.java    # CREDIT | DEBIT
│       │   │   ├── repository/
│       │   │   └── service/
│       │   │       ├── CustomerService.java
│       │   │       ├── UserRegistrationService.java
│       │   │       ├── UserLoginService.java
│       │   │       ├── AccountService.java
│       │   │       └── EncryptionService.java
│       │   └── resources/
│       │       ├── application.properties        # Shared config
│       │       ├── application-dev.properties    # H2 in-memory
│       │       └── application-prod.properties   # Supabase PostgreSQL
│       └── test/                                 # 29 unit tests
│
└── frontend/                        # React + Vite application
    ├── .env.example
    ├── package.json
    └── src/
        ├── App.jsx                  # Step-based routing state machine
        ├── data/
        │   └── creditCards.js       # 4 card products (Signature, Cashback, Platinum, Student)
        ├── components/
        │   ├── Banner.jsx           # Sticky header — logo click navigates home
        │   ├── CardArt.jsx          # CSS credit card renderer (md / sm sizes)
        │   ├── CustomerForm.jsx     # Application form with optional card banner
        │   └── form/                # PersonalDetails, AddressDetails, EmploymentDetails,
        │                            #   FinancialInfo, SSNInput
        ├── pages/
        │   ├── LandingPage.jsx      # Credit card catalog + hero
        │   ├── ApprovedPage.jsx
        │   ├── PendingPage.jsx
        │   ├── DeclinedPage.jsx
        │   ├── UserRegistrationPage.jsx
        │   ├── MfaPage.jsx          # Shared for registration (Step 3/3) and login flows
        │   ├── WelcomePage.jsx
        │   ├── LoginPage.jsx
        │   └── DashboardPage.jsx    # Balance, transactions, customer profile
        └── services/
            ├── customerApi.js
            ├── userApi.js
            └── accountApi.js
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

**Local development** — no setup needed. The `dev` profile uses H2 in-memory; the schema is created automatically on startup.

**Production** — log in to [supabase.com](https://supabase.com/), open your project's **SQL Editor**, and run:

```
database/schema.sql
```

This creates the `customers`, `app_users`, `bank_accounts`, and `transactions` tables, plus indexes and an `updated_at` trigger.

---

### 3. Configure the Backend

**a) Copy the example env file:**

```bash
cp backend/.env.example backend/.env
```

**b) Fill in `backend/.env`:**

```env
# Required for the prod profile only — leave blank or omit for local dev (H2)
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<your-supabase-database-password>

# Required for all profiles
ENCRYPTION_SECRET_KEY=<base64-encoded-32-byte-AES-key>
CORS_ALLOWED_ORIGINS=http://localhost:5173
SERVER_PORT=8080
```

**c) Generate an AES-256 encryption key** (run once, save the output):

```bash
openssl rand -base64 32
```

> Store this key securely. Losing it means encrypted SSN data cannot be decrypted.

---

### 4. Configure the Frontend

```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env.local` (or `.env`):

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

### 5. Run the Backend

The `dev` profile activates H2 in-memory — no database connection required.

```bash
cd backend
export $(cat .env | xargs)

# Run with H2 (local dev)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run against Supabase (prod profile)
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

The API will be available at `http://localhost:8080`.

**H2 Console** (dev profile only): `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:nexabank`
- Username: `SA` · Password: *(blank)*

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
|---|---|---|
| `DATABASE_URL` | Prod only | `jdbc:postgresql://db.<ref>.supabase.co:5432/postgres` |
| `DATABASE_USERNAME` | Prod only | Supabase DB username (default: `postgres`) |
| `DATABASE_PASSWORD` | Prod only | Supabase DB password |
| `ENCRYPTION_SECRET_KEY` | Yes | Base64-encoded 32-byte AES key (`openssl rand -base64 32`) |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins, e.g. `http://localhost:5173` |
| `SERVER_PORT` | No | HTTP port (default: `8080`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No (dev) | Backend base URL. Required for production builds. |

---

## Running Tests

```bash
cd backend
mvn test
```

**29 tests, 0 failures** across five test classes:

| Test Class | Tests | Coverage |
|---|---|---|
| `CustomerServiceTest` | 7 | Application status logic, SSN encryption, email deduplication |
| `EncryptionServiceTest` | 6 | AES-256-GCM encrypt/decrypt, SSN masking |
| `UserRegistrationServiceTest` | 5 | Registration, duplicate username, MFA verify/reject |
| `UserLoginServiceTest` | 4 | Login success, wrong password, unknown user, enumeration safety |
| `AccountServiceTest` | 7 | Account creation, idempotency, seed balance, transactions |

---

## API Reference

### Customers

#### `POST /api/customers`
Submit a new credit card application. Returns an instant decision.

**Request body:**
```json
{
  "firstName": "Jane", "lastName": "Smith",
  "dateOfBirth": "1988-05-20",
  "email": "jane.smith@example.com", "phone": "+1-800-555-0199",
  "streetAddress": "456 Oak Ave", "city": "Austin",
  "state": "Texas", "zipCode": "73301", "country": "United States",
  "employmentStatus": "EMPLOYED", "employerName": "Acme Corp",
  "jobTitle": "Analyst", "yearsEmployed": 3, "annualSalary": 75000.00,
  "incomeSource": "EMPLOYMENT", "accountType": "Checking",
  "creditScoreRange": "740-799", "ssn": "123-45-6789"
}
```

**Response `201 Created`:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "firstName": "Jane", "lastName": "Smith",
  "email": "jane.smith@example.com",
  "ssnMasked": "***-**-6789",
  "applicationStatus": "APPROVED",
  "createdAt": "2026-02-24T10:00:00"
}
```

#### `GET /api/customers/{id}`
Retrieve a customer by UUID. SSN returned masked.

---

### Users

#### `POST /api/users/register`
Register a username and password for an approved customer.

**Request body:**
```json
{ "customerId": "<uuid>", "username": "jane_smith", "password": "SecurePass1" }
```

**Response `201 Created`:**
```json
{ "userId": "<uuid>", "username": "jane_smith", "customerId": "<uuid>" }
```

#### `POST /api/users/verify-mfa`
Verify the 4-digit MFA code. Code is `9999` in all environments (demo).
On first successful verification, the bank account and demo transactions are provisioned.

**Request body:**
```json
{ "userId": "<uuid>", "mfaCode": "9999" }
```

**Response `200 OK`:**
```json
{ "verified": true, "message": "Identity verified. Welcome to NexaBank!" }
```

#### `POST /api/users/login`
Authenticate with username and password.

**Request body:**
```json
{ "username": "jane_smith", "password": "SecurePass1" }
```

**Response `200 OK`:**
```json
{
  "userId": "<uuid>", "username": "jane_smith", "customerId": "<uuid>",
  "firstName": "Jane", "lastName": "Smith",
  "applicationStatus": "APPROVED", "mfaVerified": true
}
```

---

### Accounts

#### `GET /api/accounts/{customerId}`
Retrieve the bank account for a customer.

**Response `200 OK`:**
```json
{
  "accountId": "<uuid>", "customerId": "<uuid>",
  "accountNumber": "NX-4821-3097", "accountType": "Checking",
  "balance": 8393.41, "currency": "USD",
  "createdAt": "2026-02-24T10:00:00"
}
```

#### `GET /api/accounts/{customerId}/transactions`
Retrieve all transactions for a customer's account, newest first.

**Response `200 OK`:**
```json
[
  {
    "id": "<uuid>", "type": "DEBIT",
    "amount": 45.00, "description": "Shell Gas Station",
    "category": "Transportation", "transactedAt": "2026-02-23T10:00:00"
  }
]
```

---

### Error Responses

| Status | Scenario |
|---|---|
| `400` | Validation failure — `fieldErrors` map included in body |
| `401` | Invalid username or password |
| `404` | Customer or user ID not found |
| `409` | Email or username already registered |
| `500` | Unexpected server error |

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
ExecStart=/usr/bin/java -jar banking-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
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
sudo journalctl -u nexabank -f
```

> Set `CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com` in the server's `.env`.

---

### Frontend — Static Build via Nginx

**1. Build:**

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

    location / {
        try_files $uri $uri/ /index.html;
    }

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

> For HTTPS: `sudo certbot --nginx -d your-frontend-domain.com`

---

### Docker (Optional)

**Backend `Dockerfile`** (`backend/Dockerfile`):

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/banking-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
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

## Security Notes

- **SSN** — AES-256-GCM encrypted at rest with a random IV per record. Plaintext never logged or stored.
- **Passwords** — BCrypt-hashed via `spring-security-crypto`. Raw passwords are never stored or returned.
- **Login enumeration** — `POST /api/users/login` returns the same `"Invalid username or password"` message for both unknown username and wrong password, preventing user enumeration.
- **Encryption key** — must be kept secret and backed up. Rotation requires re-encrypting all records.
- **MFA code** — `9999` is a demo default. Replace `UserRegistrationService.MFA_CODE` with a proper OTP generator (e.g. TOTP/HOTP) before production use.
- **Environment variables** — never commit `.env` files. Use secrets managers (AWS Secrets Manager, HashiCorp Vault, etc.) in production.
- **HTTPS** — always terminate TLS in production (Certbot instructions above).
- **Supabase RLS** — consider enabling Row Level Security on all tables for additional database-layer access control.
