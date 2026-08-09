const express = require("express");

const {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
} = require("../controllers/userController");

const {
  protect,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);

router.delete(
  "/account",
  protect,
  deactivateAccount
);

module.exports = router;