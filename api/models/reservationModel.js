import db from '../config/db.js';

const Reservation = {
  /**
   * Récupère une réservation par son ID et l'ID de son utilisateur
   * @param {number} id - ID de la réservation
   * @param {number} user_id - ID de l'utilisateur
   */
  findByIdAndUser: async (id, user_id) => {
    try {
      const sql = 'SELECT * FROM reservations WHERE id = $1 AND user_id = $2';
      const { rows } = await db.query(sql, [id, user_id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Erreur de base de données (findByIdAndUser ID ${id}) :`, error);
      throw error;
    }
  },

  /**
   * Récupère toutes les places réservées pour un circuit spécifique
   * Utile pour bloquer dynamiquement les sièges déjà pris dans l'interface utilisateur
   * @param {number} circuit_id - ID du circuit
   */
  getReservedSeats: async (circuit_id) => {
    try {
      const sql = "SELECT places_choisies FROM reservations WHERE circuit_id = $1 AND statut != 'annule'";
      const { rows } = await db.query(sql, [circuit_id]);
      
      // On aplatit les tableaux de sièges de chaque réservation en un unique tableau d'entiers
      return rows.flatMap(r => r.places_choisies);
    } catch (error) {
      console.error(`Erreur de base de données (getReservedSeats Circuit ${circuit_id}) :`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle réservation en base de données
   * @param {Object} data - Données de la réservation
   */
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
        data.places_choisies, // node-postgres convertit automatiquement le tableau JS [1, 2] en tableau PostgreSQL {1,2}
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

  /**
   * Récupère l'historique complet des réservations d'un utilisateur
   * Effectue une jointure pour récupérer les informations clés du circuit réservé
   * @param {number} user_id - ID de l'utilisateur
   */
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

  /**
   * Met à jour le statut d'une réservation (validation ou annulation)
   * @param {number} id - ID de la réservation
   * @param {string} statut - Le nouveau statut ('en_attente', 'valide', 'annule')
   */
  updateStatus: async (id, statut) => {
    try {
      const sql = `
        UPDATE reservations 
        SET statut = $1 
        WHERE id = $2 
        RETURNING *;
      `;

      const { rows } = await db.query(sql, [statut, id]);
      return rows[0];
    } catch (error) {
      console.error(`Erreur de base de données (updateStatus ID ${id}) :`, error);
      throw error;
    }
  }
};

export default Reservation;