import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: {
      type: String,
      required: true,
      enum: ["Critical", "CRITICAL", "High", "HIGH", "Warning", "WARNING", "Advisory", "ADVISORY"],
      default: "WARNING",
    },
    region: { type: String, required: true },
    detectedBy: { type: String, default: "Sentinel-2 Orbit" },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Monitoring", "Resolved", "Broadcasted"],
    },
    description: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Alert = mongoose.models.Alert || mongoose.model("Alert", alertSchema);
export default Alert;
