import { pool } from '../config/db.js';

export const UserModel = {
  // Trouver un utilisateur par e-mail
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0]; // Renvoie l'utilisateur ou undefined
  },

  // Créer un nouvel utilisateur
  async create(nom, prenom, email, hashedPassword, verificationToken) {
    const queryText = `
      INSERT INTO users (nom, prenom, email, password_hash, is_verified, verification_token) 
      VALUES ($1, $2, $3, $4, false, $5) 
      RETURNING id, nom, prenom, email, role
    `;
    const values = [nom, prenom, email, hashedPassword, verificationToken];
    const result = await pool.query(queryText, values);
    return result.rows[0];
  },

  // Valider l'e-mail d'un utilisateur
  async verify(token) {
    // Vérifier d'abord si le token existe
    const checkResult = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (checkResult.rows.length === 0) return null;

    // Mettre à jour
    const updateResult = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING *',
      [token]
    );
    return updateResult.rows[0];
  }
};