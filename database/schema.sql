-- NexaBank Customer Data Schema
-- Execute this in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Personal Details
    first_name       VARCHAR(100)    NOT NULL,
    last_name        VARCHAR(100)    NOT NULL,
    date_of_birth    DATE            NOT NULL,
    email            VARCHAR(255)    NOT NULL UNIQUE,
    phone            VARCHAR(20)     NOT NULL,

    -- Address
    street_address   VARCHAR(255)    NOT NULL,
    city             VARCHAR(100)    NOT NULL,
    state            VARCHAR(100)    NOT NULL,
    zip_code         VARCHAR(20)     NOT NULL,
    country          VARCHAR(100)    NOT NULL DEFAULT 'United States',

    -- Employment
    employment_status VARCHAR(50)    NOT NULL,
    employer_name    VARCHAR(255),
    job_title        VARCHAR(100),
    years_employed   INTEGER         CHECK (years_employed >= 0),
    annual_salary    DECIMAL(15, 2)  CHECK (annual_salary >= 0),

    -- Financial Information
    income_source    VARCHAR(100),
    account_type     VARCHAR(50),
    credit_score_range VARCHAR(50),

    -- SSN — stored as AES-256-GCM ciphertext (base64 encoded: IV || ciphertext)
    ssn_encrypted    TEXT            NOT NULL,

    -- Application decision (APPROVED | PENDING | DECLINED)
    application_status VARCHAR(20)   NOT NULL DEFAULT 'PENDING',

    -- Metadata
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Fast email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ── App Users (post-approval account registration) ──────
CREATE TABLE IF NOT EXISTS app_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    customer_id     UUID         NOT NULL REFERENCES customers(id),
    mfa_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_customer_id ON app_users(customer_id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
