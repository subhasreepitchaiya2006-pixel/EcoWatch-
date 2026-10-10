import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isMySQLConnected = false;
export let pool = null;

/**
 * Initialize MySQL Connection Pool and Auto-Run Schema Setup
 */
export async function connectMySQL() {
  if (!config.mysql.url && !config.mysql.host) {
    console.log("ℹ️ No remote MySQL configured. Utilizing resilient dual-engine file/memory store (store.json).");
    isMySQLConnected = false;
    pool = null;
    return false;
  }
  try {
    const poolConfig = config.mysql.url
      ? { uri: config.mysql.url, waitForConnections: true, connectionLimit: config.mysql.connectionLimit }
      : {
          host: config.mysql.host,
          port: config.mysql.port,
          user: config.mysql.user,
          password: config.mysql.password,
          database: config.mysql.database,
          waitForConnections: true,
          connectionLimit: config.mysql.connectionLimit,
          connectTimeout: config.mysql.connectTimeout,
        };

    // First attempt to test connection without database specified so we can create it if not exists
    const testConnConfig = config.mysql.url
      ? { uri: config.mysql.url, connectTimeout: 3000 }
      : {
          host: config.mysql.host,
          port: config.mysql.port,
          user: config.mysql.user,
          password: config.mysql.password,
          connectTimeout: 3000,
        };

    const testConn = await mysql.createConnection(testConnConfig);

    // Ensure database exists
    await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.mysql.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await testConn.end();

    // Now establish pooled connection to the ecowatch database
    pool = mysql.createPool(poolConfig);

    // Verify pool ping
    const connection = await pool.getConnection();
    connection.release();

    isMySQLConnected = true;
    console.log(`🐬 Connected to MySQL database successfully [${config.mysql.database} on ${config.mysql.host}:${config.mysql.port}]`);

    // Run schema tables setup
    await initSchema();
    return true;
  } catch (err) {
    isMySQLConnected = false;
    pool = null;
    console.log(`ℹ️  MySQL connection note: ${err.message}. Using resilient persistent file store (store.json).`);
    return false;
  }
}

/**
 * Initialize Tables and Seed Records if not already present
 */
async function initSchema() {
  if (!pool || !isMySQLConnected) return;

  try {
    const schemaFile = path.resolve(__dirname, "../schema.sql");
    if (fs.existsSync(schemaFile)) {
      const sqlContent = fs.readFileSync(schemaFile, "utf8");
      // Strip line and block comments before splitting statements
      const cleanSql = sqlContent
        .replace(/--.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");

      const statements = cleanSql
        .split(/;\s*$/m)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const conn = await pool.getConnection();
      try {
        for (const statement of statements) {
          if (statement.toLowerCase().startsWith("use ") || statement.toLowerCase().startsWith("create database ")) {
            continue;
          }
          await conn.query(statement).catch((qErr) => {
            // Ignore duplicate key or existing table warnings
            if (!qErr.message.includes("already exists") && !qErr.message.includes("Duplicate entry")) {
              console.warn("Schema query notice:", qErr.message);
            }
          });
        }
        console.log("✅ EcoWatch MySQL schema verified and ready.");
      } finally {
        conn.release();
      }
    }
  } catch (err) {
    console.warn("Schema initialization error:", err.message);
  }
}

/**
 * Execute parameterized query safely
 */
export async function executeQuery(sql, params = []) {
  if (!pool || !isMySQLConnected) {
    throw new Error("MySQL is not currently connected.");
  }
  const [results] = await pool.query(sql, params);
  return results;
}

export default {
  connectMySQL,
  executeQuery,
  isMySQLConnected: () => isMySQLConnected,
  getPool: () => pool,
};
