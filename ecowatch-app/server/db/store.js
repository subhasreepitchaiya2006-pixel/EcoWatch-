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
        name: "Dr. Marcus Vance",
        email: "admin@ecowatch.global",
        password_hash: "$2a$10$m1WEh1n09IuA3/yX9PNVpuxlCIKYnXFDj3aUtyKruz8uqL54VnhNG", // admin123
        mobile: "+1 (415) 890-4200",
        jobTitle: "Global Operations Director",
        role: "System Admin",
        organization: "EcoWatch Global Directorate",
        location: "Geneva, Switzerland",
        status: "Active",
        createdAt: "2024-01-10T08:00:00.000Z",
      },
      {
        id: 2,
        name: "Subhasree Pitchaiya",
        email: "24104031@nec.edu.in",
        password_hash: "$2a$10$m1WEh1n09IuA3/yX9PNVpuxlCIKYnXFDj3aUtyKruz8uqL54VnhNG", // admin123
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
      {
        id: 3,
        name: "Elena Rostova",
        email: "analyst@ecowatch.global",
        password_hash: "$2a$10$amvfzIVdF1c.cBSKL5N6feHGWjop484skbIt3Axhv9JX6GGwOqBtu", // analyst123
        mobile: "+43 1 71100 230",
        jobTitle: "Senior Orbital Telemetry Specialist",
        role: "Analyst",
        organization: "Copernicus Earth Observation Unit",
        location: "Vienna, Austria",
        status: "Active",
        createdAt: "2024-03-01T10:15:00.000Z",
      },
      {
        id: 4,
        name: "Capt. Vikram Rathore",
        email: "responder@ecowatch.global",
        password_hash: "$2a$10$/LqsH/71NinsG4W.x4TVce5fQ4f7KovJX.9jhrKvNEiAOUFM3c1X2", // responder123
        mobile: "+91 94440 98765",
        jobTitle: "Disaster Rapid Response Incident Commander",
        role: "Emergency Responder",
        organization: "National Disaster Mitigation Taskforce",
        location: "Chennai & Coastal Zones",
        status: "Active",
        createdAt: "2024-03-12T14:20:00.000Z",
      },
      {
        id: 5,
        name: "Dr. Ananya Sharma",
        email: "scientist@ecowatch.global",
        password_hash: "$2a$10$nPZqNtavAJ.0XBl4TjZPFuahNUIpvoYMYK/gy.a/GW92VrTKhBTR.", // scientist123
        mobile: "+91 80 2293 2000",
        jobTitle: "Chief Atmospheric & Climate Modeler",
        role: "Scientist",
        organization: "Indian Ocean Climate Research Institute",
        location: "Bengaluru, India",
        status: "Active",
        createdAt: "2024-04-05T11:45:00.000Z",
      },
      {
        id: 6,
        name: "Carlos Mendez",
        email: "inspector@ecowatch.global",
        password_hash: "$2a$10$MEvL8bf9ySG7q7wlTeOtde/A6dqtCmC1DhjLREd5Foz/zWa/N8q9.", // inspector123
        mobile: "+34 93 402 7000",
        jobTitle: "Environmental Compliance & Field Auditor",
        role: "Inspector",
        organization: "Global Ecological Protection Agency",
        location: "Barcelona / Ennore Field Station",
        status: "Active",
        createdAt: "2024-05-18T16:00:00.000Z",
      },
    ],
    alerts: [
      {
        id: 1001,
        type: "Flash Flood Warning",
        severity: "CRITICAL",
        region: "Thamirabarani Basin & KTC Nagar, Tirunelveli",
        detectedBy: "Sentinel-1 SAR Surface Radar Inundation",
        description: "Rapid water level increase detected along Thamirabarani low-lying drainage corridors following sustained monsoon rainfall. Surface water backscatter exceeds baseline safety thresholds.",
        latitude: 8.7522,
        longitude: 77.7414,
        affected: "14,800",
        depth: "Gauge 1.4m ↑",
        evacStatus: "60%",
        recommendedActions: [
          "Deploy immediate sandbag embankments along KTC Nagar flood gates.",
          "Coordinate localized civilian evacuation to higher ground in Palayamkottai.",
          "Halt heavy vehicular traffic along low-lying underpasses.",
        ],
        status: "Active",
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: 1002,
        type: "Wildfire Thermal Anomaly",
        severity: "HIGH",
        region: "Western Ghats Foothills, Kalakkad Reserve",
        detectedBy: "Landsat-9 TIRS-2 Thermal Infrared",
        description: "Elevated surface thermal radiance detected over 85 hectares of dry forest canopy. Band 10 brightness temperature exceeds seasonal baseline by 7.8°C.",
        latitude: 8.5200,
        longitude: 77.5500,
        affected: "3,200",
        depth: "Thermal +7.8°C",
        evacStatus: "25%",
        recommendedActions: [
          "Establish a 4km fire-break perimeter along forest buffer zones.",
          "Stage aerial water tender tankers at regional staging zone #2.",
          "Issue precautionary smoke advisory for foothill agricultural settlements.",
        ],
        status: "Active",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 1003,
        type: "High Wind & Marine Gale Advisory",
        severity: "WARNING",
        region: "Gulf of Mannar & Coastal Sector",
        detectedBy: "GOES-16 / INSAT-3DR Geostationary",
        description: "Sustained cyclonic wind vectors recorded at 58 km/h with gusts exceeding 72 km/h. Coastal swell height estimated at 2.1m.",
        latitude: 8.8050,
        longitude: 78.1450,
        affected: "9,400",
        depth: "Gusts 72 km/h",
        evacStatus: "35%",
        recommendedActions: [
          "Advise coastal fishermen to remain in designated harbors.",
          "Inspect port crane anchors and container stacking facilities.",
          "Secure elevated communication masts and billboard frameworks.",
        ],
        status: "Active",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 1004,
        type: "Hydrological Discoloration Alert",
        severity: "ADVISORY",
        region: "Chennai Coast & Marina Basin",
        detectedBy: "Sentinel-2 MSI Optical Multispectral",
        description: "High chlorophyll-a concentrations and localized chemical runoff detected along coastal drainage outlets.",
        latitude: 13.0827,
        longitude: 80.2707,
        affected: "6,100",
        depth: "Turbidity 18 NTU",
        evacStatus: "Normal",
        recommendedActions: [
          "Collect water samples at culvert output stations.",
          "Coordinate with municipal wastewater division for diversion inspection.",
          "Maintain automated optical Sentinel-2 monitoring.",
        ],
        status: "Active",
        timestamp: new Date(Date.now() - 14400000).toISOString(),
      },
    ],
    communityReports: [
      {
        id: 101,
        title: "Coastal Water Discoloration & Algal Bloom",
        category: "Water Quality",
        location: "Marina Beach, Chennai",
        reporter: "Alex S.",
        description: "Noticeable algal bloom and chlorophyll spike observed along the shoreline near the lighthouse.",
        satelliteMatch: "Sentinel-2 Chlorophyll-a anomalous spectral spike (+0.42)",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
        latitude: 13.0475,
        longitude: 80.2824,
        status: "Resolved",
        votes: 14,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 102,
        title: "Severe Stormwater Inundation - Main Corridor",
        category: "Flooding",
        location: "KTC Nagar, Tirunelveli",
        reporter: "Praveen M.",
        description: "Water level crossed 1.2 feet along the low-lying arterial roadway. Storm drain partially clogged with debris.",
        satelliteMatch: "Sentinel-1 SAR surface water radar backscatter verified (NDWI > 0.38)",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
        latitude: 8.7522,
        longitude: 77.7414,
        status: "Urgent",
        votes: 42,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 103,
        title: "Municipal Water Main Pipeline Breach",
        category: "Leakage",
        location: "Palayamkottai, Tirunelveli",
        reporter: "Karthik R.",
        description: "High-pressure clean water supply pipeline ruptured near market junction causing street wash-out.",
        satelliteMatch: "Sentinel-2 MSI localized hydrological surface reflectance shift detected",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxtkpP1SgaGgiAeoc-fsmV2euLnG-ItoBNfThjH7EsvaFlk0sVU4c1GrQyWa74Yr3gNhm1YVEkdfi-lMpsfCou3BwcpcrKdCCYQYjwNVmnX3VDyU2S2iZ9GmSbTVlpC-29KTj3Abl-UEQhMj5ek2e4ZkER6ogy8zmYbZlxj6EMBpdxkC2v9Ar2VaqVVjjvQA6WgOdSY0xilzFBvZ33EajoYnIIElKl0JZJrV8qNc6YyR1jOtIMYY-8gg",
        latitude: 8.7180,
        longitude: 77.7340,
        status: "Investigating",
        votes: 19,
        timestamp: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: 104,
        title: "Unsegregated Waste Pile Along River Canal",
        category: "Waste",
        location: "Vannarpettai, Tirunelveli",
        reporter: "Subhashree P.",
        description: "Accumulation of packaging and non-biodegradable waste near canal embankment. Risk of canal blockage.",
        satelliteMatch: "Sentinel-2 MSI 10m high-resolution surface anomaly confirmed",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA22ONmigL4UgvPkimLefcF38bcAK5KNXFd1c-YDbkEs68jXUevZa_6FrEcxF3X2xBMq88KcCOma6kOdXFRV0t5ZRCT9L0tjN_H7ShI_9134SRbCGxAq9MpTMAE-8JRskG2oiucyoCgsvPxgMf-xSyt2ww2DWbHKHOO8m6NfXjXEy5Pocxm3KrHAzsFCbTTd2bD-47xsWN1J0O4ACUJvz7bvttCb600hjbFk7eAa16heNDm1IPCVEzkEQ",
        latitude: 8.7289,
        longitude: 77.7126,
        status: "Investigating",
        votes: 27,
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 105,
        title: "Industrial Particulate Emissions Spike",
        category: "Air Pollution",
        location: "SIPCOT Industrial Sector, Tirunelveli",
        reporter: "Dr. Ananya Sharma",
        description: "Dense particulate plume observed during afternoon factory shift. Strong chemical odor noted.",
        satelliteMatch: "Sentinel-5P TROPOMI Tropospheric NO2 column spike (14.2 µmol/m²)",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
        latitude: 8.7400,
        longitude: 77.7500,
        status: "Urgent",
        votes: 38,
        timestamp: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 106,
        title: "Unauthorized Tree Removal in Greenbelt",
        category: "Illegal Tree",
        location: "Perumalpuram Green Corridor, Tirunelveli",
        reporter: "David K.",
        description: "Clearance of mature avenue trees without municipal forest division permit.",
        satelliteMatch: "Sentinel-2 NDVI canopy loss delta (-0.24) verified by orbital telemetry",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA22ONmigL4UgvPkimLefcF38bcAK5KNXFd1c-YDbkEs68jXUevZa_6FrEcxF3X2xBMq88KcCOma6kOdXFRV0t5ZRCT9L0tjN_H7ShI_9134SRbCGxAq9MpTMAE-8JRskG2oiucyoCgsvPxgMf-xSyt2ww2DWbHKHOO8m6NfXjXEy5Pocxm3KrHAzsFCbTTd2bD-47xsWN1J0O4ACUJvz7bvttCb600hjbFk7eAa16heNDm1IPCVEzkEQ",
        latitude: 8.7050,
        longitude: 77.7450,
        status: "Resolved",
        votes: 11,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
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
