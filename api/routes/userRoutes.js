import express from 'express';
import userController from '../controllers/userController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, userController.apiGetAllUsers);
router.put('/:id/role', verifyToken, requireAdmin, userController.apiUpdateUserRole);

export default router;