import { connectMySQL, isMySQLConnected, executeQuery, pool } from "./mysql.js";
import { memoryStore, saveStore, loadStore } from "./store.js";
import { UsersRepo, AlertsRepo, ReportsRepo, SettingsRepo, TelemetryRepo } from "./repository.js";

export async function connectDB() {
  console.log("🔄 Initializing EcoWatch database connections...");
  const mysqlOk = await connectMySQL();
  return mysqlOk;
}

export {
  connectMySQL,
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
};

export default {
  connectDB,
  isMySQLConnected: () => isMySQLConnected,
  UsersRepo,
  AlertsRepo,
  ReportsRepo,
  SettingsRepo,
  TelemetryRepo,
};
