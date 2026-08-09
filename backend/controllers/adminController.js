const { pool } = require("../config/database");

// =====================================================
// GET /api/admin/stats
// Statistiques générales de la plateforme
// =====================================================
async function getAdminStats(req, res) {
  try {
    const [[usersResult]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users"
    );

    const [[candidatesResult]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'candidate'"
    );

    const [[companiesResult]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'company'"
    );

    const [[jobsResult]] = await pool.query(
      "SELECT COUNT(*) AS total FROM job_offers"
    );

    const [[applicationsResult]] = await pool.query(
      "SELECT COUNT(*) AS total FROM applications"
    );

    return res.status(200).json({
      success: true,
      stats: {
        users: usersResult.total,
        candidates: candidatesResult.total,
        companies: companiesResult.total,
        jobs: jobsResult.total,
        applications: applicationsResult.total,
      },
    });
  } catch (error) {
    console.error("Erreur statistiques admin :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les statistiques.",
    });
  }
}

// =====================================================
// GET /api/admin/users
// Récupérer tous les utilisateurs
// =====================================================
async function getUsers(req, res) {
  try {
    const [users] = await pool.query(`
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
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Erreur récupération utilisateurs :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les utilisateurs.",
    });
  }
}

// =====================================================
// PUT /api/admin/users/:id/status
// Activer ou désactiver un utilisateur
// =====================================================
async function updateUserStatus(req, res) {
  const userId = Number(req.params.id);
  const { isActive } = req.body;

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant utilisateur invalide.",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message:
        "Le statut doit être une valeur booléenne.",
    });
  }

  if (
    userId === req.user.id &&
    isActive === false
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Vous ne pouvez pas désactiver votre propre compte.",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      UPDATE users
      SET is_active = ?
      WHERE id = ?
      `,
      [isActive, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Utilisateur activé avec succès."
        : "Utilisateur désactivé avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur modification statut utilisateur :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier le statut de l’utilisateur.",
    });
  }
}

// =====================================================
// DELETE /api/admin/users/:id
// Supprimer un utilisateur
// =====================================================
async function deleteUser(req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant utilisateur invalide.",
    });
  }

  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message:
        "Vous ne pouvez pas supprimer votre propre compte.",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Utilisateur supprimé avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur suppression utilisateur :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de supprimer cet utilisateur.",
    });
  }
}

module.exports = {
  getAdminStats,
  getUsers,
  updateUserStatus,
  deleteUser,
};