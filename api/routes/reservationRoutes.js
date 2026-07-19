// routes/reservationRoutes.js
import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// 1. Route pour rendre la page EJS de réservation
router.get('/reservations', ReservationController.renderReservationPage);

// 2. Routes API existantes
router.post('/api/reservations', verifyToken, ReservationController.createReservation);
router.get('/api/reservations/mon-historique', verifyToken, ReservationController.getUserHistory);
router.put('/api/reservations/:id/annuler', verifyToken, ReservationController.cancelReservation);

// ==========================================
// 3. AJOUTE CES DEUX ROUTES POUR TON ADMIN.HTML :
// ==========================================

// Attention au préfixe : si ton routeur est déjà monté sur "/api", retire le "/api" devant.
router.get('/api/reservations/admin-flux', verifyToken, ReservationController.getAllReservationsForAdmin); 
router.put('/api/reservations/:id/statut-admin', verifyToken, ReservationController.updateReservationStatusByAdmin);

export default router;