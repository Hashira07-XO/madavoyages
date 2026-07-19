// routes/reservationRoutes.js
import express from 'express';
import ReservationController from '../controllers/reservationController.js';
// Importe ton middleware d'authentification pour sécuriser l'API
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// 1. Route pour rendre la page EJS de réservation
router.get('/reservations', ReservationController.renderReservationPage);

// 2. Routes API de gestion des réservations (protégées par token)
router.post('/api/reservations', verifyToken, ReservationController.createReservation);
router.get('/api/reservations/mon-historique', verifyToken, ReservationController.getUserHistory);
router.put('/api/reservations/:id/annuler', verifyToken, ReservationController.cancelReservation);

export default router;