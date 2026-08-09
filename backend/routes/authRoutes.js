const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// POST /api/auth/register
// Inscription candidat ou entreprise
// =====================================================
router.post(
  "/register",
  register
);

// =====================================================
// POST /api/auth/login
// Connexion
// =====================================================
router.post(
  "/login",
  login
);

// =====================================================
// GET /api/auth/me
// Récupérer l'utilisateur connecté
// =====================================================
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;