import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'sql/schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('[vault] migration complete');
  await pool.end();
  process.exit(0);
}

migrate().catch((e) => {
  console.error('[vault] migration failed:', e.message);
  process.exit(1);
});