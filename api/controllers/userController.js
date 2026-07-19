import { UserModel } from '../models/UserModel.js';

const userController = {
  /**
   * API : Récupérer tous les utilisateurs (Pour le tableau de bord Admin)
   * GET /api/users
   */
  apiGetAllUsers: async (req, res) => {
    try {
      // Optionnel : Tu peux ajouter une sécurité ici pour vérifier si req.user.role === 'admin'
      const users = await UserModel.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      res.status(500).json({ success: false, error: "Impossible de charger les utilisateurs." });
    }
  },

  /**
   * API : Modifier le rôle d'un utilisateur (Changer les droits ou bannir)
   * PUT /api/users/:id/role
   */
  apiUpdateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body; // ex: { "role": "banni" } ou { "role": "admin" }

      if (!role) {
        return res.status(400).json({ success: false, message: "Le champ 'role' est requis." });
      }

      const updatedUser = await UserModel.updateRole(id, role);

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
      }

      res.status(200).json({ 
        success: true, 
        message: `Le rôle de l'utilisateur a été mis à jour avec succès vers '${role}'.`, 
        data: updatedUser 
      });
    } catch (error) {
      console.error("Erreur lors de la modification du rôle :", error);
      res.status(500).json({ success: false, error: "Erreur serveur lors de la mise à jour du rôle." });
    }
  }
};

export default userController;