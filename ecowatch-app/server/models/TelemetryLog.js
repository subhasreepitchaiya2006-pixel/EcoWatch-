import mongoose from "mongoose";

const telemetryLogSchema = new mongoose.Schema(
  {
    satelliteId: { type: String, required: true },
    sensorName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    aqi: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const TelemetryLog = mongoose.models.TelemetryLog || mongoose.model("TelemetryLog", telemetryLogSchema);
export default TelemetryLog;
