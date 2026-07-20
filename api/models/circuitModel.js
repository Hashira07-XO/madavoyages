import db from '../config/db.js';

const Circuit = {
  getAll: async (onlyActive = true) => {
    try {
      let sql = 'SELECT * FROM circuits';
      const params = [];

      if (onlyActive) {
        sql += ' WHERE actif = $1';
        params.push(true);
      }

      sql += ' ORDER BY date_debut_voyage ASC NULLS LAST';

      const { rows } = await db.query(sql, params);
      return rows;
    } catch (error) {
      console.error("Erreur de base de données (getAll) :", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const { rows } = await db.query('SELECT * FROM circuits WHERE id = $1', [id]);
      return rows[0];
    } catch (error) {
      console.error(`Erreur de base de données (getById ID ${id}) :`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const sql = `
        INSERT INTO circuits (
          title, description, price, capacity, image_url,
          price_ariary, type_transport, date_debut_voyage,
          date_fin_voyage, date_fin_reservation, actif, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
        RETURNING *;
      `;

      const params = [
        data.title,
        data.description,
        data.price,
        data.capacity,
        data.image_url,
        data.price_ariary,
        data.type_transport,
        data.date_debut_voyage,
        data.date_fin_voyage,
        data.date_fin_reservation,
        data.actif
      ];

      const { rows } = await db.query(sql, params);
      return rows[0];
    } catch (error) {
      console.error("Erreur de base de données (create) :", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const sql = `
        UPDATE circuits
        SET
          title = $1, description = $2, price = $3, capacity = $4,
          image_url = $5, price_ariary = $6, type_transport = $7,
          date_debut_voyage = $8, date_fin_voyage = $9,
          date_fin_reservation = $10, actif = $11
        WHERE id = $12
        RETURNING *;
      `;

      const params = [
        data.title,
        data.description,
        data.price,
        data.capacity,
        data.image_url,
        data.price_ariary,
        data.type_transport,
        data.date_debut_voyage,
        data.date_fin_voyage,
        data.date_fin_reservation,
        data.actif,
        id
      ];

      const { rows } = await db.query(sql, params);
      return rows[0];
    } catch (error) {
      console.error(`Erreur de base de données (update ID ${id}) :`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { rows } = await db.query('DELETE FROM circuits WHERE id = $1 RETURNING *', [id]);
      return rows[0];
    } catch (error) {
      console.error(`Erreur de base de données (delete ID ${id}) :`, error);
      throw error;
    }
  }
};

export default Circuit;
