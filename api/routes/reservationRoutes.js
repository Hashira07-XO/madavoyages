// routes/reservationRoutes.js
import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/reservations', ReservationController.renderReservationPage);
router.post('/api/reservations', verifyToken, ReservationController.createReservation);
router.get('/api/reservations/mon-historique', verifyToken, ReservationController.getUserHistory);
router.get('/api/reservations/admin-flux', verifyToken, requireAdmin, ReservationController.getAllReservationsForAdmin);

router.put('/api/reservations/:id/statut-admin', verifyToken, requireAdmin, ReservationController.updateReservationStatusByAdmin);
router.put('/api/reservations/:id/annuler', verifyToken, ReservationController.cancelReservation);

export default router;