import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ecowatch";

async function runSync() {
  console.log(`📡 Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ":****@")}...`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Successfully connected to MongoDB!");

    const storePath = path.resolve(__dirname, "../data/store.json");
    if (!fs.existsSync(storePath)) {
      console.error(`❌ store.json not found at: ${storePath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    const db = mongoose.connection.db;

    for (const [key, items] of Object.entries(data)) {
      if (Array.isArray(items) && items.length > 0) {
        const collection = db.collection(key);
        // Clean and prepare items
        const prepared = items.map((doc) => {
          const docCopy = { ...doc };
          if (docCopy.id !== undefined && !docCopy.source_id) {
            docCopy.source_id = docCopy.id;
          }
          return docCopy;
        });

        await collection.deleteMany({});
        await collection.insertMany(prepared);
        console.log(`📦 Synced ${prepared.length} documents into MongoDB collection: '${key}'`);
      }
    }

    console.log("\n🎉 EcoWatch data has been synced to MongoDB successfully!");
    console.log("🔍 You can now open MongoDB Compass and inspect the 'ecowatch' database.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Failed to connect to MongoDB:", err.message);
    console.log("👉 Ensure MongoDB Community Server is running on port 27017, or specify a valid MongoDB Atlas URI in your .env file.\n");
    process.exit(1);
  }
}

runSync();
