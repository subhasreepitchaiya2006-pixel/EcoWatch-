import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Flooding", "Waste", "Air Pollution", "Leakage", "Water Quality", "Illegal Tree", "Other"],
      default: "Other",
    },
    location: { type: String, required: true },
    reporter: { type: String, default: "Anonymous Member" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      default: "Investigating",
      enum: ["Urgent", "Investigating", "Verified", "Resolved"],
    },
    description: { type: String, required: true },
    satelliteMatch: { type: String, default: "Cross-referenced with Orbit Telemetry" },
    image: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);
export default Report;
