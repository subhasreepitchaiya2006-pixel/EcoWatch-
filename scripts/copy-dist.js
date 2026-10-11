import fs from "fs";
import path from "path";

const src = path.resolve("ecowatch-app/dist");
const dest = path.resolve("dist");

if (fs.existsSync(src)) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log("Successfully prepared dist/ for production hosting.");
} else {
  console.error("Warning: ecowatch-app/dist was not found after Vite build.");
}
