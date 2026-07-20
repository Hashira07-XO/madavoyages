import Circuit from '../models/circuitModel.js';
import { put } from '@vercel/blob';

const circuitController = {
  /**
   * Rendu de la page publique des circuits via EJS
   */
  renderCircuitsPage: async (req, res) => {
    try {
      const rawVoyages = await Circuit.getAll(true);

      const voyages = rawVoyages.map(v => ({
        ...v,
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
   * API : Créer un nouveau circuit avec téléversement d'image sur Vercel Blob
   * (route protégée par verifyToken + requireAdmin)
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

      // Validation des champs NOT NULL en base : on vérifie l'absence réelle,
      // pas la "falsy-ness", pour ne pas rejeter un 0 légitime
      if (
        title === undefined || title === "" ||
        description === undefined || description === "" ||
        price === undefined ||
        capacity === undefined ||
        price_ariary === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: 'Champs obligatoires manquants : title, description, price, capacity, price_ariary.'
        });
      }

      let imageUrl = '/assets/baobab3.webp';

      if (req.file) {
        const blobName = `circuits/${Date.now()}-${req.file.originalname}`;
        const blob = await put(blobName, req.file.buffer, { access: 'public' });
        imageUrl = blob.url;
      }

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
   * API : Mettre à jour un circuit (avec remplacement d'image optionnel)
   * (route protégée par verifyToken + requireAdmin)
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

      // Fix : on teste "!== undefined" au lieu de "||" pour ne pas écraser
      // silencieusement un 0 (price, capacity) par l'ancienne valeur
      const circuitData = {
        title: title !== undefined ? title : currentCircuit.title,
        description: description !== undefined ? description : currentCircuit.description,
        price: price !== undefined ? price : currentCircuit.price,
        capacity: capacity !== undefined ? capacity : currentCircuit.capacity,
        price_ariary: price_ariary !== undefined ? price_ariary : currentCircuit.price_ariary,
        image_url: imageUrl,
        type_transport: type_transport !== undefined
          ? (type_transport?.trim() !== "" ? type_transport : null)
          : currentCircuit.type_transport,
        date_debut_voyage: date_debut_voyage !== undefined
          ? (date_debut_voyage?.trim() !== "" ? date_debut_voyage : null)
          : currentCircuit.date_debut_voyage,
        date_fin_voyage: date_fin_voyage !== undefined
          ? (date_fin_voyage?.trim() !== "" ? date_fin_voyage : null)
          : currentCircuit.date_fin_voyage,
        date_fin_reservation: date_fin_reservation !== undefined
          ? (date_fin_reservation?.trim() !== "" ? date_fin_reservation : null)
          : currentCircuit.date_fin_reservation,
        actif: req.body.actif !== undefined
          ? (req.body.actif === 'true' || req.body.actif === true)
          : currentCircuit.actif
      };

      const updated = await Circuit.update(id, circuitData);
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Erreur lors de la modification du circuit :", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * API : Obtenir tous les circuits (JSON) — Public (toujours actif=true,
   * voir circuitRoutes.js qui force req.query.all='false' sur cette route)
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
   * API : Obtenir un circuit par ID (JSON) — Public
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
   * API : Supprimer un circuit (route protégée par verifyToken + requireAdmin)
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
