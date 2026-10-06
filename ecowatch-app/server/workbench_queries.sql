-- ============================================================================
-- ECOWATCH INTELLIGENCE PLATFORM — MYSQL WORKBENCH VERIFICATION SUITE
-- Investigator: Subhasree Pitchaiya (Reg No: 24104031)
-- Institution: National Engineering College (NEC), Tamil Nadu
-- Instructions: In MySQL Workbench, click 'Execute' (Lightning bolt icon or Ctrl+Shift+Enter)
-- ============================================================================

-- Step 1: Select the ecowatch database
USE ecowatch;

-- ============================================================================
-- Query 1: Quick Sanity Count Check across All Core Tables
-- ============================================================================
SELECT
    (SELECT COUNT(*) FROM users)          AS total_users,
    (SELECT COUNT(*) FROM alerts)         AS total_alerts,
    (SELECT COUNT(*) FROM reports)        AS total_reports,
    (SELECT COUNT(*) FROM telemetry_logs) AS total_telemetry;

/*
Expected Results:
  total_users     : 4
  total_alerts    : 7
  total_reports   : 8
  total_telemetry : 7
*/

-- ============================================================================
-- Query 2: List All Active Disaster Alerts with Location & Sensor Data
-- ============================================================================
SELECT
    id,
    type,
    severity,
    region,
    detected_by,
    status,
    latitude,
    longitude,
    affected
FROM alerts
ORDER BY id ASC;

-- ============================================================================
-- Query 3: List Community Environmental Reports Filed in Tamil Nadu
-- ============================================================================
SELECT
    id,
    title,
    category,
    location,
    reporter,
    status,
    votes,
    satellite_match
FROM reports
ORDER BY votes DESC;

-- ============================================================================
-- Query 4: Review Multi-Spectral Satellite Telemetry Logs
-- ============================================================================
SELECT
    id,
    satellite_id,
    sensor_name,
    latitude,
    longitude,
    aqi,
    temperature,
    humidity,
    wind_speed,
    recorded_at
FROM telemetry_logs
ORDER BY id DESC;

-- ============================================================================
-- Query 5: Verify System Admin & Investigator Profile (Subhasree Pitchaiya)
-- ============================================================================
SELECT
    id,
    name,
    email,
    role,
    job_title,
    organization,
    location,
    created_at
FROM users
WHERE email = '24104031@nec.edu.in';
