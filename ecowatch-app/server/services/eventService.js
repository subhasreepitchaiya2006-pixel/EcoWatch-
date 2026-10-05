/**
 * ====================================================
 * Node.js Event-Driven Architecture & Callback Service
 * (CO2 & CO6 Syllabus Requirements: EventEmitter, Event Loop, Callbacks)
 * ====================================================
 */

import EventEmitter from "events";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Node.js Event-Driven Architecture (CO2)
// Custom EventEmitter for real-time environmental incidents
class EnvironmentalEventEmitter extends EventEmitter {}

export const environmentalEvents = new EnvironmentalEventEmitter();

// Event Listener registered on the Node.js event bus
environmentalEvents.on("DISASTER_ALERT_BROADCAST", (alertData) => {
  console.log(`[Event-Driven Architecture] 🚨 Broadcast Event Received: ${alertData.type} in ${alertData.region} [Severity: ${alertData.severity}]`);
});

environmentalEvents.on("COMMUNITY_REPORT_SUBMITTED", (reportData) => {
  console.log(`[Event-Driven Architecture] 📢 Community Incident Event: "${reportData.title}" reported at ${reportData.location}`);
});

// 2. Demonstration of Node.js Error-First Callbacks & Event Loop non-blocking I/O (CO6)
/**
 * Asynchronously reads telemetry cache using traditional Node.js error-first callback pattern
 * @param {string} fileName 
 * @param {function(Error|null, object=): void} callback 
 */
export function readTelemetryFileWithCallback(fileName, callback) {
  const filePath = path.resolve(__dirname, `../data/${fileName || "store.json"}`);

  // Node.js fs.readFile utilizes the libuv event loop threadpool with an error-first callback (err, data)
  fs.readFile(filePath, "utf8", (err, fileContent) => {
    if (err) {
      // Return error to the callback as per standard Node.js convention
      return callback(err);
    }

    try {
      const parsed = JSON.parse(fileContent);
      // Callback with null as first argument indicating success
      callback(null, parsed);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

/**
 * Event-driven trigger helper to emit an environmental broadcast
 */
export function emitDisasterBroadcast(alert) {
  environmentalEvents.emit("DISASTER_ALERT_BROADCAST", alert);
}

export default {
  environmentalEvents,
  readTelemetryFileWithCallback,
  emitDisasterBroadcast,
};
