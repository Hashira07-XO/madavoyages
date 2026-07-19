import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

// 1. On configure dotenv immédiatement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 2. On extrait le Pool de pg
const { Pool } = pg;

// Étape de debug temporaire
console.log("DATABASE_URL chargée :", process.env.DATABASE_URL);

// 3. On initialise la connexion
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Indispensable pour se connecter à Supabase depuis l'extérieur sans importer le certificat
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});


// 4. Exports nommés (si vous les utilisez ailleurs)
export const query = (text, params) => pool.query(text, params);
export { pool };

// 5. EXPORT PAR DÉFAUT (Pour corriger l'erreur de votre contrôleur !)
export default { query, pool };