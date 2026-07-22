import db from '../config/db.js';

const Reservation = {
  findByIdAndUser: async (id, user_id) => {
    try {
      const { rows } = await db.query(
        'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
        [id, user_id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error(`Erreur de base de données (findByIdAndUser ID ${id}) :`, error);
      throw error;
    }
  },

  getReservedSeats: async (circuit_id) => {
    try {
      const sql = "SELECT places_choisies FROM reservations WHERE circuit_id = $1 AND statut != 'annule'";
      const { rows } = await db.query(sql, [circuit_id]);
      return rows.flatMap(r => r.places_choisies);
    } catch (error) {
      console.error(`Erreur de base de données (getReservedSeats Circuit ${circuit_id}) :`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const sql = `
        INSERT INTO reservations (
          user_id, circuit_id, nombre_personnes,
          places_choisies, remarques, statut, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING *;
      `;

      const params = [
        data.user_id,
        data.circuit_id,
        data.nombre_personnes,
        data.places_choisies,
        data.remarques || null,
        data.statut || 'en_attente'
      ];

      const { rows } = await db.query(sql, params);
      return rows[0];
    } catch (error) {
      console.error("Erreur de base de données (create reservation) :", error);
      throw error;
    }
  },

  getHistoryByUserId: async (user_id) => {
    try {
      const sql = `
        SELECT r.*,
               c.title AS circuit_title,
               c.price AS circuit_price,
               c.price_ariary AS circuit_price_ariary,
               c.image_url AS circuit_image_url,
               c.date_debut_voyage,
               c.date_fin_voyage
        FROM reservations r
        JOIN circuits c ON r.circuit_id = c.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC;
      `;
      const { rows } = await db.query(sql, [user_id]);
      return rows;
    } catch (error) {
      console.error(`Erreur de base de données (getHistoryByUserId User ${user_id}) :`, error);
      throw error;
    }
  },

  updateStatus: async (id, statut) => {
    try {
      const sql = `UPDATE reservations SET statut = $1 WHERE id = $2 RETURNING *;`;
      const { rows } = await db.query(sql, [statut, id]);
      return rows[0];
    } catch (error) {
      console.error(`Erreur de base de données (updateStatus ID ${id}) :`, error);
      throw error;
    }
  },

  getAllGlobal: async () => {
    try {
      const sql = `
        SELECT r.*,
               u.nom AS user_nom,
               u.prenom AS user_prenom,
               u.email AS user_email,
               c.title AS circuit_title,
               c.price AS circuit_price,
               c.price_ariary AS circuit_price_ariary,
               c.date_debut_voyage
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN circuits c ON r.circuit_id = c.id
        ORDER BY r.created_at DESC;
      `;
      const { rows } = await db.query(sql);
      return rows;
    } catch (error) {
      console.error("Erreur de base de données (getAllGlobal) :", error);
      throw error;
    }
  }
};

export default Reservation;
