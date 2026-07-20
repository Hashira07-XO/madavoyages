// routes/reservationRoutes.js
import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Route pour rendre la page EJS de réservation
router.get('/reservations', ReservationController.renderReservationPage);

/* ==========================================================================
   ROUTES API (Montées sur "/" via index.js -> URL réelles commencent par /api)
   ========================================================================== */

// --- ROUTES STATIQUES (Sans :id - Toujours en premier) ---
router.post('/api/reservations', verifyToken, ReservationController.createReservation);
router.get('/api/reservations/mon-historique', verifyToken, ReservationController.getUserHistory);
router.get('/api/reservations/admin-flux', verifyToken, requireAdmin, ReservationController.getAllReservationsForAdmin);

// --- ROUTES DYNAMIQUES (Avec :id - En dernier) ---
router.put('/api/reservations/:id/statut-admin', verifyToken, requireAdmin, ReservationController.updateReservationStatusByAdmin);
router.put('/api/reservations/:id/annuler', verifyToken, ReservationController.cancelReservation);

export default router;