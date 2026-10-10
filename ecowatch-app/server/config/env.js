import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from ecowatch-app/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET is not set in environment variables. Using resilient deployment fallback secret. Configure JWT_SECRET in your Vercel Project Settings for enhanced security.");
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: process.env.JWT_SECRET || "ecowatch-jwt-secret-production-2026-secure",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "*",

  // MySQL configuration
  mysql: {
    host: process.env.MYSQL_HOST || (process.env.NODE_ENV === "production" && !process.env.MYSQL_URL ? null : "localhost"),
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "ecowatch",
    url: process.env.MYSQL_URL || null,
    connectionLimit: parseInt(process.env.MYSQL_POOL_LIMIT, 10) || 10,
    connectTimeout: 3000,
  },

  // MongoDB configuration (optional fallback)
  mongo: {
    uri: process.env.MONGODB_URI || (process.env.NODE_ENV === "production" ? null : "mongodb://localhost:27017/ecowatch"),
  },

  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
};

export default config;
