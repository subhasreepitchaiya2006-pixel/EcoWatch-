import { connectMySQL, isMySQLConnected, executeQuery, pool } from "./mysql.js";
import { memoryStore, saveStore, loadStore } from "./store.js";
import { UsersRepo, AlertsRepo, ReportsRepo, SettingsRepo, TelemetryRepo } from "./repository.js";

import mongoose from "mongoose";
import config from "../config/env.js";

export let isMongoConnected = false;

export async function connectDB() {
  console.log("🔄 Initializing EcoWatch database connections...");
  const mysqlOk = await connectMySQL();

  if (config.mongo?.uri) {
    try {
      await mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 2000 });
      isMongoConnected = true;
      console.log("🍃 MongoDB connected successfully at:", config.mongo.uri);
    } catch (mErr) {
      isMongoConnected = false;
      console.warn("⚠️  MongoDB connection skipped/unavailable:", mErr.message);
    }
  }

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
