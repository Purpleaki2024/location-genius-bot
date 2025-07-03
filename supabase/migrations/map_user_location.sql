-- Supabase schema for User and Location tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    username VARCHAR(64) NOT NULL DEFAULT '',
    first_name VARCHAR(64) NOT NULL DEFAULT '',
    last_name VARCHAR(64) NOT NULL DEFAULT '',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    password_hash VARCHAR(255),
    totp_secret VARCHAR(32)
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    latitude VARCHAR(32) NOT NULL,
    longitude VARCHAR(32) NOT NULL,
    address TEXT,
    query TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
