const express = require("express");

const {
  getCompanyDashboard,
  getCompanyJobs,
} = require("../controllers/companyDashboardController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/company/dashboard
// Statistiques de l'entreprise connectée
// =====================================================
router.get(
  "/dashboard",
  protect,
  authorize("company"),
  getCompanyDashboard
);

// =====================================================
// GET /api/company/jobs
// Offres publiées par l'entreprise connectée
// =====================================================
router.get(
  "/jobs",
  protect,
  authorize("company"),
  getCompanyJobs
);

module.exports = router;