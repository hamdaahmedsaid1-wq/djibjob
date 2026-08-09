const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/database");

// =====================================================
// Génération JWT
// =====================================================
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

// =====================================================
// POST /api/auth/register
// Inscription candidat ou entreprise
// =====================================================
async function register(req, res) {
  const {
    name,
    email,
    password,
    phone,
    role = "candidate",

    // Informations entreprise
    companyName,
    sector,
    address,
    website,
  } = req.body;

  // -----------------------------
  // Validation générale
  // -----------------------------
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Le nom, l’adresse e-mail et le mot de passe sont obligatoires.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message:
        "Le mot de passe doit contenir au moins 8 caractères.",
    });
  }

  const allowedRoles = [
    "candidate",
    "company",
  ];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Rôle invalide.",
    });
  }

  if (
    role === "company" &&
    !companyName
  ) {
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

    // -----------------------------
    // Vérifier l'e-mail
    // -----------------------------
    const [existingUsers] =
      await connection.execute(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email.trim().toLowerCase()]
      );

    if (existingUsers.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Un compte existe déjà avec cette adresse e-mail.",
      });
    }

    // -----------------------------
    // Chiffrer le mot de passe
    // -----------------------------
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // -----------------------------
    // Créer utilisateur
    // -----------------------------
    const [userResult] =
      await connection.execute(
        `
        INSERT INTO users (
          name,
          email,
          password,
          phone,
          role,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, 1)
        `,
        [
          name.trim(),
          email.trim().toLowerCase(),
          hashedPassword,
          phone?.trim() || null,
          role,
        ]
      );

    const userId =
      userResult.insertId;

    // -----------------------------
    // Profil candidat
    // -----------------------------
    if (role === "candidate") {
      await connection.execute(
        `
        INSERT INTO candidate_profiles (
          user_id
        )
        VALUES (?)
        `,
        [userId]
      );
    }

    // -----------------------------
    // Profil entreprise
    // -----------------------------
    if (role === "company") {
      await connection.execute(
        `
        INSERT INTO companies (
          user_id,
          company_name,
          sector,
          address,
          website
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          userId,
          companyName.trim(),
          sector?.trim() || null,
          address?.trim() || null,
          website?.trim() || null,
        ]
      );
    }

    await connection.commit();

    const user = {
      id: userId,
      name: name.trim(),
      email:
        email.trim().toLowerCase(),
      phone:
        phone?.trim() || null,
      role,
      is_active: 1,
    };

    const token =
      generateToken(user);

    return res.status(201).json({
      success: true,
      message:
        role === "candidate"
          ? "Compte candidat créé avec succès."
          : "Compte entreprise créé avec succès.",
      token,
      user,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(
      "Erreur inscription :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de créer le compte.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// =====================================================
// POST /api/auth/login
// Connexion
// =====================================================
async function login(req, res) {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "L’adresse e-mail et le mot de passe sont obligatoires.",
    });
  }

  try {
    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          email,
          password,
          phone,
          role,
          profile_image,
          is_active
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email.trim().toLowerCase()]
      );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Adresse e-mail ou mot de passe incorrect.",
      });
    }

    const user =
      users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "Votre compte a été désactivé.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Adresse e-mail ou mot de passe incorrect.",
      });
    }

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,
      message:
        "Connexion réussie.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_image:
          user.profile_image,
        is_active:
          user.is_active,
      },
    });
  } catch (error) {
    console.error(
      "Erreur connexion :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de se connecter.",
    });
  }
}

// =====================================================
// GET /api/auth/me
// Utilisateur connecté
// =====================================================
async function getMe(req, res) {
  try {
    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          email,
          phone,
          role,
          profile_image,
          is_active,
          created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [req.user.id]
      );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      user:
        users[0],
    });
  } catch (error) {
    console.error(
      "Erreur récupération utilisateur :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer l’utilisateur.",
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
};