import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlFilePath = path.resolve(__dirname, 'tamilnadu_workbench_data.sql');

async function runSeed() {
  try {
    // Ensure DB connection is established
    await connectDB();
    // No ALTER needed; schema already defines required columns
    const rawSql = fs.readFileSync(sqlFilePath, 'utf8');
    // Strip '--' comments (including inline) and split into statements
    const cleanedSql = rawSql.replace(/--.*$/gm, '');
    const statements = cleanedSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const stmt of statements) {
      const query = stmt.endsWith(';') ? stmt : stmt + ';';
      await pool.query(query);
    }
    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

runSeed();
