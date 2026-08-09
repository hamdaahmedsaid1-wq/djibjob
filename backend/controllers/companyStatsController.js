const { pool } = require("../config/database");

// =====================================================
// GET /api/company/stats
// Statistiques complètes de l'entreprise connectée
// =====================================================
async function getCompanyStats(req, res) {
  try {
    const [companies] = await pool.execute(
      `
      SELECT
        id,
        company_name
      FROM companies
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profil entreprise introuvable.",
      });
    }

    const companyId = companies[0].id;

    // =================================================
    // Statistiques des offres
    // =================================================
    const [[totalJobsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM job_offers
      WHERE company_id = ?
      `,
      [companyId]
    );

    const [[activeJobsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM job_offers
      WHERE company_id = ?
        AND status = 'active'
      `,
      [companyId]
    );

    const [[closedJobsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM job_offers
      WHERE company_id = ?
        AND status = 'closed'
      `,
      [companyId]
    );

    const [[draftJobsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM job_offers
      WHERE company_id = ?
        AND status = 'draft'
      `,
      [companyId]
    );

    // =================================================
    // Statistiques des candidatures
    // =================================================
    const [[totalApplicationsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM applications

      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id

      WHERE job_offers.company_id = ?
      `,
      [companyId]
    );

    const [[pendingApplicationsResult]] =
      await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM applications

        INNER JOIN job_offers
          ON job_offers.id = applications.job_offer_id

        WHERE job_offers.company_id = ?
          AND applications.status = 'pending'
        `,
        [companyId]
      );

    const [[reviewedApplicationsResult]] =
      await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM applications

        INNER JOIN job_offers
          ON job_offers.id = applications.job_offer_id

        WHERE job_offers.company_id = ?
          AND applications.status = 'reviewed'
        `,
        [companyId]
      );

    const [[acceptedApplicationsResult]] =
      await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM applications

        INNER JOIN job_offers
          ON job_offers.id = applications.job_offer_id

        WHERE job_offers.company_id = ?
          AND applications.status = 'accepted'
        `,
        [companyId]
      );

    const [[rejectedApplicationsResult]] =
      await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM applications

        INNER JOIN job_offers
          ON job_offers.id = applications.job_offer_id

        WHERE job_offers.company_id = ?
          AND applications.status = 'rejected'
        `,
        [companyId]
      );

    // =================================================
    // Répartition des candidatures par offre
    // =================================================
    const [applicationsByJob] = await pool.execute(
      `
      SELECT
        job_offers.id,
        job_offers.title,

        COUNT(applications.id) AS applications_count,

        SUM(
          CASE
            WHEN applications.status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pending_count,

        SUM(
          CASE
            WHEN applications.status = 'accepted'
            THEN 1
            ELSE 0
          END
        ) AS accepted_count,

        SUM(
          CASE
            WHEN applications.status = 'rejected'
            THEN 1
            ELSE 0
          END
        ) AS rejected_count

      FROM job_offers

      LEFT JOIN applications
        ON applications.job_offer_id = job_offers.id

      WHERE job_offers.company_id = ?

      GROUP BY
        job_offers.id,
        job_offers.title

      ORDER BY applications_count DESC
      `,
      [companyId]
    );

    // =================================================
    // Candidatures récentes
    // =================================================
    const [recentApplications] = await pool.execute(
      `
      SELECT
        applications.id,
        applications.status,
        applications.created_at,

        users.name AS candidate_name,

        job_offers.title AS job_title

      FROM applications

      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id

      INNER JOIN candidate_profiles
        ON candidate_profiles.id = applications.candidate_id

      INNER JOIN users
        ON users.id = candidate_profiles.user_id

      WHERE job_offers.company_id = ?

      ORDER BY applications.created_at DESC

      LIMIT 5
      `,
      [companyId]
    );

    return res.status(200).json({
      success: true,

      company: {
        id: companyId,
        companyName: companies[0].company_name,
      },

      stats: {
        jobs: {
          total: totalJobsResult.total,
          active: activeJobsResult.total,
          closed: closedJobsResult.total,
          draft: draftJobsResult.total,
        },

        applications: {
          total: totalApplicationsResult.total,
          pending: pendingApplicationsResult.total,
          reviewed: reviewedApplicationsResult.total,
          accepted: acceptedApplicationsResult.total,
          rejected: rejectedApplicationsResult.total,
        },
      },

      applicationsByJob,
      recentApplications,
    });
  } catch (error) {
    console.error(
      "Erreur statistiques entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les statistiques de l’entreprise.",
    });
  }
}

module.exports = {
  getCompanyStats,
};