const express = require("express");

const {
  getCompanyProfile,
  updateCompanyProfile,
} = require("../controllers/companyProfileController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/company/profile
// Récupérer le profil de l'entreprise connectée
// =====================================================
router.get(
  "/",
  protect,
  authorize("company"),
  getCompanyProfile
);

// =====================================================
// PUT /api/company/profile
// Modifier le profil de l'entreprise connectée
// =====================================================
router.put(
  "/",
  protect,
  authorize("company"),
  updateCompanyProfile
);

module.exports = router;