import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    organization: { type: String, default: "EcoWatch Global" },
    industry: { type: String, default: "Environmental Intelligence" },
    retentionPeriod: { type: String, default: "3 Years" },
    autoArchive: { type: Boolean, default: true },
    enforce2FA: { type: Boolean, default: true },
    apiKeys: [
      {
        id: Number,
        name: String,
        key: String,
        created: String,
        icon: String,
        iconBg: String,
      },
    ],
    webhooks: [
      {
        id: Number,
        name: String,
        url: String,
        events: [String],
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
export default Setting;
