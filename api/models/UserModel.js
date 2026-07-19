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
  }, 
  async getAllUsers() {
    try {
      // On trie par ID pour garder un ordre stable dans le tableau
      const queryText = 'SELECT id, nom, prenom, email, role, is_verified FROM users ORDER BY id ASC';
      const result = await pool.query(queryText);
      return result.rows; // Renvoie un tableau d'utilisateurs
    } catch (error) {
      console.error("Erreur dans UserModel.getAllUsers :", error);
      throw error;
    }
  },

  // 2. Modifier le rôle d'un utilisateur (ex: passer à 'admin', 'client', ou 'banni')
  async updateRole(id, newRole) {
    try {
      const queryText = `
        UPDATE users 
        SET role = $1 
        WHERE id = $2 
        RETURNING id, nom, prenom, email, role
      `;
      const values = [newRole, id];
      const result = await pool.query(queryText, values);
      
      return result.rows[0]; // Renvoie l'utilisateur mis à jour ou undefined si l'ID n'existe pas
    } catch (error) {
      console.error("Erreur dans UserModel.updateRole :", error);
      throw error;
    }
  }
};