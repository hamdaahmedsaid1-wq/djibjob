const { pool } = require("../config/database");

// =====================================================
// GET /api/company/dashboard
// Statistiques de l'entreprise connectée
// =====================================================
async function getCompanyDashboard(req, res) {
  try {
    const [companies] = await pool.execute(
      `
      SELECT
        id,
        company_name,
        sector,
        description,
        address,
        website,
        logo
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

    const company = companies[0];

    const [[jobsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM job_offers
      WHERE company_id = ?
      `,
      [company.id]
    );

    const [[activeJobsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM job_offers
      WHERE company_id = ?
        AND status = 'active'
      `,
      [company.id]
    );

    const [[applicationsResult]] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM applications
      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id
      WHERE job_offers.company_id = ?
      `,
      [company.id]
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
        [company.id]
      );

    const [recentJobs] = await pool.execute(
      `
      SELECT
        id,
        title,
        location,
        contract_type,
        status,
        created_at
      FROM job_offers
      WHERE company_id = ?
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [company.id]
    );

    return res.status(200).json({
      success: true,
      company,
      stats: {
        jobs: jobsResult.total,
        activeJobs: activeJobsResult.total,
        applications: applicationsResult.total,
        pendingApplications:
          pendingApplicationsResult.total,
      },
      recentJobs,
    });
  } catch (error) {
    console.error(
      "Erreur dashboard entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer le tableau de bord de l’entreprise.",
    });
  }
}

// =====================================================
// GET /api/company/jobs
// Récupérer les offres de l'entreprise connectée
// =====================================================
async function getCompanyJobs(req, res) {
  try {
    const [companies] = await pool.execute(
      `
      SELECT id
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

    const [jobs] = await pool.execute(
      `
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
        job_offers.updated_at,

        categories.name AS category_name,

        COUNT(applications.id) AS applications_count

      FROM job_offers

      LEFT JOIN categories
        ON categories.id = job_offers.category_id

      LEFT JOIN applications
        ON applications.job_offer_id = job_offers.id

      WHERE job_offers.company_id = ?

      GROUP BY
        job_offers.id,
        categories.name

      ORDER BY job_offers.created_at DESC
      `,
      [companyId]
    );

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error(
      "Erreur récupération offres entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les offres de l’entreprise.",
    });
  }
}

module.exports = {
  getCompanyDashboard,
  getCompanyJobs,
};