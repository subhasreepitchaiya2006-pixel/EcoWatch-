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
} from "./db/index.js";

import User from "./models/User.js";
import Alert from "./models/Alert.js";
import Report from "./models/Report.js";
import Setting from "./models/Setting.js";
import TelemetryLog from "./models/TelemetryLog.js";

export const isMongoConnected = false;

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
