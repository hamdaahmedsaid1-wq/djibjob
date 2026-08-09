const express = require("express");

const {
  getAdminStats,
  getUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/admin/stats
// Statistiques générales
// =====================================================
router.get(
  "/stats",
  protect,
  authorize("admin"),
  getAdminStats
);

// =====================================================
// GET /api/admin/users
// Liste de tous les utilisateurs
// =====================================================
router.get(
  "/users",
  protect,
  authorize("admin"),
  getUsers
);

// =====================================================
// PUT /api/admin/users/:id/status
// Activer ou désactiver un utilisateur
// =====================================================
router.put(
  "/users/:id/status",
  protect,
  authorize("admin"),
  updateUserStatus
);

// =====================================================
// DELETE /api/admin/users/:id
// Supprimer un utilisateur
// =====================================================
router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;