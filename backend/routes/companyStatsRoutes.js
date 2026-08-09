const express = require("express");

const {
  getCompanyStats,
} = require("../controllers/companyStatsController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/company/stats
// Statistiques complètes de l'entreprise connectée
// =====================================================
router.get(
  "/",
  protect,
  authorize("company"),
  getCompanyStats
);

module.exports = router;