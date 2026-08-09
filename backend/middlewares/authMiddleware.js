const jwt = require("jsonwebtoken");

const { pool } = require("../config/database");

// =====================================================
// Middleware protect
// Vérifie le token JWT
// =====================================================
async function protect(req, res, next) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Accès refusé. Aucun token fourni.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Token d’authentification manquant.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          "Token invalide ou expiré.",
      });
    }

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
          is_active
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [decoded.id]
      );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Utilisateur introuvable.",
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "Votre compte a été désactivé.",
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile_image:
        user.profile_image,
    };

    next();
  } catch (error) {
    console.error(
      "Erreur middleware authentification :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erreur lors de la vérification de l’authentification.",
    });
  }
}

// =====================================================
// Middleware authorize
// Vérifie le rôle de l'utilisateur
// =====================================================
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Utilisateur non authentifié.",
      });
    }

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Vous n’avez pas l’autorisation d’accéder à cette ressource.",
      });
    }

    next();
  };
}

module.exports = {
  protect,
  authorize,
};