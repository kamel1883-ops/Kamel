import 'dotenv/config';

const encryptionKey = process.env.VAULT_ENCRYPTION_KEY;
if (!encryptionKey || encryptionKey.length !== 64) {
  throw new Error('VAULT_ENCRYPTION_KEY must be a 64-hex-char (32-byte) key. Generate with: openssl rand -hex 32');
}
if (!process.env.VAULT_API_KEY) {
  throw new Error('VAULT_API_KEY is required (shared secret with Base44)');
}

export const config = {
  port: process.env.PORT || 4000,
  apiKey: process.env.VAULT_API_KEY,
  jwtSecret: process.env.VAULT_JWT_SECRET || encryptionKey,
  encryptionKey,
  db: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'vault',
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'jadara_vault',
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: true } : false,
  },
  storageDir: process.env.VAULT_STORAGE_DIR || './storage',
  docTokenTtlSeconds: Number(process.env.VAULT_DOC_TTL || 300),
};