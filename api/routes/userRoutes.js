import express from 'express';
import userController from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; // Ton middleware JWT existant

const router = express.Router();

// Routes protégées par token (idéalement à coupler avec une vérification du rôle Admin)
router.get('/', verifyToken, userController.apiGetAllUsers);
router.put('/:id/role', verifyToken, userController.apiUpdateUserRole);

export default router;