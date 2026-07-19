import Circuit from '../models/circuitModel.js'; 
import { put } from '@vercel/blob'; 

const circuitController = {
  /**
   * Rendu de la page publique des circuits via EJS
   */
  renderCircuitsPage: async (req, res) => {
    try {
      // Récupération des circuits actifs uniquement pour le catalogue public[cite: 10]
      const rawVoyages = await Circuit.getAll(true); 

      // On formate les voyages pour s'assurer que 'image_url' a toujours une valeur exploitable
      const voyages = rawVoyages.map(v => ({
        ...v,
        // Si image_url est null, vide ou n'existe pas, on applique une image par défaut
        image_url: (v.image_url && v.image_url.trim() !== "") 
          ? v.image_url 
          : '/assets/baobab3.webp'
      }));

      res.render('circuits', { voyages }); 
    } catch (error) {
      console.error('Erreur de rendu de la page circuits :', error); 
      res.status(500).render('error', { message: 'Une erreur est survenue lors du chargement des évasions.' });
    }
  },

  /**
   * API : Créer un nouveau circuit avec téléversement d'image sur Vercel Blob[cite: 10]
   */
  apiCreateCircuit: async (req, res) => {
    try {
      const { 
        title, 
        description, 
        price, 
        capacity, 
        price_ariary, 
        type_transport, 
        date_debut_voyage, 
        date_fin_voyage, 
        date_fin_reservation 
      } = req.body; 

      // Validation des champs requis "NOT NULL"[cite: 10]
      if (!title || !description || !price || !capacity || !price_ariary) { 
        return res.status(400).json({ 
          success: false, 
          message: 'Champs obligatoires manquants : title, description, price, capacity, price_ariary.' 
        }); 
      }

      // Par défaut, si aucune image n'est envoyée, on applique l'image de secours
      let imageUrl = '/assets/baobab3.webp'; 

      if (req.file) { 
        const blobName = `circuits/${Date.now()}-${req.file.originalname}`; 
        const blob = await put(blobName, req.file.buffer, { 
          access: 'public', 
        }); 
        imageUrl = blob.url; 
      }

      // Nettoyage et formatage des dates / chaînes vides[cite: 10]
      const circuitData = {
        title,
        description,
        price,
        capacity,
        price_ariary,
        image_url: imageUrl,
        type_transport: type_transport?.trim() !== "" ? type_transport : null,
        date_debut_voyage: date_debut_voyage?.trim() !== "" ? date_debut_voyage : null,
        date_fin_voyage: date_fin_voyage?.trim() !== "" ? date_fin_voyage : null,
        date_fin_reservation: date_fin_reservation?.trim() !== "" ? date_fin_reservation : null,
        actif: req.body.actif !== undefined ? (req.body.actif === 'true' || req.body.actif === true) : true 
      }; 

      const newCircuit = await Circuit.create(circuitData); 
      res.status(201).json({ success: true, data: newCircuit }); 
    } catch (error) {
      console.error("Erreur lors de la création du circuit :", error); 
      res.status(500).json({ success: false, error: error.message }); 
    }
  },

  /**
   * API : Mettre à jour un circuit (avec remplacement d'image optionnel)[cite: 10]
   */
  apiUpdateCircuit: async (req, res) => {
    try {
      const id = req.params.id; 
      const currentCircuit = await Circuit.getById(id); 

      if (!currentCircuit) { 
        return res.status(404).json({ success: false, message: 'Circuit introuvable.' }); 
      }

      let imageUrl = currentCircuit.image_url || '/assets/baobab3.webp'; 

      if (req.file) { 
        const blobName = `circuits/${Date.now()}-${req.file.originalname}`; 
        const blob = await put(blobName, req.file.buffer, { access: 'public' }); 
        imageUrl = blob.url; 
      }

      const { 
        title, 
        description, 
        price, 
        capacity, 
        price_ariary, 
        type_transport, 
        date_debut_voyage, 
        date_fin_voyage, 
        date_fin_reservation 
      } = req.body;

      const circuitData = {
        title: title || currentCircuit.title,
        description: description || currentCircuit.description,
        price: price || currentCircuit.price,
        capacity: capacity || currentCircuit.capacity,
        price_ariary: price_ariary || currentCircuit.price_ariary,
        image_url: imageUrl,
        type_transport: type_transport !== undefined ? (type_transport?.trim() !== "" ? type_transport : null) : currentCircuit.type_transport,
        date_debut_voyage: date_debut_voyage !== undefined ? (date_debut_voyage?.trim() !== "" ? date_debut_voyage : null) : currentCircuit.date_debut_voyage,
        date_fin_voyage: date_fin_voyage !== undefined ? (date_fin_voyage?.trim() !== "" ? date_fin_voyage : null) : currentCircuit.date_fin_voyage,
        date_fin_reservation: date_fin_reservation !== undefined ? (date_fin_reservation?.trim() !== "" ? date_fin_reservation : null) : currentCircuit.date_fin_reservation,
        actif: req.body.actif !== undefined ? (req.body.actif === 'true' || req.body.actif === true) : currentCircuit.actif 
      }; 

      const updated = await Circuit.update(id, circuitData); 
      res.json({ success: true, data: updated }); 
    } catch (error) {
      console.error("Erreur lors de la modification du circuit :", error); 
      res.status(500).json({ success: false, error: error.message }); 
    }
  },

  /**
   * API : Obtenir tous les circuits (JSON)[cite: 10]
   */
  apiGetAllCircuits: async (req, res) => {
    try {
      const showAll = req.query.all === 'true'; 
      const circuits = await Circuit.getAll(!showAll); 
      res.json({ success: true, data: circuits }); 
    } catch (error) {
      res.status(500).json({ success: false, error: error.message }); 
    }
  },

  /**
   * API : Obtenir un circuit par ID (JSON)[cite: 10]
   */
  apiGetCircuitById: async (req, res) => {
    try {
      const circuit = await Circuit.getById(req.params.id); 
      if (!circuit) { 
        return res.status(404).json({ success: false, message: 'Circuit introuvable.' }); 
      }
      res.json({ success: true, data: circuit }); 
    } catch (error) {
      res.status(500).json({ success: false, error: error.message }); 
    }
  },

  /**
   * API : Supprimer un circuit[cite: 10]
   */
  apiDeleteCircuit: async (req, res) => {
    try {
      const deleted = await Circuit.delete(req.params.id); 
      if (!deleted) { 
        return res.status(404).json({ success: false, message: 'Circuit introuvable.' }); 
      }
      res.json({ success: true, message: 'Circuit supprimé avec succès.', data: deleted }); 
    } catch (error) {
      res.status(500).json({ success: false, error: error.message }); 
    }
  }
};

export default circuitController;