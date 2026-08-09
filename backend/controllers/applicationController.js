const { pool } = require("../config/database");

// =====================================================
// POST /api/applications
// Envoyer une candidature
// Réservé aux candidats
// =====================================================
async function createApplication(req, res) {
  const { jobOfferId, coverLetter } = req.body;

  const parsedJobOfferId = Number(jobOfferId);

  if (!Number.isInteger(parsedJobOfferId) || parsedJobOfferId <= 0) {
    return res.status(400).json({
      success: false,
      message: "L’identifiant de l’offre est invalide.",
    });
  }

  try {
    const [candidateProfiles] = await pool.execute(
      `
      SELECT id, cv
      FROM candidate_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (candidateProfiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profil candidat introuvable.",
      });
    }

    const candidate = candidateProfiles[0];

    const [jobs] = await pool.execute(
      `
      SELECT id, company_id, title, status, deadline
      FROM job_offers
      WHERE id = ?
      LIMIT 1
      `,
      [parsedJobOfferId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Offre introuvable.",
      });
    }

    const job = jobs[0];

    if (job.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cette offre n’accepte plus de candidatures.",
      });
    }

    if (job.deadline) {
      const deadline = new Date(job.deadline);
      const today = new Date();

      deadline.setHours(23, 59, 59, 999);

      if (deadline < today) {
        return res.status(400).json({
          success: false,
          message: "La date limite de cette offre est dépassée.",
        });
      }
    }

    const [existingApplications] = await pool.execute(
      `
      SELECT id
      FROM applications
      WHERE job_offer_id = ?
        AND candidate_id = ?
      LIMIT 1
      `,
      [parsedJobOfferId, candidate.id]
    );

    if (existingApplications.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà postulé à cette offre.",
      });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO applications (
        job_offer_id,
        candidate_id,
        cover_letter,
        cv,
        status
      )
      VALUES (?, ?, ?, ?, 'pending')
      `,
      [
        parsedJobOfferId,
        candidate.id,
        coverLetter?.trim() || null,
        candidate.cv || null,
      ]
    );

    const [companies] = await pool.execute(
      `
      SELECT users.id AS user_id
      FROM companies
      INNER JOIN users
        ON users.id = companies.user_id
      WHERE companies.id = ?
      LIMIT 1
      `,
      [job.company_id]
    );

    if (companies.length > 0) {
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
          companies[0].user_id,
          "Nouvelle candidature",
          `Une nouvelle candidature a été reçue pour l’offre « ${job.title} ».`,
        ]
      );
    }

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
        req.user.id,
        "Candidature envoyée",
        `Votre candidature pour l’offre « ${job.title} » a été envoyée avec succès.`,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Candidature envoyée avec succès.",
      application: {
        id: result.insertId,
        jobOfferId: parsedJobOfferId,
        candidateId: candidate.id,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la candidature :", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà postulé à cette offre.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Impossible d’envoyer la candidature.",
    });
  }
}

// =====================================================
// GET /api/applications/candidate
// Voir les candidatures du candidat connecté
// =====================================================
async function getCandidateApplications(req, res) {
  try {
    const [candidateProfiles] = await pool.execute(
      `
      SELECT id
      FROM candidate_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (candidateProfiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profil candidat introuvable.",
      });
    }

    const candidateId = candidateProfiles[0].id;

    const [applications] = await pool.execute(
      `
      SELECT
        applications.id,
        applications.cover_letter,
        applications.cv,
        applications.status,
        applications.created_at,
        applications.updated_at,
        job_offers.id AS job_offer_id,
        job_offers.title AS job_title,
        job_offers.location,
        job_offers.contract_type,
        job_offers.status AS job_status,
        companies.id AS company_id,
        companies.company_name,
        companies.logo AS company_logo
      FROM applications
      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id
      INNER JOIN companies
        ON companies.id = job_offers.company_id
      WHERE applications.candidate_id = ?
      ORDER BY applications.created_at DESC
      `,
      [candidateId]
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Erreur de récupération des candidatures du candidat :",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer vos candidatures.",
    });
  }
}

// =====================================================
// GET /api/applications/company
// Voir les candidatures reçues par l’entreprise
// =====================================================
async function getCompanyApplications(req, res) {
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

    const [applications] = await pool.execute(
      `
      SELECT
        applications.id,
        applications.cover_letter,
        applications.cv,
        applications.status,
        applications.created_at,
        applications.updated_at,
        job_offers.id AS job_offer_id,
        job_offers.title AS job_title,
        candidate_profiles.id AS candidate_profile_id,
        candidate_profiles.professional_title,
        candidate_profiles.skills,
        candidate_profiles.education,
        candidate_profiles.experience,
        candidate_profiles.city,
        candidate_profiles.cv AS candidate_cv,
        users.id AS candidate_user_id,
        users.name AS candidate_name,
        users.email AS candidate_email,
        users.phone AS candidate_phone,
        users.profile_image
      FROM applications
      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id
      INNER JOIN candidate_profiles
        ON candidate_profiles.id = applications.candidate_id
      INNER JOIN users
        ON users.id = candidate_profiles.user_id
      WHERE job_offers.company_id = ?
      ORDER BY applications.created_at DESC
      `,
      [companyId]
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Erreur de récupération des candidatures de l’entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les candidatures reçues.",
    });
  }
}

// =====================================================
// PUT /api/applications/:id/status
// Modifier le statut d’une candidature
// Entreprise propriétaire ou administrateur
// =====================================================
async function updateApplicationStatus(req, res) {
  const applicationId = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
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
        applications.status,
        job_offers.title AS job_title,
        companies.user_id AS company_user_id,
        candidate_profiles.user_id AS candidate_user_id
      FROM applications
      INNER JOIN job_offers
        ON job_offers.id = applications.job_offer_id
      INNER JOIN companies
        ON companies.id = job_offers.company_id
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

    const application = applications[0];

    const isOwner = application.company_user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Vous ne pouvez pas modifier cette candidature.",
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

    const statusMessages = {
      pending: "Votre candidature est en attente.",
      reviewed: "Votre candidature a été consultée.",
      accepted: "Félicitations, votre candidature a été acceptée.",
      rejected: "Votre candidature n’a pas été retenue.",
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
        "Mise à jour de votre candidature",
        `${statusMessages[status]} Offre : « ${application.job_title} ».`,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Statut de la candidature modifié avec succès.",
      application: {
        id: applicationId,
        status,
      },
    });
  } catch (error) {
    console.error(
      "Erreur de modification de la candidature :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier le statut de la candidature.",
    });
  }
}

// =====================================================
// DELETE /api/applications/:id
// Retirer sa propre candidature
// =====================================================
async function deleteApplication(req, res) {
  const applicationId = Number(req.params.id);

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de candidature invalide.",
    });
  }

  try {
    const [applications] = await pool.execute(
      `
      SELECT
        applications.id,
        applications.status,
        candidate_profiles.user_id
      FROM applications
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

    const application = applications[0];

    if (application.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez pas retirer cette candidature.",
      });
    }

    if (application.status === "accepted") {
      return res.status(400).json({
        success: false,
        message:
          "Une candidature acceptée ne peut pas être retirée.",
      });
    }

    await pool.execute(
      `
      DELETE FROM applications
      WHERE id = ?
      `,
      [applicationId]
    );

    return res.status(200).json({
      success: true,
      message: "Candidature retirée avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur de suppression de la candidature :",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Impossible de retirer la candidature.",
    });
  }
}

module.exports = {
  createApplication,
  getCandidateApplications,
  getCompanyApplications,
  updateApplicationStatus,
  deleteApplication,
};