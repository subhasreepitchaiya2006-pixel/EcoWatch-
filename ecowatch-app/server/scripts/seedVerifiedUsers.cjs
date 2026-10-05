const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const STORE_PATH = path.resolve(__dirname, '../data/store.json');

const VERIFIED_USERS = [
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
    picture: "https://lh3.googleusercontent.com/a/ACg8ocJGzUvz2gkleN1V2oOlgeCfmibdePkWtu1ucppH2x-sCgwTXA=s96-c"
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
  }
];

let store = {};
if (fs.existsSync(STORE_PATH)) {
  try {
    store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch (err) {
    console.error('Error reading store.json:', err);
    store = {};
  }
}

if (!store.users) store.users = [];

// Upsert verified accounts
VERIFIED_USERS.forEach(verifiedUser => {
  const idx = store.users.findIndex(u => u.email.toLowerCase() === verifiedUser.email.toLowerCase());
  if (idx >= 0) {
    store.users[idx] = { ...store.users[idx], ...verifiedUser };
  } else {
    store.users.push(verifiedUser);
  }
});

fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
console.log('Successfully seeded 6 verified users to store.json!');

// Test passwords
VERIFIED_USERS.forEach(u => {
  const passwords = {
    'admin@ecowatch.global': 'admin123',
    '24104031@nec.edu.in': 'admin123',
    'analyst@ecowatch.global': 'analyst123',
    'responder@ecowatch.global': 'responder123',
    'scientist@ecowatch.global': 'scientist123',
    'inspector@ecowatch.global': 'inspector123',
  };
  const pw = passwords[u.email];
  const ok = bcrypt.compareSync(pw, u.password_hash);
  console.log(`Account [${u.email}] with role [${u.role}] => Password [${pw}]: ${ok ? 'VALID ✅' : 'INVALID ❌'}`);
});
