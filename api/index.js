import express from 'express';
import 'dotenv/config'; // Charge les variables d'environnement
import cors from 'cors'; 
import path from 'path';
import { fileURLToPath } from 'url';

// Importation des routes existantes
import authRoutes from './routes/authRoutes.js';
import circuitRoutes from './routes/circuitRoutes.js'; 
import circuitController from './controllers/circuitController.js'; 

// Importation des nouvelles routes de réservation
import reservationRoutes from './routes/reservationRoutes.js'; 

// Recréer l'équivalent de __dirname pour l'ES Modules (index.js est dans /api)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Autoriser les requêtes cross-origin et analyser les requêtes entrantes
app.use(cors()); 
app.use(express.json());
// Permet de lire les données envoyées par les formulaires HTML classiques (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true })); 

/* ==========================================================================
   CONFIGURATION DU MOTEUR DE RENDU (EJS & STATIQUES)
   ========================================================================== */

// Configurer EJS : 'views' est au même niveau que 'index.js' dans '/api'
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques : 'public' est à la racine, donc un niveau au-dessus de '/api'
app.use(express.static(path.join(__dirname, '../public'))); 


/* ==========================================================================
   ROUTE DE RENDU DE PAGE (FRONTEND / EJS)
   ========================================================================== */

// GET /circuits -> Rend la page Espace Voyageur (circuits.ejs)
app.get('/circuits', circuitController.renderCircuitsPage);


/* ==========================================================================
   ROUTES DE L'API REST & RÉSERVATIONS
   ========================================================================== */
app.use('/api/circuits', circuitRoutes);
app.use('/api/auth', authRoutes);

// Utilisation des routes de réservation (gère à la fois le GET /reservations et les endpoints d'API)
app.use('/', reservationRoutes); 

export default app;