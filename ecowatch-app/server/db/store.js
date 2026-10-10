import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_STORE_PATH = path.resolve(__dirname, "../data/store.json");
const STORE_PATH = isServerless ? path.resolve("/tmp", "ecowatch-store.json") : BUNDLED_STORE_PATH;

function getDefaultStore() {
  return {
    users: [
      {
        id: 2,
        name: "Subhasree Pitchaiya",
        email: "24104031@nec.edu.in",
        password_hash: "$2a$10$BUlup0a7f9irqZrEUJM6beUM/vFqQYwkYsSj2W7YuxeHwCJl8fTMe", // admin@123
        mobile: "+91 98401 23456",
        jobTitle: "Lead Environmental Analyst & System Admin",
        role: "System Admin",
        organization: "EcoWatch Global / NEC",
        location: "Chennai, Tamil Nadu",
        status: "Active",
        createdAt: "2024-02-15T09:30:00.000Z",
        googleId: "105833716637493268484",
        picture: "https://lh3.googleusercontent.com/a/ACg8ocJGzUvz2gkleN1V2oOlgeCfmibdePkWtu1ucppH2x-sCgwTXA=s96-c",
      },
    ],
    alerts: [
      {
        id: 1001,
        type: "Flash Flood Warning",
        severity: "CRITICAL",
        region: "Riverside Corridor & Marina Basin",
        detectedBy: "Sentinel-1 SAR Radar",
        description: "Copernicus Sentinel-1 SAR synthetic aperture radar detects rapid low-lying inundation exceeding 40cm.",
        status: "Active",
        latitude: 13.0827,
        longitude: 80.2707,
        timestamp: new Date().toISOString(),
      },
      {
        id: 1002,
        type: "Wildfire Escalation",
        severity: "HIGH",
        region: "Western Forest Reserve",
        detectedBy: "Landsat-9 Thermal Band",
        description: "Surface thermal anomaly detected in forest canopy. Thermal index exceeds seasonal baseline by 7.4C.",
        status: "Active",
        latitude: 11.4102,
        longitude: 76.6950,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 1003,
        type: "High Wind Advisory",
        severity: "ADVISORY",
        region: "Coastal Harbor Area",
        detectedBy: "GOES-16 Geostationary",
        description: "Sustained high wind gusts exceeding 48 km/h recorded along shoreline sensor stations.",
        status: "Active",
        latitude: 13.0475,
        longitude: 80.2824,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    communityReports: [
      {
        id: 101,
        title: "Severe Stormwater Inundation - Main Corridor",
        category: "Flooding",
        location: "KTC Nagar, Tirunelveli",
        reporter: "Praveen M.",
        description: "Water level crossed 1.2 feet along arterial roadway. Storm drain partially clogged with debris.",
        satelliteMatch: "Sentinel-1 SAR surface water radar backscatter verified (NDWI > 0.38)",
        status: "Urgent",
        votes: 42,
        latitude: 8.7522,
        longitude: 77.7414,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 102,
        title: "Coastal Water Discoloration & Algal Bloom",
        category: "Water Quality",
        location: "Marina Beach Coastal Zone",
        reporter: "Alex S.",
        description: "Noticeable algal bloom and chlorophyll spike observed along shoreline near lighthouse.",
        satelliteMatch: "Sentinel-2 Chlorophyll-a anomalous spectral spike (+0.42)",
        status: "Resolved",
        votes: 14,
        latitude: 13.0475,
        longitude: 80.2824,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 103,
        title: "Municipal Water Main Pipeline Breach",
        category: "Leakage",
        location: "Palayamkottai, Tirunelveli",
        reporter: "Karthik R.",
        description: "High-pressure clean water supply pipeline ruptured near market junction causing street wash-out.",
        satelliteMatch: "Sentinel-2 MSI localized hydrological surface reflectance shift detected",
        status: "Investigating",
        votes: 19,
        latitude: 8.7180,
        longitude: 77.7340,
        timestamp: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: 104,
        title: "Industrial Particulate Emissions Spike",
        category: "Air Pollution",
        location: "SIPCOT Industrial Sector, Tirunelveli",
        reporter: "Dr. Ananya Sharma",
        description: "Dense particulate plume observed during afternoon factory shift. Strong chemical odor noted.",
        satelliteMatch: "Sentinel-5P TROPOMI Tropospheric NO2 column spike (14.2 µmol/m²)",
        status: "Urgent",
        votes: 38,
        latitude: 8.7400,
        longitude: 77.7500,
        timestamp: new Date(Date.now() - 14400000).toISOString(),
      },
    ],
    settings: {
      organization: "EcoWatch Global",
      industry: "Environmental Intelligence",
      retentionPeriod: "3 Years",
      autoArchive: true,
      enforce2FA: true,
      apiKeys: [
        {
          id: 1,
          name: "Production Main",
          key: "gi_prod_••••••••••••x8u3",
          created: "Oct 12, 2024",
          icon: "rocket_launch",
          iconBg: "bg-secondary-container text-on-secondary-container",
        },
      ],
      webhooks: [
        {
          id: 1,
          name: "Slack Incident Dispatch",
          url: "https://hooks.slack.com/services/T00/B00/XXXXX",
          events: ["alert.critical", "report.verified"],
          status: "Active",
        },
      ],
    },
    telemetryLogs: [
      {
        id: 1,
        satelliteId: "Sentinel-2",
        sensorName: "MSI Multispectral",
        latitude: 13.0827,
        longitude: 80.2707,
        aqi: 42,
        temperature: 31.2,
        humidity: 68,
        windSpeed: 14.0,
        recordedAt: new Date().toISOString(),
      },
    ],
  };
}

export function loadStore() {
  try {
    const candidatePath = fs.existsSync(STORE_PATH) ? STORE_PATH : (fs.existsSync(BUNDLED_STORE_PATH) ? BUNDLED_STORE_PATH : null);
    if (candidatePath && fs.existsSync(candidatePath)) {
      const data = fs.readFileSync(candidatePath, "utf8");
      const parsed = JSON.parse(data);
      // Ensure all arrays exist
      if (!parsed.users) parsed.users = [];
      if (!parsed.alerts) parsed.alerts = [];
      if (!parsed.communityReports) parsed.communityReports = [];
      if (!parsed.telemetryLogs) parsed.telemetryLogs = [];
      if (!parsed.settings) parsed.settings = getDefaultStore().settings;

      // Filter out removed evaluator accounts from parsed.users if present
      const removedEmails = new Set([
        "admin@ecowatch.global",
        "analyst@ecowatch.global",
        "responder@ecowatch.global",
        "scientist@ecowatch.global",
        "inspector@ecowatch.global",
        "test@ecowatch.global",
        "ms.test@ecowatch.global",
        "google.user@ecowatch.global",
        "ms.user@ecowatch.global",
      ]);
      parsed.users = parsed.users.filter(
        (u) => !removedEmails.has(u.email?.toLowerCase()) && !u.email?.startsWith("analyst_")
      );

      // Ensure active alerts and community reports are populated if empty
      if (!parsed.alerts || parsed.alerts.length === 0) {
        parsed.alerts = getDefaultStore().alerts;
      }
      if (!parsed.communityReports || parsed.communityReports.length === 0) {
        parsed.communityReports = getDefaultStore().communityReports;
      }

      // Ensure all verified core users are present and have up-to-date password hashes
      const defaultUsers = getDefaultStore().users;
      defaultUsers.forEach((defUser) => {
        const existingIdx = parsed.users.findIndex((u) => u.email.toLowerCase() === defUser.email.toLowerCase());
        if (existingIdx === -1) {
          parsed.users.push(defUser);
        } else {
          parsed.users[existingIdx] = { ...defUser, ...parsed.users[existingIdx], password_hash: defUser.password_hash };
        }
      });
      return parsed;
    }
  } catch (err) {
    console.warn("Could not load store.json, creating initial store:", err.message);
  }
  const defaultData = getDefaultStore();
  saveStore(defaultData);
  return defaultData;
}

export const memoryStore = loadStore();

export function saveStore(storeData = memoryStore) {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeData, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to persist data to store.json:", err.message);
  }
}

export default {
  memoryStore,
  loadStore,
  saveStore,
};
