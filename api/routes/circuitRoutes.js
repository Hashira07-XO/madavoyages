import express from 'express';
import multer from 'multer';
import circuitController from '../controllers/circuitController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 Mo max
  }
});

/* ==========================================================================
   ROUTES API (Montées sur "/api/circuits" via index.js)
   ========================================================================== */

// GET /api/circuits -> Circuits ACTIFS uniquement (Public)
// On force query.all à 'false' pour empêcher un accès anonyme aux circuits masqués
router.get('/', (req, res, next) => {
  req.query.all = 'false';
  next();
}, circuitController.apiGetAllCircuits);

// GET /api/circuits/admin/all -> TOUS les circuits, y compris masqués (Admin uniquement)
router.get('/admin/all', verifyToken, requireAdmin, (req, res, next) => {
  req.query.all = 'true';
  next();
}, circuitController.apiGetAllCircuits);

// GET /api/circuits/:id -> Un circuit spécifique (Public)
router.get('/:id', circuitController.apiGetCircuitById);

// POST /api/circuits -> Créer un circuit (Admin uniquement)
router.post('/', verifyToken, requireAdmin, upload.single('image'), circuitController.apiCreateCircuit);

// PUT /api/circuits/:id -> Modifier un circuit (Admin uniquement)
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), circuitController.apiUpdateCircuit);

// DELETE /api/circuits/:id -> Supprimer un circuit (Admin uniquement)
router.delete('/:id', verifyToken, requireAdmin, circuitController.apiDeleteCircuit);

export default router;