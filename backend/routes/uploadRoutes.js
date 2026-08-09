const express = require("express");

const {
  uploadCandidateCv,
  uploadUserProfileImage,
  uploadLogo,
} = require("../controllers/uploadController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const {
  uploadCv,
  uploadProfileImage,
  uploadCompanyLogo,
} = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/cv",
  protect,
  authorize("candidate"),
  uploadCv.single("cv"),
  uploadCandidateCv
);

router.post(
  "/profile-image",
  protect,
  uploadProfileImage.single("profileImage"),
  uploadUserProfileImage
);

router.post(
  "/company-logo",
  protect,
  authorize("company"),
  uploadCompanyLogo.single("logo"),
  uploadLogo
);

module.exports = router;