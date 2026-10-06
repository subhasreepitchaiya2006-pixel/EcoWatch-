-- ====================================================
-- EcoWatch Intelligence Platform — MySQL Relational Database Schema
-- Version: 3.0.0
-- Database: ecowatch
-- ====================================================

CREATE DATABASE IF NOT EXISTS ecowatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecowatch;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  mobile VARCHAR(40) NULL DEFAULT '',
  job_title VARCHAR(120) NULL DEFAULT 'Environmental Analyst',
  role VARCHAR(50) NOT NULL DEFAULT 'Analyst',
  organization VARCHAR(180) NOT NULL DEFAULT 'EcoWatch Global',
  location VARCHAR(180) NOT NULL DEFAULT '',
  google_id VARCHAR(255) NULL UNIQUE,
  microsoft_id VARCHAR(255) NULL UNIQUE,
  picture TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Disaster Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(30) NOT NULL DEFAULT 'WARNING',
  region VARCHAR(180) NOT NULL,
  detected_by VARCHAR(120) NOT NULL DEFAULT 'Sentinel-2 Orbit #882',
  description TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_alerts_status (status),
  INDEX idx_alerts_severity (severity),
  INDEX idx_alerts_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Community Environmental Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Other',
  location VARCHAR(180) NOT NULL,
  reporter VARCHAR(120) NOT NULL DEFAULT 'Anonymous Citizen',
  description TEXT NOT NULL,
  satellite_match VARCHAR(255) DEFAULT 'Cross-referenced with Orbit Telemetry',
  image TEXT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Investigating',
  votes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reports_category (category),
  INDEX idx_reports_status (status),
  CONSTRAINT reports_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. System Settings & API Integrations Table
CREATE TABLE IF NOT EXISTS settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organization VARCHAR(180) NOT NULL DEFAULT 'EcoWatch Global',
  industry VARCHAR(180) NOT NULL DEFAULT 'Environmental Intelligence',
  retention_period VARCHAR(50) NOT NULL DEFAULT '3 Years',
  auto_archive TINYINT(1) NOT NULL DEFAULT 1,
  enforce_2fa TINYINT(1) NOT NULL DEFAULT 1,
  api_keys JSON NULL,
  webhooks JSON NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Satellite Telemetry Logs Table
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  satellite_id VARCHAR(80) NOT NULL,
  sensor_name VARCHAR(120) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  aqi INT NOT NULL,
  temperature DECIMAL(5,2) NOT NULL,
  humidity INT NOT NULL,
  wind_speed DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_telemetry_satellite (satellite_id),
  INDEX idx_telemetry_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Initial Real-Time Database Setup
-- ====================================================

-- Real-Time System User Account
INSERT INTO users (id, name, email, password_hash, role, organization, location)
VALUES
(2, 'Subhasree Pitchaiya', '24104031@nec.edu.in', '$2a$10$BUlup0a7f9irqZrEUJM6beUM/vFqQYwkYsSj2W7YuxeHwCJl8fTMe', 'Lead Environmental Analyst', 'EcoWatch Global', 'Chennai, Tamil Nadu')
ON DUPLICATE KEY UPDATE name=VALUES(name);


-- Insert Default Settings
INSERT INTO settings (id, organization, industry, retention_period, auto_archive, enforce_2fa, api_keys, webhooks)
VALUES
(1, 'EcoWatch Global', 'Environmental Intelligence', '3 Years', 1, 1,
 '[{"id": 1, "name": "Production Main", "key": "gi_prod_••••••••••••x8u3", "created": "Oct 12, 2024", "icon": "rocket_launch", "iconBg": "bg-secondary-container text-on-secondary-container"}]',
 '[{"id": 1, "name": "Slack Incident Dispatch", "url": "https://hooks.slack.com/services/T00/B00/XXXXX", "events": ["alert.critical", "report.verified"], "status": "Active"}]'
)
ON DUPLICATE KEY UPDATE organization=VALUES(organization);
