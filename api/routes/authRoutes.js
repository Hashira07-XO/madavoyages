import express from 'express';
import { register, login, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

// Vos routes existantes (POST)
router.post('/register', register);
router.post('/login', login);

// LA CORRECTION : Cette route DOIT être un GET !
router.get('/verify/:token', verifyEmail);

export default router;