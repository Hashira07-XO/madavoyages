import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ ALERTE : La variable DATABASE_URL n'est pas définie dans l'environnement !");
} else {
  console.log("✅ DATABASE_URL détectée avec succès.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,                       
  idleTimeoutMillis: 5000,      
  connectionTimeoutMillis: 10000 
});

pool.on('error', (err, client) => {
  console.error('⚠️ Connexion PostgreSQL/Supabase fermée en arrière-plan (récupération automatique) :', err.message);
});

export const query = (text, params) => pool.query(text, params);
export { pool };
export default pool;