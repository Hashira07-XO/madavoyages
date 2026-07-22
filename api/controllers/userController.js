import { UserModel } from '../models/UserModel.js';

const ROLES_VALIDES = ['client', 'admin', 'banni'];

const userController = {
  apiGetAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      res.status(500).json({ success: false, error: "Impossible de charger les utilisateurs." });
    }
  },

  apiUpdateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !ROLES_VALIDES.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Le champ 'role' est requis et doit être l'un de : ${ROLES_VALIDES.join(', ')}.`
        });
      }

      if (parseInt(id, 10) === req.user.id && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: "Vous ne pouvez pas modifier votre propre rôle administrateur."
        });
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
