import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import config from "./config/env.js";
import { connectDB, isMySQLConnected } from "./db/index.js";
import apiRouter from "./routes/index.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ----------------------------------------------------
// Global Middlewares
// ----------------------------------------------------
app.use(cors({
  origin: true, // Allow frontend during local dev and production
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------
app.use("/api", apiRouter);

// ----------------------------------------------------
// Production Static Hosting (Single-Page App)
// ----------------------------------------------------
const distPath = path.resolve(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ----------------------------------------------------
// 404 and Global Error Handling
// ----------------------------------------------------
app.use("/api/*", notFoundHandler);
app.use(errorHandler);

// ----------------------------------------------------
// Server Lifecycle
// ----------------------------------------------------
let server = null;

export async function startServer() {
  await connectDB();

  return new Promise((resolve, reject) => {
    server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 EcoWatch Intelligence REST Backend Running!`);
      console.log(`📡 Server URL: http://localhost:${config.port}`);
      console.log(`📖 API Docs:   http://localhost:${config.port}/api/docs`);
      console.log(`🐬 Database:   ${isMySQLConnected ? "MySQL / Relational Pool (Active)" : "Persistent File-Backed Store (store.json)"}`);
      console.log(`🛰️ Satellites: Sentinel-2, Landsat-9, GOES-16, Sentinel-5P`);
      console.log(`====================================================`);
      resolve(server);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n⚠️  Port ${config.port} is already in use by another running Node process.`);
        console.error(`👉 Run 'npm run clean:ports' in PowerShell to free up ports 3001 and 5173.\n`);
        process.exit(1);
      }
      reject(err);
    });
  });
}

// Auto-start server when run directly
if (process.env.NODE_ENV !== "test" && process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  startServer();
} else if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  startServer();
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (server) {
    server.close(() => {
      console.log("EcoWatch backend server closed gracefully.");
      process.exit(0);
    });
  }
});

export { app };
export default app;
