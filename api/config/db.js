import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

// 1. Configuration de dotenv
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { Pool } = pg;

console.log("DATABASE_URL chargée :", process.env.DATABASE_URL);

// 2. Initialisation de la connexion adaptée à Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Indispensable pour Supabase
  },
  max: 20,
  // Ajustements pour éviter le "Connection terminated due to connection timeout"
  idleTimeoutMillis: 0,          // Ferme les connexions inactives immédiatement (recommandé pour le port 6543)
  connectionTimeoutMillis: 5000  // Donne 5 secondes à Supabase pour répondre au lieu de 2
});

// Évite que l'application Node ne crashe si Supabase ferme une connexion en tâche de fond
pool.on('error', (err) => {
  console.error('Liaison Supabase interrompue en tâche de fond :', err.message);
});

// 3. Extraction de la fonction de requête directe
export const query = (text, params) => pool.query(text, params);

// 4. Exports nommés (Pour UserModel.js qui utilise { pool })
export { pool };

// 5. EXPORT PAR DÉFAUT RECTIFIÉ (Pour circuitModel et reservationModel qui utilisent 'db')
// On exporte DIRECTEMENT l'instance du pool. Comme ça, db.query() fonctionnera partout !
export default pool;