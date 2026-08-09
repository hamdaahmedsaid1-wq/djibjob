const express = require("express");

const {
  getAllJobs,
  getJobById,
  getCategories,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/jobs
// Liste publique des offres
// =====================================================
router.get(
  "/",
  getAllJobs
);

// =====================================================
// GET /api/jobs/categories
// Liste des catégories
//
// IMPORTANT : cette route doit être placée
// AVANT /:id sinon "categories" sera interprété
// comme un identifiant d'offre.
// =====================================================
router.get(
  "/categories",
  getCategories
);

// =====================================================
// GET /api/jobs/:id
// Détail d'une offre
// =====================================================
router.get(
  "/:id",
  getJobById
);

// =====================================================
// POST /api/jobs
// Publier une offre
// Réservé aux entreprises
// =====================================================
router.post(
  "/",
  protect,
  authorize("company"),
  createJob
);

// =====================================================
// PUT /api/jobs/:id
// Modifier une offre
// Entreprise propriétaire ou admin
// =====================================================
router.put(
  "/:id",
  protect,
  authorize("company", "admin"),
  updateJob
);

// =====================================================
// DELETE /api/jobs/:id
// Supprimer une offre
// Entreprise propriétaire ou admin
// =====================================================
router.delete(
  "/:id",
  protect,
  authorize("company", "admin"),
  deleteJob
);

module.exports = router;