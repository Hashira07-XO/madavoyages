import { pool } from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async create(nom, prenom, email, hashedPassword, verificationToken) {
    const queryText = `
      INSERT INTO users (nom, prenom, email, password_hash, role, is_verified, verification_token)
      VALUES ($1, $2, $3, $4, 'client', false, $5)
      RETURNING id, nom, prenom, email, role
    `;
    const values = [nom, prenom, email, hashedPassword, verificationToken];
    const result = await pool.query(queryText, values);
    return result.rows[0];
  },

  async verify(token) {
    const checkResult = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (checkResult.rows.length === 0) return null;

    const updateResult = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING *',
      [token]
    );
    return updateResult.rows[0];
  },

  async getAllUsers() {
    try {
      const queryText = 'SELECT id, nom, prenom, email, role, is_verified FROM users ORDER BY id ASC';
      const result = await pool.query(queryText);
      return result.rows;
    } catch (error) {
      console.error("Erreur dans UserModel.getAllUsers :", error);
      throw error;
    }
  },

  async updateRole(id, newRole) {
    try {
      const queryText = `
        UPDATE users SET role = $1 WHERE id = $2
        RETURNING id, nom, prenom, email, role
      `;
      const result = await pool.query(queryText, [newRole, id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erreur dans UserModel.updateRole :", error);
      throw error;
    }
  }
};