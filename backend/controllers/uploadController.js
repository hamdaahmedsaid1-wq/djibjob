const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

function deleteOldFile(relativeFilePath) {
  if (!relativeFilePath) {
    return;
  }

  const absolutePath = path.join(
    __dirname,
    "..",
    relativeFilePath
  );

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

// POST /api/uploads/cv
async function uploadCandidateCv(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Aucun CV n’a été envoyé.",
    });
  }

  const newFilePath = `uploads/cvs/${req.file.filename}`;

  try {
    const [profiles] = await pool.execute(
      `
      SELECT id, cv
      FROM candidate_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (profiles.length === 0) {
      deleteOldFile(newFilePath);

      return res.status(404).json({
        success: false,
        message: "Profil candidat introuvable.",
      });
    }

    const oldCv = profiles[0].cv;

    await pool.execute(
      `
      UPDATE candidate_profiles
      SET cv = ?
      WHERE user_id = ?
      `,
      [newFilePath, req.user.id]
    );

    deleteOldFile(oldCv);

    return res.status(200).json({
      success: true,
      message: "CV ajouté avec succès.",
      cv: newFilePath,
    });
  } catch (error) {
    deleteOldFile(newFilePath);

    console.error("Erreur d’upload du CV :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible d’enregistrer le CV.",
    });
  }
}

// POST /api/uploads/profile-image
async function uploadUserProfileImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Aucune image n’a été envoyée.",
    });
  }

  const newFilePath = `uploads/profiles/${req.file.filename}`;

  try {
    const [users] = await pool.execute(
      `
      SELECT profile_image
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      deleteOldFile(newFilePath);

      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const oldImage = users[0].profile_image;

    await pool.execute(
      `
      UPDATE users
      SET profile_image = ?
      WHERE id = ?
      `,
      [newFilePath, req.user.id]
    );

    deleteOldFile(oldImage);

    return res.status(200).json({
      success: true,
      message: "Photo de profil ajoutée avec succès.",
      profileImage: newFilePath,
    });
  } catch (error) {
    deleteOldFile(newFilePath);

    console.error(
      "Erreur d’upload de la photo de profil :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible d’enregistrer la photo de profil.",
    });
  }
}

// POST /api/uploads/company-logo
async function uploadLogo(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Aucun logo n’a été envoyé.",
    });
  }

  const newFilePath = `uploads/logos/${req.file.filename}`;

  try {
    const [companies] = await pool.execute(
      `
      SELECT id, logo
      FROM companies
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (companies.length === 0) {
      deleteOldFile(newFilePath);

      return res.status(404).json({
        success: false,
        message: "Profil entreprise introuvable.",
      });
    }

    const oldLogo = companies[0].logo;

    await pool.execute(
      `
      UPDATE companies
      SET logo = ?
      WHERE user_id = ?
      `,
      [newFilePath, req.user.id]
    );

    deleteOldFile(oldLogo);

    return res.status(200).json({
      success: true,
      message: "Logo ajouté avec succès.",
      logo: newFilePath,
    });
  } catch (error) {
    deleteOldFile(newFilePath);

    console.error("Erreur d’upload du logo :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible d’enregistrer le logo.",
    });
  }
}

module.exports = {
  uploadCandidateCv,
  uploadUserProfileImage,
  uploadLogo,
};