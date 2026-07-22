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

router.get('/', (req, res, next) => {
  req.query.all = 'false';
  next();
}, circuitController.apiGetAllCircuits);

router.get('/admin/all', verifyToken, requireAdmin, (req, res, next) => {
  req.query.all = 'true';
  next();
}, circuitController.apiGetAllCircuits);

router.get('/:id', circuitController.apiGetCircuitById);
router.post('/', verifyToken, requireAdmin, upload.single('image'), circuitController.apiCreateCircuit);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), circuitController.apiUpdateCircuit);
router.delete('/:id', verifyToken, requireAdmin, circuitController.apiDeleteCircuit);

export default router;