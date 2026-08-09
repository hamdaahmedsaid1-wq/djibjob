const express = require("express");

const {
  getCompanies,
  getCompanyById,
  updateCompanyStatus,
  deleteCompany,
} = require("../controllers/companyAdminController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/admin/companies
// Liste de toutes les entreprises
// =====================================================
router.get(
  "/",
  protect,
  authorize("admin"),
  getCompanies
);

// =====================================================
// GET /api/admin/companies/:id
// Détail d'une entreprise
// =====================================================
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getCompanyById
);

// =====================================================
// PUT /api/admin/companies/:id/status
// Activer / désactiver une entreprise
// =====================================================
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateCompanyStatus
);

// =====================================================
// DELETE /api/admin/companies/:id
// Supprimer une entreprise
// =====================================================
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCompany
);

module.exports = router;