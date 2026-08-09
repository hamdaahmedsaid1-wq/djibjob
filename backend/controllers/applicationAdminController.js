const { pool } = require("../config/database");

// =====================================================
// GET /api/admin/applications
// Récupérer toutes les candidatures
// =====================================================
async function getAdminApplications(req, res) {
  try {
    const [applications] = await pool.query(`
      SELECT
        applications.id,
        applications.status,
        applications.cover_letter,
        applications.cv,
        applications.created_at,
        applications.updated_at,

        job_offers.id AS job_id,
        job_offers.title AS job_title,
        job_offers.location,
        job_offers.contract_type,

        companies.id AS company_id,
        companies.company_name,

        candidate_profiles.id AS candidate_profile_id,
        candidate_profiles.professional_title,

        users.id AS candidate_user_id,
        users.name AS candidate_name,
        users.email AS candidate_email,
        users.phone AS candidate_phone

      FROM applications

      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id

      INNER JOIN companies
        ON companies.id = job_offers.company_id

      INNER JOIN candidate_profiles
        ON candidate_profiles.id = applications.candidate_id

      INNER JOIN users
        ON users.id = candidate_profiles.user_id

      ORDER BY applications.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Erreur récupération candidatures admin :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les candidatures.",
    });
  }
}

// =====================================================
// PUT /api/admin/applications/:id/status
// Modifier le statut d'une candidature
// =====================================================
async function updateAdminApplicationStatus(req, res) {
  const applicationId = Number(req.params.id);
  const { status } = req.body;

  if (
    !Number.isInteger(applicationId) ||
    applicationId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de candidature invalide.",
    });
  }

  const allowedStatuses = [
    "pending",
    "reviewed",
    "accepted",
    "rejected",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Statut de candidature invalide.",
    });
  }

  try {
    const [applications] = await pool.execute(
      `
      SELECT
        applications.id,
        applications.candidate_id,
        job_offers.title AS job_title,
        candidate_profiles.user_id AS candidate_user_id
      FROM applications

      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id

      INNER JOIN candidate_profiles
        ON candidate_profiles.id = applications.candidate_id

      WHERE applications.id = ?

      LIMIT 1
      `,
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidature introuvable.",
      });
    }

    await pool.execute(
      `
      UPDATE applications
      SET status = ?
      WHERE id = ?
      `,
      [status, applicationId]
    );

    const application = applications[0];

    const messages = {
      pending: "Votre candidature est en attente.",
      reviewed: "Votre candidature a été consultée.",
      accepted:
        "Félicitations, votre candidature a été acceptée.",
      rejected:
        "Votre candidature n’a pas été retenue.",
    };

    await pool.execute(
      `
      INSERT INTO notifications (
        user_id,
        title,
        message
      )
      VALUES (?, ?, ?)
      `,
      [
        application.candidate_user_id,
        "Mise à jour de candidature",
        `${messages[status]} Offre : « ${application.job_title} ».`,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Statut de la candidature modifié avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur modification candidature admin :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier cette candidature.",
    });
  }
}

// =====================================================
// DELETE /api/admin/applications/:id
// Supprimer une candidature
// =====================================================
async function deleteAdminApplication(req, res) {
  const applicationId = Number(req.params.id);

  if (
    !Number.isInteger(applicationId) ||
    applicationId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de candidature invalide.",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      DELETE FROM applications
      WHERE id = ?
      `,
      [applicationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidature introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Candidature supprimée avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur suppression candidature admin :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de supprimer cette candidature.",
    });
  }
}

module.exports = {
  getAdminApplications,
  updateAdminApplicationStatus,
  deleteAdminApplication,
};