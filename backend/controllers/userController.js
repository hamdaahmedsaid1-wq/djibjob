const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

// =====================================================
// GET /api/users/profile
// Consulter le profil de l'utilisateur connecté
// =====================================================
async function getProfile(req, res) {
  try {
    const [users] = await pool.execute(
      `
      SELECT
        id,
        name,
        email,
        phone,
        role,
        profile_image,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const user = users[0];

    let profile = null;

    if (user.role === "candidate") {
      const [candidateProfiles] = await pool.execute(
        `
        SELECT
          id,
          professional_title,
          description,
          skills,
          education,
          experience,
          city,
          cv,
          created_at,
          updated_at
        FROM candidate_profiles
        WHERE user_id = ?
        LIMIT 1
        `,
        [user.id]
      );

      profile = candidateProfiles[0] || null;
    }

    if (user.role === "company") {
      const [companies] = await pool.execute(
        `
        SELECT
          id,
          company_name,
          sector,
          description,
          address,
          website,
          logo,
          created_at,
          updated_at
        FROM companies
        WHERE user_id = ?
        LIMIT 1
        `,
        [user.id]
      );

      profile = companies[0] || null;
    }

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    console.error("Erreur de récupération du profil :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer le profil.",
    });
  }
}

// =====================================================
// PUT /api/users/profile
// Modifier les informations générales
// =====================================================
async function updateProfile(req, res) {
  const {
    name,
    phone,
    professionalTitle,
    description,
    skills,
    education,
    experience,
    city,
    companyName,
    sector,
    address,
    website,
  } = req.body;

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [users] = await connection.execute(
      `
      SELECT id, role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const user = users[0];

    await connection.execute(
      `
      UPDATE users
      SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone)
      WHERE id = ?
      `,
      [
        name?.trim() || null,
        phone?.trim() || null,
        user.id,
      ]
    );

    if (user.role === "candidate") {
      await connection.execute(
        `
        UPDATE candidate_profiles
        SET
          professional_title = COALESCE(?, professional_title),
          description = COALESCE(?, description),
          skills = COALESCE(?, skills),
          education = COALESCE(?, education),
          experience = COALESCE(?, experience),
          city = COALESCE(?, city)
        WHERE user_id = ?
        `,
        [
          professionalTitle?.trim() || null,
          description?.trim() || null,
          skills?.trim() || null,
          education?.trim() || null,
          experience?.trim() || null,
          city?.trim() || null,
          user.id,
        ]
      );
    }

    if (user.role === "company") {
      await connection.execute(
        `
        UPDATE companies
        SET
          company_name = COALESCE(?, company_name),
          sector = COALESCE(?, sector),
          description = COALESCE(?, description),
          address = COALESCE(?, address),
          website = COALESCE(?, website)
        WHERE user_id = ?
        `,
        [
          companyName?.trim() || null,
          sector?.trim() || null,
          description?.trim() || null,
          address?.trim() || null,
          website?.trim() || null,
          user.id,
        ]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Profil modifié avec succès.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Erreur de modification du profil :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de modifier le profil.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// =====================================================
// PUT /api/users/change-password
// Changer le mot de passe
// =====================================================
async function changePassword(req, res) {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
  } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Tous les champs sont obligatoires.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message:
        "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message:
        "La confirmation du mot de passe ne correspond pas.",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message:
        "Le nouveau mot de passe doit être différent de l’ancien.",
    });
  }

  try {
    const [users] = await pool.execute(
      `
      SELECT id, password
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const user = users[0];

    const passwordIsValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Le mot de passe actuel est incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.execute(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Mot de passe modifié avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur de modification du mot de passe :",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Impossible de modifier le mot de passe.",
    });
  }
}

// =====================================================
// DELETE /api/users/account
// Désactiver son compte
// =====================================================
async function deactivateAccount(req, res) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message:
        "Le mot de passe est obligatoire pour désactiver le compte.",
    });
  }

  try {
    const [users] = await pool.execute(
      `
      SELECT id, password
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const user = users[0];

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect.",
      });
    }

    await pool.execute(
      `
      UPDATE users
      SET is_active = FALSE
      WHERE id = ?
      `,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Compte désactivé avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur de désactivation du compte :",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Impossible de désactiver le compte.",
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
};