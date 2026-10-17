import dotenv from 'dotenv';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const rootEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url));
const backendEnvPath = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: fs.existsSync(rootEnvPath) ? rootEnvPath : backendEnvPath });

const required = (name, fallback) => process.env[name] || fallback;

export const env = {
  nodeEnv: required('NODE_ENV', 'development'),
  port: Number(required('PORT', '3000')),
  databasePath: required('DATABASE_PATH', './.data/evarti.sqlite'),
  sessionSecret: required('SESSION_SECRET', ''),
  frontendOrigin: required('FRONTEND_ORIGIN', 'http://localhost:5173'),
  cookieSecure: required('COOKIE_SECURE', 'false') === 'true',
  passwords: {
    owner: required('OWNER_PASSWORD', ''),
    cashier1: required('CASHIER1_PASSWORD', ''),
    cashier2: required('CASHIER2_PASSWORD', ''),
  },
};

export function validateEnv(config = env) {
  if (typeof config.sessionSecret !== 'string' || config.sessionSecret.length < 32 || config.sessionSecret.includes('replace-with-a-random-secret')) {
    throw new Error('SESSION_SECRET harus diisi dengan nilai acak minimal 32 karakter.');
  }
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error('PORT harus berada pada rentang 1-65535.');
  }
  for (const username of ['owner', 'cashier1', 'cashier2']) {
    const password = config.passwords?.[username];
    if (typeof password !== 'string' || password.length < 12 || password.startsWith('change-this-')) {
      throw new Error(`Password akun ${username} wajib minimal 12 karakter.`);
    }
  }
}
