import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

// 1. Configuration hybride de dotenv (Local + Production)
dotenv.config(); // Charge le .env classique ou les variables système (Vercel)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true }); // Surcharge avec le local si présent

const { Pool } = pg;

// Validation de sécurité pour éviter le crash silencieux
if (!process.env.DATABASE_URL) {
  console.error("❌ ALERTE : La variable DATABASE_URL n'est pas définie dans l'environnement !");
} else {
  console.log("✅ DATABASE_URL détectée avec succès.");
}

// 2. Initialisation du pool Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requis pour la sécurité Supabase
  },
  max: 20,
  idleTimeoutMillis: 10000,      // Garde les connexions actives 10s pour le chaînage des requêtes admin
  connectionTimeoutMillis: 5000  // Temps d'attente maximal de reconnexion
});

pool.on('error', (err) => {
  console.error('Liaison Supabase interrompue en tâche de fond :', err.message);
});

// 3. Exportation de la fonction de requête directe
export const query = (text, params) => pool.query(text, params);

// 4. Export nommé pour UserModel.js
export { pool };

// 5. Export par défaut pour circuitModel.js et reservationModel.js
export default pool;