const express = require("express");

const {
  createApplication,
  getCandidateApplications,
  getCompanyApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// POST /api/applications
// Envoyer une candidature
// Réservé aux candidats
// =====================================================
router.post(
  "/",
  protect,
  authorize("candidate"),
  createApplication
);

// =====================================================
// GET /api/applications/candidate
// Voir les candidatures du candidat connecté
// =====================================================
router.get(
  "/candidate",
  protect,
  authorize("candidate"),
  getCandidateApplications
);

// =====================================================
// GET /api/applications/company
// Voir les candidatures reçues par l'entreprise
// =====================================================
router.get(
  "/company",
  protect,
  authorize("company"),
  getCompanyApplications
);

// =====================================================
// PUT /api/applications/:id/status
// Accepter / refuser / consulter une candidature
// Entreprise propriétaire ou administrateur
// =====================================================
router.put(
  "/:id/status",
  protect,
  authorize("company", "admin"),
  updateApplicationStatus
);

// =====================================================
// DELETE /api/applications/:id
// Retirer sa candidature
// Réservé au candidat
// =====================================================
router.delete(
  "/:id",
  protect,
  authorize("candidate"),
  deleteApplication
);

module.exports = router;