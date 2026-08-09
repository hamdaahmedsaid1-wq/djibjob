const { pool } = require("../config/database");

// =====================================================
// GET /api/admin/companies
// Récupérer toutes les entreprises
// =====================================================
async function getCompanies(req, res) {
  try {
    const [companies] = await pool.query(`
      SELECT
        companies.id,
        companies.company_name,
        companies.sector,
        companies.description,
        companies.address,
        companies.website,
        companies.logo,
        companies.created_at,
        companies.updated_at,

        users.id AS user_id,
        users.name AS contact_name,
        users.email,
        users.phone,
        users.is_active

      FROM companies

      INNER JOIN users
        ON users.id = companies.user_id

      ORDER BY companies.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error(
      "Erreur récupération entreprises :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les entreprises.",
    });
  }
}

// =====================================================
// GET /api/admin/companies/:id
// Récupérer une entreprise précise
// =====================================================
async function getCompanyById(req, res) {
  const companyId = Number(req.params.id);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant entreprise invalide.",
    });
  }

  try {
    const [companies] = await pool.execute(
      `
      SELECT
        companies.id,
        companies.company_name,
        companies.sector,
        companies.description,
        companies.address,
        companies.website,
        companies.logo,
        companies.created_at,
        companies.updated_at,

        users.id AS user_id,
        users.name AS contact_name,
        users.email,
        users.phone,
        users.is_active

      FROM companies

      INNER JOIN users
        ON users.id = companies.user_id

      WHERE companies.id = ?

      LIMIT 1
      `,
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Entreprise introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      company: companies[0],
    });
  } catch (error) {
    console.error(
      "Erreur récupération entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer cette entreprise.",
    });
  }
}

// =====================================================
// PUT /api/admin/companies/:id/status
// Activer / désactiver le compte entreprise
// =====================================================
async function updateCompanyStatus(req, res) {
  const companyId = Number(req.params.id);
  const { isActive } = req.body;

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant entreprise invalide.",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message:
        "Le statut doit être une valeur booléenne.",
    });
  }

  try {
    const [companies] = await pool.execute(
      `
      SELECT
        companies.id,
        companies.user_id

      FROM companies

      WHERE companies.id = ?

      LIMIT 1
      `,
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Entreprise introuvable.",
      });
    }

    const userId = companies[0].user_id;

    await pool.execute(
      `
      UPDATE users
      SET is_active = ?
      WHERE id = ?
      `,
      [isActive, userId]
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Entreprise activée avec succès."
        : "Entreprise désactivée avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur modification entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier le statut de l’entreprise.",
    });
  }
}

// =====================================================
// DELETE /api/admin/companies/:id
// Supprimer une entreprise
// =====================================================
async function deleteCompany(req, res) {
  const companyId = Number(req.params.id);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Identifiant entreprise invalide.",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [companies] = await connection.execute(
      `
      SELECT
        id,
        user_id
      FROM companies
      WHERE id = ?
      LIMIT 1
      `,
      [companyId]
    );

    if (companies.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Entreprise introuvable.",
      });
    }

    const userId = companies[0].user_id;

    /*
      La suppression du compte utilisateur
      supprimera aussi le profil entreprise si
      les clés étrangères ON DELETE CASCADE sont actives.

      Mais nous supprimons d'abord l'entreprise
      pour rester compatibles avec ta base actuelle.
    */

    await connection.execute(
      `
      DELETE FROM companies
      WHERE id = ?
      `,
      [companyId]
    );

    await connection.execute(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [userId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        "Entreprise supprimée avec succès.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(
      "Erreur suppression entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de supprimer cette entreprise.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  getCompanies,
  getCompanyById,
  updateCompanyStatus,
  deleteCompany,
};