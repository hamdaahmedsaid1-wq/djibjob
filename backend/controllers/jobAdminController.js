const { pool } = require("../config/database");

// =====================================================
// GET /api/admin/jobs
// Récupérer toutes les offres
// =====================================================
async function getAdminJobs(req, res) {
  try {
    const [jobs] = await pool.query(`
      SELECT
        job_offers.id,
        job_offers.title,
        job_offers.description,
        job_offers.location,
        job_offers.contract_type,
        job_offers.salary,
        job_offers.deadline,
        job_offers.status,
        job_offers.created_at,

        companies.id AS company_id,
        companies.company_name,
        companies.logo AS company_logo,

        categories.id AS category_id,
        categories.name AS category_name

      FROM job_offers

      INNER JOIN companies
        ON companies.id = job_offers.company_id

      LEFT JOIN categories
        ON categories.id = job_offers.category_id

      ORDER BY job_offers.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error(
      "Erreur récupération offres admin :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les offres.",
    });
  }
}

// =====================================================
// PUT /api/admin/jobs/:id/status
// Modifier le statut d'une offre
// =====================================================
async function updateJobStatus(req, res) {
  const jobId = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(jobId) || jobId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de l’offre invalide.",
    });
  }

  const allowedStatuses = [
    "draft",
    "active",
    "closed",
    "expired",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Statut de l’offre invalide.",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      UPDATE job_offers
      SET status = ?
      WHERE id = ?
      `,
      [status, jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Offre introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Statut de l’offre modifié avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur modification statut offre :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier le statut de l’offre.",
    });
  }
}

// =====================================================
// DELETE /api/admin/jobs/:id
// Supprimer une offre
// =====================================================
async function deleteAdminJob(req, res) {
  const jobId = Number(req.params.id);

  if (!Number.isInteger(jobId) || jobId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de l’offre invalide.",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      DELETE FROM job_offers
      WHERE id = ?
      `,
      [jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Offre introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Offre supprimée avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur suppression offre admin :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de supprimer cette offre.",
    });
  }
}

module.exports = {
  getAdminJobs,
  updateJobStatus,
  deleteAdminJob,
};