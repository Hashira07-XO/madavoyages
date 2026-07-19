import express from 'express';
import multer from 'multer';
import circuitController from '../controllers/circuitController.js';

const router = express.Router();

// Configuration de Multer : stockage en mémoire pour Vercel
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5 Mo max
  }
});

/* ==========================================================================
   ROUTES API (Montées sur "/api/circuits" via index.js)
   ========================================================================== */

// GET /api/circuits -> Récupérer tous les circuits
router.get('/', circuitController.apiGetAllCircuits);

// GET /api/circuits/:id -> Obtenir un circuit spécifique
router.get('/:id', circuitController.apiGetCircuitById);

// POST /api/circuits -> Ajouter un circuit avec son image
router.post('/', upload.single('image'), circuitController.apiCreateCircuit);

// PUT /api/circuits/:id -> Modifier un circuit
router.put('/:id', upload.single('image'), circuitController.apiUpdateCircuit);

// DELETE /api/circuits/:id -> Supprimer un circuit
router.delete('/:id', circuitController.apiDeleteCircuit);

export default router;