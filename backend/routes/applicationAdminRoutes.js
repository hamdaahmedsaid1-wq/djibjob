const express = require("express");

const {
  getAdminApplications,
  updateAdminApplicationStatus,
  deleteAdminApplication,
} = require("../controllers/applicationAdminController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/admin/applications
// Récupérer toutes les candidatures
// =====================================================
router.get(
  "/",
  protect,
  authorize("admin"),
  getAdminApplications
);

// =====================================================
// PUT /api/admin/applications/:id/status
// Modifier le statut d'une candidature
// =====================================================
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateAdminApplicationStatus
);

// =====================================================
// DELETE /api/admin/applications/:id
// Supprimer une candidature
// =====================================================
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteAdminApplication
);

module.exports = router;