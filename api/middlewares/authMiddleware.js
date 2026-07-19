// api/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Récupérer le token depuis le header Authorization (converti par Express en minuscules)
  const authHeader = req.headers['authorization'];
  
  // Sécurité : Vérifie la présence du header et le préfixe standardisé Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  // Extraction du jeton cryptographique
  const token = authHeader.split(' ')[1];

  try {
    // Authentification via le secret d'environnement
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attache le payload { id, role } à l'objet de requête global
    req.user = decoded; 
    
    next();
  } catch (error) {
    console.error("Échec de la validation du JWT :", error.message);
    return res.status(403).json({ message: "Token invalide ou expiré." });
  }
};