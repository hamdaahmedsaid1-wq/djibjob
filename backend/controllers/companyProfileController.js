const { pool } = require("../config/database");

// =====================================================
// GET /api/company/profile
// Récupérer le profil de l'entreprise connectée
// =====================================================
async function getCompanyProfile(req, res) {
  try {
    const [companies] = await pool.execute(
      `
      SELECT
        companies.id,
        companies.company_name,
        companies.description,
        companies.sector,
        companies.address,
        companies.website,
        companies.logo,
        companies.created_at,
        companies.updated_at,

        users.id AS user_id,
        users.name AS contact_name,
        users.email,
        users.phone,
        users.profile_image

      FROM companies

      INNER JOIN users
        ON users.id = companies.user_id

      WHERE companies.user_id = ?

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

    return res.status(200).json({
      success: true,
      company: companies[0],
    });
  } catch (error) {
    console.error(
      "Erreur récupération profil entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer le profil de l’entreprise.",
    });
  }
}

// =====================================================
// PUT /api/company/profile
// Modifier le profil de l'entreprise connectée
// =====================================================
async function updateCompanyProfile(req, res) {
  const {
    contactName,
    phone,
    companyName,
    description,
    sector,
    address,
    website,
  } = req.body;

  if (!companyName || !companyName.trim()) {
    return res.status(400).json({
      success: false,
      message:
        "Le nom de l’entreprise est obligatoire.",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [companies] = await connection.execute(
      `
      SELECT id
      FROM companies
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (companies.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Profil entreprise introuvable.",
      });
    }

    await connection.execute(
      `
      UPDATE users
      SET
        name = ?,
        phone = ?
      WHERE id = ?
      `,
      [
        contactName?.trim() || req.user.name,
        phone?.trim() || null,
        req.user.id,
      ]
    );

    await connection.execute(
      `
      UPDATE companies
      SET
        company_name = ?,
        description = ?,
        sector = ?,
        address = ?,
        website = ?
      WHERE user_id = ?
      `,
      [
        companyName.trim(),
        description?.trim() || null,
        sector?.trim() || null,
        address?.trim() || null,
        website?.trim() || null,
        req.user.id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        "Profil entreprise modifié avec succès.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(
      "Erreur modification profil entreprise :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier le profil de l’entreprise.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};