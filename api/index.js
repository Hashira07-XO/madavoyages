import express from 'express';
import 'dotenv/config'; 
import cors from 'cors'; 
import path from 'path';
import { fileURLToPath } from 'url';

// Importation des routes
import authRoutes from './routes/authRoutes.js';
import circuitRoutes from './routes/circuitRoutes.js'; 
import circuitController from './controllers/circuitController.js'; 
import reservationRoutes from './routes/reservationRoutes.js'; 
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public'))); 

app.get('/circuits', circuitController.renderCircuitsPage);

app.use('/api/circuits', circuitRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/', reservationRoutes); 

export default app;