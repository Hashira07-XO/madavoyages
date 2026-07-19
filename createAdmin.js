// createAdmin.js
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './api/config/db.js'; // Ajuste le chemin vers ton db.js si nécessaire

dotenv.config();

async function createAdmin() {
  const admin = {
    nom: 'Admin',
    prenom: 'MadaVoyages',
    email: 'admin@madavoyages.com', // Remplace par ton email admin
    password: 'TonMotDePasseSecurise123!' // Remplace par ton vrai mot de passe
  };

  try {
    console.log("Connexion à PostgreSQL (Supabase)...");
    
    // 1. Hachage conforme à ton contrôleur (salt = 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(admin.password, saltRounds);

    // 2. Insertion directe avec le rôle 'admin' et déjà vérifié
    const queryText = `
      INSERT INTO users (nom, prenom, email, password_hash, role, is_verified) 
      VALUES ($1, $2, $3, $4, 'admin', true) 
      RETURNING id, email, role;
    `;
    const values = [admin.nom, admin.prenom, admin.email, hashedPassword];
    
    const result = await pool.query(queryText, values);
    
    console.log('\n==================================================');
    console.log('✅ Compte Administrateur créé avec succès !');
    console.log('Données :', result.rows[0]);
    console.log('==================================================\n');

  } catch (error) {
    if (error.code === '23505') {
      console.error('❌ Erreur : Cet e-mail est déjà utilisé dans la table users.');
    } else {
      console.error('❌ Erreur critique lors de la création :', error);
    }
  } finally {
    // Fermeture propre du pool pour rendre la main au terminal
    await pool.end();
  }
}

createAdmin();