import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, default: null },
    mobile: { type: String, default: "" },
    jobTitle: { type: String, default: "Environmental Analyst" },
    role: {
      type: String,
      enum: ["Citizen", "System Admin", "Analyst", "Scientist", "Emergency Responder", "Inspector"],
      default: "Citizen",
    },
    organization: { type: String, default: "EcoWatch Global" },
    location: { type: String, default: "" },
    googleId: { type: String, default: null, sparse: true },
    microsoftId: { type: String, default: null, sparse: true },
    picture: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
