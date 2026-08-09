const { pool } = require("../config/database");

// =====================================================
// GET /api/jobs
// Recherche avancée + liste des offres
// =====================================================
async function getAllJobs(req, res) {
  try {
    const {
      search = "",
      location = "",
      category = "",
      contractType = "",
      minSalary = "",
      maxSalary = "",
      status = "active",
      sort = "recent",
    } = req.query;

    const conditions = [];
    const values = [];

    // Statut
    if (status) {
      conditions.push(
        "job_offers.status = ?"
      );
      values.push(status);
    }

    // Recherche texte
    if (search.trim()) {
      conditions.push(`
        (
          job_offers.title LIKE ?
          OR job_offers.description LIKE ?
          OR job_offers.requirements LIKE ?
          OR job_offers.missions LIKE ?
          OR companies.company_name LIKE ?
        )
      `);

      const searchValue =
        `%${search.trim()}%`;

      values.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Localisation
    if (location.trim()) {
      conditions.push(
        "job_offers.location LIKE ?"
      );

      values.push(
        `%${location.trim()}%`
      );
    }

    // Catégorie
    if (category) {
      conditions.push(
        "job_offers.category_id = ?"
      );

      values.push(
        Number(category)
      );
    }

    // Contrat
    if (contractType) {
      conditions.push(
        "job_offers.contract_type = ?"
      );

      values.push(contractType);
    }

    // Salaire minimum
    if (
      minSalary !== "" &&
      !Number.isNaN(Number(minSalary))
    ) {
      conditions.push(
        "job_offers.salary >= ?"
      );

      values.push(
        Number(minSalary)
      );
    }

    // Salaire maximum
    if (
      maxSalary !== "" &&
      !Number.isNaN(Number(maxSalary))
    ) {
      conditions.push(
        "job_offers.salary <= ?"
      );

      values.push(
        Number(maxSalary)
      );
    }

    let orderBy =
      "job_offers.created_at DESC";

    if (sort === "oldest") {
      orderBy =
        "job_offers.created_at ASC";
    }

    if (sort === "salary_desc") {
      orderBy =
        "job_offers.salary DESC";
    }

    if (sort === "salary_asc") {
      orderBy =
        "job_offers.salary ASC";
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const sql = `
      SELECT
        job_offers.id,
        job_offers.title,
        job_offers.description,
        job_offers.missions,
        job_offers.requirements,
        job_offers.experience_level,
        job_offers.location,
        job_offers.contract_type,
        job_offers.salary,
        job_offers.deadline,
        job_offers.status,
        job_offers.created_at,
        job_offers.updated_at,

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

      ${whereClause}

      ORDER BY ${orderBy}
    `;

    const [jobs] =
      await pool.execute(
        sql,
        values
      );

    return res.status(200).json({
      success: true,
      count: jobs.length,
      filters: {
        search,
        location,
        category,
        contractType,
        minSalary,
        maxSalary,
        status,
        sort,
      },
      jobs,
    });
  } catch (error) {
    console.error(
      "Erreur récupération offres :",
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
// GET /api/jobs/categories
// =====================================================
async function getCategories(req, res) {
  try {
    const [categories] =
      await pool.query(`
        SELECT
          id,
          name
        FROM categories
        ORDER BY name ASC
      `);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error(
      "Erreur récupération catégories :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les catégories.",
    });
  }
}

// =====================================================
// GET /api/jobs/:id
// =====================================================
async function getJobById(req, res) {
  const jobId = Number(req.params.id);

  if (
    !Number.isInteger(jobId) ||
    jobId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Identifiant de l’offre invalide.",
    });
  }

  try {
    const [jobs] =
      await pool.execute(
        `
        SELECT
          job_offers.*,

          companies.company_name,
          companies.description AS company_description,
          companies.sector AS company_sector,
          companies.address AS company_address,
          companies.website AS company_website,
          companies.logo AS company_logo,

          categories.name AS category_name

        FROM job_offers

        INNER JOIN companies
          ON companies.id = job_offers.company_id

        LEFT JOIN categories
          ON categories.id = job_offers.category_id

        WHERE job_offers.id = ?

        LIMIT 1
        `,
        [jobId]
      );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Offre introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      job: jobs[0],
    });
  } catch (error) {
    console.error(
      "Erreur récupération offre :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer cette offre.",
    });
  }
}

