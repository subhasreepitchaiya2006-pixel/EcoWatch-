import {
  connectDB,
  isMySQLConnected,
  executeQuery,
  pool,
  memoryStore,
  saveStore,
  loadStore,
  UsersRepo,
  AlertsRepo,
  ReportsRepo,
  SettingsRepo,
  TelemetryRepo,
  isMongoConnected,
} from "./db/index.js";

import User from "./models/User.js";

export {
  connectDB,
  isMySQLConnected,
  executeQuery,
  pool,
  memoryStore,
  saveStore,
  loadStore,
  UsersRepo,
  AlertsRepo,
  ReportsRepo,
  SettingsRepo,
  TelemetryRepo,
  User,
  Alert,
  Report,
  Setting,
  TelemetryLog,
};

export default {
  connectDB,
  isMySQLConnected,
  memoryStore,
  saveStore,
};
