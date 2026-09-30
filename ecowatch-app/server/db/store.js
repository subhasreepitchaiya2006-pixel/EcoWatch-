import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, "../data/store.json");

function getDefaultStore() {
  return {
    users: [
      {
        id: 1,
        name: "Demo Admin",
        email: "admin@ecowatch.global",
        password_hash: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6e45p.jGgP22wY9C", // admin123
        mobile: "+91 98765 43210",
        jobTitle: "System Administrator",
        role: "System Admin",
        organization: "EcoWatch Global",
        location: "Chennai, Tamil Nadu",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Subhasree Pitchaiya",
        email: "24104031@nec.edu.in",
        password_hash: "$2a$12$A96CKx4mGvcweuSWg8Xr6.pbl2/LCEtbYDjdhTz8kj9PhD3r/V99y",
        mobile: "24104031@nec.edu.in",
        jobTitle: "Lead Environmental Analyst",
        role: "System Admin",
        organization: "EcoWatch Global",
        location: "Chennai, Tamil Nadu",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Dev Analyst",
        email: "analyst@ecowatch.global",
        password_hash: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6e45p.jGgP22wY9C",
        mobile: "+91 94444 12345",
        jobTitle: "Orbital Telemetry Specialist",
        role: "Analyst",
        organization: "EcoWatch Global",
        location: "Chennai, Tamil Nadu",
        createdAt: new Date().toISOString(),
      },
    ],
    alerts: [
      {
        id: 1,
        type: "Flood Alert",
        severity: "HIGH",
        region: "Chennai Coast",
        detectedBy: "Sentinel-2 Orbit #882",
        description: "High water levels detected in coastal low-lying areas. Sentinel-2 indicates risk of street flooding along Marina Beach corridor.",
        status: "Active",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: "Wildfire Hazard",
        severity: "CRITICAL",
        region: "Western Ghats",
        detectedBy: "Landsat-9 Thermal",
        description: "Thermal anomaly detected in forest canopy. Thermal infrared band indicates elevated surface temperature exceeding threshold by 8.4°C.",
        status: "Active",
        timestamp: new Date().toISOString(),
      },
      {
        id: 3,
        type: "High Wind Advisory",
        severity: "ADVISORY",
        region: "Coastal Harbor Area",
        detectedBy: "GOES-16 Geostationary",
        description: "Sustained high wind gusts exceeding 48 km/h recorded along shoreline and Ennore harbor perimeter.",
        status: "Active",
        timestamp: new Date().toISOString(),
      },
    ],
    communityReports: [
      {
        id: 101,
        title: "Coastal Water Discoloration",
        category: "Water Quality",
        location: "Marina Beach, Chennai",
        reporter: "Alex S.",
        description: "Noticeable algal bloom and chlorophyll spike observed along the shoreline near the lighthouse.",
        satelliteMatch: "Sentinel-2 Chlorophyll Spike",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
        latitude: 13.0475,
        longitude: 80.2824,
        status: "Verified",
        votes: 14,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 102,
        title: "Severe Flooding - Perungudi",
        category: "Flooding",
        location: "Velachery Zone 13",
        reporter: "Rajesh K.",
        description: "Water level crossed 1 foot on 4th Main Road. Drainage impeded by industrial plastic debris.",
        satelliteMatch: "Sentinel-1 SAR Flood Inundation",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
        latitude: 12.9716,
        longitude: 80.2437,
        status: "Urgent",
        votes: 29,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
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
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf8");
      const parsed = JSON.parse(data);
      // Ensure all arrays exist
      if (!parsed.users) parsed.users = [];
      if (!parsed.alerts) parsed.alerts = [];
      if (!parsed.communityReports) parsed.communityReports = [];
      if (!parsed.telemetryLogs) parsed.telemetryLogs = [];
      if (!parsed.settings) parsed.settings = getDefaultStore().settings;

      // Ensure user 24104031@nec.edu.in is present
      const hasSree = parsed.users.some((u) => u.email === "24104031@nec.edu.in");
      if (!hasSree) {
        parsed.users.push({
          id: 2,
          name: "Subhasree Pitchaiya",
          email: "24104031@nec.edu.in",
          password_hash: "$2a$12$A96CKx4mGvcweuSWg8Xr6.pbl2/LCEtbYDjdhTz8kj9PhD3r/V99y",
          mobile: "24104031@nec.edu.in",
          jobTitle: "Lead Environmental Analyst",
          role: "System Admin",
          organization: "EcoWatch Global",
          location: "Chennai, Tamil Nadu",
          createdAt: new Date().toISOString(),
        });
      }
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
