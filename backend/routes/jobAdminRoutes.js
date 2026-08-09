const express = require("express");

const {
  getAdminJobs,
  updateJobStatus,
  deleteAdminJob,
} = require("../controllers/jobAdminController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// ======================================================
// Toutes les routes nécessitent un compte administrateur
// ======================================================

// Récupérer toutes les offres
router.get(
  "/",
  protect,
  authorize("admin"),
  getAdminJobs
);

// Modifier le statut d'une offre
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateJobStatus
);

// Supprimer une offre
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteAdminJob
);

module.exports = router;