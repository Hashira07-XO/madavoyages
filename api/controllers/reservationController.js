// api/controllers/ReservationController.js
import Reservation from '../models/reservationModel.js';
import Circuit from '../models/circuitModel.js';

// ⚠️ PROVISOIRE : à aligner sur la contrainte réelle "reservations_statut_check".
// Confirmée jusqu'ici : 'en_attente'. Complète cette liste avec les valeurs
// exactes renvoyées par : SELECT pg_get_constraintdef(oid) FROM pg_constraint
// WHERE conname = 'reservations_statut_check';
const STATUTS_VALIDES = ['en_attente', 'confirme', 'annule'];

const ReservationController = {
  /**
   * 1. Affiche la page du formulaire de réservation (GET /reservations)
   */
  renderReservationPage: async (req, res) => {
    try {
      const { circuit_id } = req.query;

      if (!circuit_id) {
        return res.status(400).send("Aucun circuit n'a été sélectionné.");
      }

      const circuit = await Circuit.getById(circuit_id);

      if (!circuit) {
        return res.status(404).send("Le circuit demandé est introuvable.");
      }

      const siegesOccupes = await Reservation.getReservedSeats(circuit_id);

      res.render('reservation-form', {
        circuit,
        siegesOccupes: siegesOccupes || []
      });
    } catch (error) {
      console.error("Erreur (renderReservationPage) :", error);
      res.status(500).send("Une erreur interne est survenue.");
    }
  },

  /**
   * 2. Crée une nouvelle réservation (POST /api/reservations)
   */
  createReservation: async (req, res) => {
    try {
      const { circuit_id, nombre_personnes, places_choisies, remarques } = req.body;
      const user_id = req.user.id;

      if (!circuit_id || !nombre_personnes || !places_choisies) {
        return res.status(400).json({ message: "Champs obligatoires manquants." });
      }

      if (!Array.isArray(places_choisies) || places_choisies.length === 0) {
        return res.status(400).json({ message: "Le choix des sièges est requis." });
      }

      if (parseInt(nombre_personnes, 10) !== places_choisies.length) {
        return res.status(400).json({
          message: "Le nombre de personnes doit être égal au nombre de places choisies."
        });
      }

      const circuit = await Circuit.getById(circuit_id);
      if (!circuit) {
        return res.status(404).json({ message: "Circuit introuvable." });
      }

      const siegesPris = await Reservation.getReservedSeats(circuit_id);
      const siegesDoublons = places_choisies.map(Number).filter(siege => siegesPris.includes(siege));

      if (siegesDoublons.length > 0) {
        return res.status(400).json({
          message: `Désolé, les places suivantes viennent d'être réservées : ${siegesDoublons.join(', ')}`
        });
      }

      const nouvelleReservation = await Reservation.create({
        user_id,
        circuit_id,
        nombre_personnes: parseInt(nombre_personnes, 10),
        places_choisies: places_choisies.map(Number),
        remarques: remarques || null,
        statut: 'en_attente'
      });

      return res.status(201).json({
        message: "Votre réservation a été enregistrée avec succès !",
        reservation: nouvelleReservation
      });
    } catch (error) {
      console.error("Erreur (createReservation) :", error);
      res.status(500).json({ message: "Erreur lors de l'enregistrement de la réservation." });
    }
  },

  /**
   * 3. Récupère l'historique de voyage de l'utilisateur connecté
   */
  getUserHistory: async (req, res) => {
    try {
      const user_id = req.user.id;
      const reservations = await Reservation.getHistoryByUserId(user_id);
      res.status(200).json(reservations);
    } catch (error) {
      console.error("Erreur (getUserHistory) :", error);
      res.status(500).json({ message: "Impossible de charger votre historique de voyage." });
    }
  },

  /**
   * 4. Annule une réservation (PUT /api/reservations/:id/annuler)
   */
  cancelReservation: async (req, res) => {
    try {
      const reservationId = req.params.id;
      const user_id = req.user.id;

      const reservation = await Reservation.findByIdAndUser(reservationId, user_id);

      if (!reservation) {
        return res.status(404).json({ message: "Réservation introuvable ou non autorisée." });
      }

      if (reservation.statut !== 'en_attente') {
        return res.status(400).json({ message: "Cette réservation ne peut plus être annulée ou modifiée." });
      }

      const reservationAnnulee = await Reservation.updateStatus(reservationId, 'annule');

      res.status(200).json({
        message: "Votre réservation a été annulée avec succès.",
        reservation: reservationAnnulee
      });
    } catch (error) {
      console.error("Erreur (cancelReservation) :", error);
      res.status(500).json({ message: "Une erreur est survenue lors de l'annulation." });
    }
  },

  /**
   * 5. API ADMIN : Récupérer TOUTES les réservations du site
   * (route protégée par verifyToken + requireAdmin)
   */
  getAllReservationsForAdmin: async (req, res) => {
    try {
      const reservations = await Reservation.getAllGlobal();
      return res.status(200).json(reservations);
    } catch (error) {
      console.error("Erreur (getAllReservationsForAdmin) :", error);
      res.status(500).json({ message: "Erreur lors du chargement du flux global." });
    }
  },

  /**
   * 6. API ADMIN : Muter le statut d'une réservation
   * (route protégée par verifyToken + requireAdmin)
   */
  updateReservationStatusByAdmin: async (req, res) => {
    try {
      const reservationId = req.params.id;
      const { statut } = req.body;

      if (!statut || !STATUTS_VALIDES.includes(statut)) {
        return res.status(400).json({
          message: `Le statut cible est requis et doit être l'un de : ${STATUTS_VALIDES.join(', ')}.`
        });
      }

      const reservationModifiee = await Reservation.updateStatus(reservationId, statut);

      if (!reservationModifiee) {
        return res.status(404).json({ message: "Réservation introuvable." });
      }

      return res.status(200).json({
        message: "Statut mis à jour par l'administrateur.",
        reservation: reservationModifiee
      });
    } catch (error) {
      console.error("Erreur (updateReservationStatusByAdmin) :", error);
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour du dossier." });
    }
  }
};

export default ReservationController;
