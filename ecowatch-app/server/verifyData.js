// verifyData.js - Simple script to verify seeded MySQL data
import { connectDB, pool } from './db.js';

async function verify() {
  try {
    await connectDB();
    const [alerts] = await pool.query('SELECT COUNT(*) AS cnt FROM alerts');
    const [reports] = await pool.query('SELECT COUNT(*) AS cnt FROM reports');
    const [users] = await pool.query('SELECT COUNT(*) AS cnt FROM users');
    console.log('Data verification results:');
    console.log('Alerts count:', alerts[0].cnt);
    console.log('Reports count:', reports[0].cnt);
    console.log('Users count:', users[0].cnt);
    process.exit(0);
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
}

verify();