// =====================================================
// POST /api/jobs
// =====================================================
async function createJob(req, res) {
  const {
    categoryId,
    title,
    description,
    missions,
    requirements,
    experienceLevel,
    location,
    contractType,
    salary,
    deadline,
    status = "active",
  } = req.body;

  if (
    !title ||
    !description ||
    !location ||
    !contractType
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Le titre, la description, la localisation et le type de contrat sont obligatoires.",
    });
  }

  const allowedContracts = [
    "CDI",
    "CDD",
    "Stage",
    "Alternance",
    "Freelance",
  ];

  const allowedStatuses = [
    "draft",
    "active",
    "closed",
    "expired",
  ];

  if (
    !allowedContracts.includes(
      contractType
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Type de contrat invalide.",
    });
  }

  if (
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Statut de l’offre invalide.",
    });
  }

  try {
    const [companies] =
      await pool.execute(
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
        message:
          "Profil entreprise introuvable.",
      });
    }

    const companyId =
      companies[0].id;

    const [result] =
      await pool.execute(
        `
        INSERT INTO job_offers (
          company_id,
          category_id,
          title,
          description,
          missions,
          requirements,
          experience_level,
          location,
          contract_type,
          salary,
          deadline,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          companyId,
          categoryId || null,
          title.trim(),
          description.trim(),
          missions?.trim() || null,
          requirements?.trim() || null,
          experienceLevel?.trim() || null,
          location.trim(),
          contractType,
          salary ?? null,
          deadline || null,
          status,
        ]
      );

    return res.status(201).json({
      success: true,
      message:
        "Offre publiée avec succès.",
      job: {
        id: result.insertId,
        title: title.trim(),
        location: location.trim(),
        contractType,
        status,
      },
    });
  } catch (error) {
    console.error(
      "Erreur création offre :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de créer l’offre.",
    });
  }
}

// =====================================================
// PUT /api/jobs/:id
// =====================================================
async function updateJob(req, res) {
  const jobId =
    Number(req.params.id);

  if (
    !Number.isInteger(jobId) ||
    jobId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Identifiant de l’offre invalide.",
    });
  }

  try {
    const [jobs] =
      await pool.execute(
        `
        SELECT
          job_offers.*,
          companies.user_id

        FROM job_offers

        INNER JOIN companies
          ON companies.id =
             job_offers.company_id

        WHERE job_offers.id = ?

        LIMIT 1
        `,
        [jobId]
      );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Offre introuvable.",
      });
    }

    const currentJob = jobs[0];

    const isOwner =
      currentJob.user_id ===
      req.user.id;

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Vous ne pouvez pas modifier cette offre.",
      });
    }

    const {
      categoryId,
      title,
      description,
      missions,
      requirements,
      experienceLevel,
      location,
      contractType,
      salary,
      deadline,
      status,
    } = req.body;

    await pool.execute(
      `
      UPDATE job_offers
      SET
        category_id = ?,
        title = ?,
        description = ?,
        missions = ?,
        requirements = ?,
        experience_level = ?,
        location = ?,
        contract_type = ?,
        salary = ?,
        deadline = ?,
        status = ?
      WHERE id = ?
      `,
      [
        categoryId !== undefined
          ? categoryId || null
          : currentJob.category_id,

        title !== undefined
          ? title.trim()
          : currentJob.title,

        description !== undefined
          ? description.trim()
          : currentJob.description,

        missions !== undefined
          ? missions?.trim() || null
          : currentJob.missions,

        requirements !== undefined
          ? requirements?.trim() || null
          : currentJob.requirements,

        experienceLevel !== undefined
          ? experienceLevel?.trim() ||
            null
          : currentJob.experience_level,

        location !== undefined
          ? location.trim()
          : currentJob.location,

        contractType !== undefined
          ? contractType
          : currentJob.contract_type,

        salary !== undefined
          ? salary === "" ||
            salary === null
            ? null
            : salary
          : currentJob.salary,

        deadline !== undefined
          ? deadline || null
          : currentJob.deadline,

        status !== undefined
          ? status
          : currentJob.status,

        jobId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Offre modifiée avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur modification offre :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier l’offre.",
    });
  }
}

// =====================================================
// DELETE /api/jobs/:id
// =====================================================
async function deleteJob(req, res) {
  const jobId =
    Number(req.params.id);

  if (
    !Number.isInteger(jobId) ||
    jobId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Identifiant de l’offre invalide.",
    });
  }

  try {
    const [jobs] =
      await pool.execute(
        `
        SELECT
          job_offers.id,
          companies.user_id

        FROM job_offers

        INNER JOIN companies
          ON companies.id =
             job_offers.company_id

        WHERE job_offers.id = ?

        LIMIT 1
        `,
        [jobId]
      );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Offre introuvable.",
      });
    }

    const isOwner =
      jobs[0].user_id ===
      req.user.id;

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Vous ne pouvez pas supprimer cette offre.",
      });
    }

    await pool.execute(
      `
      DELETE FROM job_offers
      WHERE id = ?
      `,
      [jobId]
    );

    return res.status(200).json({
      success: true,
      message:
        "Offre supprimée avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur suppression offre :",
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
  getAllJobs,
  getCategories,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};