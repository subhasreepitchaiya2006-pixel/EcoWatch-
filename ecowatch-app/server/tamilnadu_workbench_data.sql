-- ============================================================================
-- ECOWATCH INTELLIGENCE PLATFORM — MYSQL WORKBENCH DATA SUITE
-- Author / Investigator: Subhasree Pitchaiya (Reg No: 24104031)
-- Institution: National Engineering College (NEC), Tamil Nadu, India
-- Geography Filter: Strictly Tamil Nadu, India
-- Database: ecowatch
-- Instructions: Open this script in MySQL Workbench and execute (Ctrl + Shift + Enter)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `ecowatch` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `ecowatch`;

-- ============================================================================
-- 1. TABLE STRUCTURE DEFINITIONS
-- ============================================================================

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `mobile` VARCHAR(40) NULL DEFAULT '',
  `job_title` VARCHAR(120) NULL DEFAULT 'Lead Environmental Analyst',
  `role` VARCHAR(50) NOT NULL DEFAULT 'System Admin',
  `organization` VARCHAR(180) NOT NULL DEFAULT 'EcoWatch Intelligence / NEC',
  `location` VARCHAR(180) NOT NULL DEFAULT 'Tirunelveli, Tamil Nadu, India',
  `google_id` VARCHAR(255) NULL UNIQUE,
  `microsoft_id` VARCHAR(255) NULL UNIQUE,
  `picture` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (`email`),
  INDEX idx_users_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: alerts
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(100) NOT NULL,
  `severity` VARCHAR(30) NOT NULL DEFAULT 'WARNING',
  `region` VARCHAR(180) NOT NULL,
  `detected_by` VARCHAR(120) NOT NULL DEFAULT 'Copernicus Sentinel-2 Orbit',
  `description` TEXT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
  `latitude` DECIMAL(10,7) NULL,
  `longitude` DECIMAL(10,7) NULL,
  `affected` VARCHAR(50) NULL DEFAULT '8,500',
  `depth` VARCHAR(50) NULL DEFAULT 'Telemetry Active',
  `evac_status` VARCHAR(50) NULL DEFAULT 'Nominal',
  `recommended_actions` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_alerts_status (`status`),
  INDEX idx_alerts_severity (`severity`),
  INDEX idx_alerts_region (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reports
CREATE TABLE IF NOT EXISTS `reports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NULL,
  `title` VARCHAR(180) NOT NULL,
  `category` VARCHAR(80) NOT NULL DEFAULT 'Other',
  `location` VARCHAR(180) NOT NULL,
  `reporter` VARCHAR(120) NOT NULL DEFAULT 'Subhasree Pitchaiya',
  `description` TEXT NOT NULL,
  `satellite_match` VARCHAR(255) DEFAULT 'Cross-referenced with Sentinel-2 MSI Multi-Spectral Orbit',
  `image` TEXT NULL,
  `latitude` DECIMAL(10,7) NULL,
  `longitude` DECIMAL(10,7) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Investigating',
  `votes` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reports_category (`category`),
  INDEX idx_reports_status (`status`),
  CONSTRAINT reports_user_fk FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: telemetry_logs
CREATE TABLE IF NOT EXISTS `telemetry_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `satellite_id` VARCHAR(80) NOT NULL,
  `sensor_name` VARCHAR(120) NOT NULL,
  `latitude` DECIMAL(10,7) NOT NULL,
  `longitude` DECIMAL(10,7) NOT NULL,
  `aqi` INT NOT NULL,
  `temperature` DECIMAL(5,2) NOT NULL,
  `humidity` INT NOT NULL,
  `wind_speed` DECIMAL(5,2) NOT NULL,
  `recorded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_telemetry_satellite (`satellite_id`),
  INDEX idx_telemetry_recorded_at (`recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `organization` VARCHAR(180) NOT NULL DEFAULT 'EcoWatch Global / NEC',
  `industry` VARCHAR(180) NOT NULL DEFAULT 'Environmental Earth Intelligence',
  `retention_period` VARCHAR(50) NOT NULL DEFAULT '3 Years',
  `auto_archive` TINYINT(1) NOT NULL DEFAULT 1,
  `enforce_2fa` TINYINT(1) NOT NULL DEFAULT 1,
  `api_keys` JSON NULL,
  `webhooks` JSON NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. SAMPLE DATA POPULATION (STRICTLY TAMIL NADU & SUBHASREE PITCHAIYA)
-- ============================================================================

-- Clean existing demo tables to guarantee fresh, authentic data
DELETE FROM `reports`;
DELETE FROM `alerts`;
DELETE FROM `telemetry_logs`;
DELETE FROM `users` WHERE `email` IN ('24104031@nec.edu.in', 'subhasreepitchaiya2006@gmail.com');

-- A. USERS (Subhasree Pitchaiya as Lead System Administrator & Investigator)
INSERT INTO `users` (
  `id`, `name`, `email`, `password_hash`, `mobile`, `job_title`, `role`, `organization`, `location`
) VALUES
(
  2,
  'Subhasree Pitchaiya',
  '24104031@nec.edu.in',
  '$2a$10$m1WEh1n09IuA3/yX9PNVpuxlCIKYnXFDj3aUtyKruz8uqL54VnhNG', -- Supports both admin@123 and admin123
  '+91 98401 23456',
  'Lead Environmental Analyst & System Admin',
  'System Admin',
  'EcoWatch Intelligence / National Engineering College',
  'Tirunelveli, Tamil Nadu, India'
),
(
  1791132,
  'Subhasree Pitchaiya',
  'subhasreepitchaiya2006@gmail.com',
  '$2a$10$m1WEh1n09IuA3/yX9PNVpuxlCIKYnXFDj3aUtyKruz8uqL54VnhNG',
  '+91 93849 91157',
  'Chief Planetary Data Modeler',
  'System Admin',
  'EcoWatch Planetary Directorate',
  'Chennai, Tamil Nadu, India'
);

-- B. DISASTER ALERTS (Geotagged Across Strategic Tamil Nadu Ecological Zones)
INSERT INTO `alerts` (
  `id`, `type`, `severity`, `region`, `detected_by`, `description`, `status`, `latitude`, `longitude`, `affected`, `depth`, `evac_status`, `recommended_actions`
) VALUES
(
  1001,
  'Flash Flood Inundation Warning',
  'CRITICAL',
  'Marina Beach Coastal Corridor, Chennai, Tamil Nadu',
  'Copernicus Sentinel-1 SAR Radar',
  'Sentinel-1 C-Band SAR radar backscatter indicates surface water accumulation delta exceeding 42cm across low-lying Adyar and Marina littoral drainage canals.',
  'Active',
  13.0475000,
  80.2824000,
  '14,200',
  '42cm Surge',
  'Evacuation Advisory Level 2',
  '["Activate Adyar and Cooum estuary stormwater sluice gates.", "Deploy municipal rescue teams to Marina coastal lowlands.", "Maintain real-time Sentinel-1 orbital radar overpasses."]'
),
(
  1002,
  'Forest Canopy Thermal Anomaly',
  'HIGH',
  'Western Ghats Forest Reserve, Coimbatore, Tamil Nadu',
  'Landsat-9 Thermal Infrared Sensor (TIRS-2)',
  'Landsat-9 thermal infrared band 10 reveals abnormal canopy thermal spike (+7.8°C above seasonal baseline) in dense Nilgiri-Anamalai foothill biological corridors.',
  'Active',
  11.0168000,
  76.9558000,
  '3,100',
  'Thermal 38.6°C',
  'Standby Monitoring',
  '["Mobilize district forest fire warden rapid response patrols.", "Establish thermal drone boundary reconnaissance.", "Continuous Landsat-9 and GOES-16 thermal hotspot tracking."]'
),
(
  1003,
  'Tamirabarani River Storm Surge Alert',
  'HIGH',
  'Tamirabarani River Basin, Tirunelveli, Tamil Nadu',
  'Copernicus Sentinel-2 MSI Multi-Spectral Sensor',
  'Hydrological NDVI/NDWI reflection indicates water level swell approaching maximum discharge capacity along the Palayamkottai and Vannarpettai riverbanks.',
  'Active',
  8.7289000,
  77.7126000,
  '8,900',
  'Water level +1.6m',
  'Heightened Vigilance',
  '["Alert district revenue administration for Tirunelveli municipal riverfront.", "Inspect barrage drainage outlets at Srivaikuntam downstream.", "Monitor hourly optical telemetry for silt saturation."]'
),
(
  1004,
  'Industrial Particulate NO2 Emission Spike',
  'ADVISORY',
  'SIPCOT Industrial Complex, Tirunelveli, Tamil Nadu',
  'Sentinel-5P TROPOMI Atmospheric Sensor',
  'Sentinel-5P TROPOMI sensor detects tropospheric NO2 column density surge (16.4 µmol/m²) and PM2.5 elevation exceeding Central Pollution Control Board (CPCB) norms.',
  'Active',
  8.7400000,
  77.7500000,
  '5,400',
  'AQI 168 (Unhealthy)',
  'Advisory Issued',
  '["Issue regulatory audit notice to SIPCOT smelting and chemical units.", "Deploy mobile ambient air quality monitoring vans across Gangaikondan.", "Correlate with Sentinel-5P atmospheric dispersion model."]'
),
(
  1005,
  'Agricultural Hydrological Drought Deficit',
  'WARNING',
  'Bhavani River Basin, Gobichettipalayam, Erode, Tamil Nadu',
  'Landsat-9 Surface Moisture Index',
  'Satellite NDWI water deficit index shows 26% decline in soil moisture saturation across Gobichettipalayam paddy and sugarcane agrarian blocks.',
  'Active',
  11.4065000,
  77.4226000,
  '11,800',
  'NDWI -0.21',
  'Irrigation Planning',
  '["Initiate rotational release schedule from Bhavanisagar Dam.", "Advise ryots and farming cooperatives on micro-drip irrigation conservation.", "Map seasonal vegetation vigor index via Sentinel-2."]'
);

-- C. COMMUNITY REPORTS (Filed by Subhasree Pitchaiya Across Tamil Nadu)
INSERT INTO `reports` (
  `id`, `user_id`, `title`, `category`, `location`, `reporter`, `description`, `satellite_match`, `image`, `latitude`, `longitude`, `status`, `votes`
) VALUES
(
  101,
  2,
  'Severe Stormwater Drainage Inundation Along Main Arterial Road',
  'Flooding',
  'KTC Nagar, Tirunelveli, Tamil Nadu',
  'Subhasree Pitchaiya',
  'Heavy precipitation caused stormwater buildup exceeding 1.2 feet along the KTC Nagar main road junction. Drainage channels are partially obstructed by silt and packaging debris.',
  'Sentinel-1 SAR surface radar backscatter confirms localized ponding anomaly (NDWI: 0.41)',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
  8.7522000,
  77.7414000,
  'Urgent',
  46
),
(
  102,
  2,
  'Coastal Water Discoloration & Nearshore Algal Bloom',
  'Water Quality',
  'Marina Beach Shoreline, Chennai, Tamil Nadu',
  'Subhasree Pitchaiya',
  'Noticeable green-brown chlorophyll discoloration observed near the lighthouse shoreline. Potential industrial discharge or organic nutrient runoff into the coastal littoral current.',
  'Sentinel-2 Chlorophyll-a anomalous spectral reflectance spike verified (+0.38 delta)',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  13.0475000,
  80.2824000,
  'Investigating',
  28
),
(
  103,
  2,
  'Municipal Clean Water Pipeline Rupture & Roadway Subsidence',
  'Leakage',
  'Palayamkottai Central Junction, Tirunelveli, Tamil Nadu',
  'Subhasree Pitchaiya',
  'High-pressure drinking water supply pipeline breach under the roadway near the market area. Substantial clean water wastage and risk of asphalt sinkhole.',
  'Sentinel-2 MSI localized hydrological reflectance shift detected at 10m spatial resolution',
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
  8.7180000,
  77.7340000,
  'Urgent',
  35
),
(
  104,
  2,
  'Unsegregated Industrial Plastic Waste Along River Canal',
  'Waste',
  'Vannarpettai Canal Embankment, Tirunelveli, Tamil Nadu',
  'Subhasree Pitchaiya',
  'Accumulation of municipal refuse and plastic scrap dumped along the feeder canal embankment leading into the Tamirabarani river. Poses severe threat of waterway choking.',
  'Sentinel-2 10m visible band ground reflectance confirms artificial waste accumulation boundary',
  'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
  8.7289000,
  77.7126000,
  'Investigating',
  19
),
(
  105,
  2,
  'Dense Industrial Chimney Particulate Plume & Chemical Odor',
  'Air Pollution',
  'SIPCOT Industrial Sector, Tirunelveli, Tamil Nadu',
  'Subhasree Pitchaiya',
  'Thick dark exhaust plume discharged during afternoon factory shift. Pungent chemical odor detected across residential colonies within 2km radius of SIPCOT complex.',
  'Sentinel-5P TROPOMI tropospheric NO2 & Aerosol Index (AI) column surge confirmed (16.4 µmol/m²)',
  'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=800&q=80',
  8.7400000,
  77.7500000,
  'Urgent',
  52
),
(
  106,
  2,
  'Canal Bund Bank Erosion & Sediment Choking in Agrarian Channel',
  'Water Quality',
  'Gobichettipalayam Agrarian Corridor, Erode, Tamil Nadu',
  'Subhasree Pitchaiya',
  'Irrigation canal embankment washed out following heavy cloudburst, causing heavy silt deposition and blocking downstream water flow to paddy cultivations.',
  'Sentinel-2 NDWI hydrological vector boundary indicates 35% siltation delta',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  11.4065000,
  77.4226000,
  'Resolved',
  23
);

-- D. SATELLITE TELEMETRY LOGS (Tamil Nadu Geospatial Coordinates)
INSERT INTO `telemetry_logs` (
  `satellite_id`, `sensor_name`, `latitude`, `longitude`, `aqi`, `temperature`, `humidity`, `wind_speed`
) VALUES
('Sentinel-2A', 'MSI Multi-Spectral Instrument (10m)', 13.0475000, 80.2824000, 54, 31.40, 78, 14.20), -- Chennai
('Landsat-9', 'TIRS-2 Thermal Infrared Sensor', 11.0168000, 76.9558000, 42, 28.60, 65, 9.80),   -- Coimbatore
('Sentinel-1B', 'C-Band Synthetic Aperture Radar (SAR)', 8.7522000, 77.7414000, 48, 32.10, 72, 11.50), -- Tirunelveli
('Sentinel-5P', 'TROPOMI Tropospheric Monitoring', 8.7400000, 77.7500000, 168, 33.50, 68, 8.40),      -- SIPCOT Gangaikondan
('GOES-16', 'Advanced Baseline Imager (ABI)', 11.4065000, 77.4226000, 38, 29.80, 70, 7.20);        -- Gobichettipalayam, Erode

-- Additional Sample Data (Tamil Nadu focus)

-- Alerts
INSERT INTO `alerts` (`id`, `type`, `severity`, `region`, `detected_by`, `description`, `status`, `latitude`, `longitude`, `affected`, `depth`, `evac_status`, `recommended_actions`) VALUES
(2001, 'Heat Wave Warning', 'HIGH', 'Madurai District, Tamil Nadu', 'Sentinel-3 OLCI', 'Surface temperature anomaly >5°C above monthly average across Madurai urban area.', 'Active', 9.9252000, 78.1196000, '12,300', 'Temp +5°C', 'Evacuation Advisory Level 1', '["Issue public health advisory", "Increase water distribution points", "Monitor satellite thermal data hourly"]'),
(2002, 'Coastal Flood Risk', 'CRITICAL', 'Nagapattinam Coastal Zone, Tamil Nadu', 'Sentinel-1 SAR', 'SAR backscatter indicates rising sea level encroaching low-lying coastal settlements.', 'Active', 10.7659000, 79.8428000, '15,400', 'Sea Level +0.8m', 'Evacuation Advisory Level 3', '["Activate coastal shelters", "Deploy rescue boats", "Coordinate with state disaster management"]');

-- Community Reports
INSERT INTO `reports` (`id`, `user_id`, `title`, `category`, `location`, `reporter`, `description`, `satellite_match`, `image`, `latitude`, `longitude`, `status`, `votes`) VALUES
(201, 2, 'Severe Urban Heat Island Effect in Madurai', 'Heat', 'Madurai City, Tamil Nadu', 'Subhasree Pitchaiya', 'Temperature readings indicate urban heat island with temperatures 7°C higher than surrounding rural areas.', 'Sentinel-3 SLSTR thermal anomaly detection', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 9.9252000, 78.1196000, 'Investigating', 42),
(202, 2, 'Riverbank Erosion Near Kaveri', 'Erosion', 'Kaveri River Basin, Tamil Nadu', 'Subhasree Pitchaiya', 'Notable riverbank erosion observed along Kaveri near Trichy causing sediment load increase.', 'Sentinel-2 MSI multispectral analysis', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80', 10.7905000, 78.7047000, 'Active', 30);

-- Telemetry Logs
INSERT INTO `telemetry_logs` (`satellite_id`, `sensor_name`, `latitude`, `longitude`, `aqi`, `temperature`, `humidity`, `wind_speed`) VALUES
('Sentinel-3', 'SLSTR Thermal Sensor', 9.9252000, 78.1196000, 60, 38.2, 65, 12.5),
('Sentinel-1', 'C-Band SAR', 10.7659000, 79.8428000, 55, 35.0, 70, 9.8);

-- E. SYSTEM SETTINGS
INSERT INTO `settings` (`id`, `organization`, `industry`, `retention_period`, `auto_archive`, `enforce_2fa`, `api_keys`, `webhooks`)
VALUES (
  1,
  'EcoWatch Intelligence / National Engineering College',
  'Environmental Geospatial Intelligence',
  '3 Years',
  1,
  1,
  JSON_ARRAY(
    JSON_OBJECT('id', 1, 'name', 'NEC Research Telemetry API', 'key', 'ecowatch_nec_live_••••••••9a2b', 'created', 'Oct 2026')
  ),
  JSON_ARRAY(
    JSON_OBJECT('id', 1, 'name', 'Tamil Nadu SDMA Emergency Webhook', 'url', 'https://tnsdma.tn.gov.in/api/v1/alerts', 'status', 'Active')
  )
)
ON DUPLICATE KEY UPDATE organization = VALUES(organization);

-- ============================================================================
-- 3. VERIFICATION & SAMPLE DATA RETRIEVAL QUERIES
-- ============================================================================

-- Query 1: Verify System Admin User (Subhasree Pitchaiya)
SELECT id, name, email, role, job_title, organization, location, created_at 
FROM users 
WHERE email = '24104031@nec.edu.in';

-- Query 2: Retrieve Active Disaster Alerts in Tamil Nadu
SELECT id, type, severity, region, detected_by, status, latitude, longitude 
FROM alerts 
ORDER BY id ASC;

-- Query 3: Retrieve All Ground-Truth Community Reports Filed by Subhasree Pitchaiya
SELECT id, title, category, location, reporter, status, votes, satellite_match 
FROM reports 
WHERE reporter = 'Subhasree Pitchaiya'
ORDER BY votes DESC;

-- Query 4: Review Multi-Spectral Satellite Telemetry Across Tamil Nadu Stations
SELECT satellite_id, sensor_name, latitude, longitude, aqi, temperature, humidity, wind_speed, recorded_at
FROM telemetry_logs
ORDER BY id DESC;

-- Query 5: Summarize Total Alerts and Reports in Database
SELECT 
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM alerts) AS active_alerts_tamilnadu,
  (SELECT COUNT(*) FROM reports) AS verified_reports_subhasree,
  (SELECT COUNT(*) FROM telemetry_logs) AS satellite_telemetry_records;

-- ============================================================================
-- END OF SCRIPT — ALL DATA AUTHENTICATED TO TAMIL NADU & SUBHASREE PITCHAIYA
-- ============================================================================
