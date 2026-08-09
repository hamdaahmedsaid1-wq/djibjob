const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const adminRoutes = require("./routes/adminRoutes");
const companyAdminRoutes = require("./routes/companyAdminRoutes");
const jobAdminRoutes = require("./routes/jobAdminRoutes");
const applicationAdminRoutes = require("./routes/applicationAdminRoutes");

const companyDashboardRoutes = require("./routes/companyDashboardRoutes");
const companyProfileRoutes = require("./routes/companyProfileRoutes");
const companyStatsRoutes = require("./routes/companyStatsRoutes");

const app = express();

// =====================================================
// CORS
// Local + futur frontend Vercel
// =====================================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`Origine CORS refusée : ${origin}`);

      return callback(
        new Error(
          "Cette origine n'est pas autorisée par CORS."
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// Middlewares Express
// =====================================================
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// Dossier des uploads
// Compatible local + Render
// =====================================================
const configuredUploadDir =
  process.env.UPLOAD_DIR || "uploads";

const uploadDirectory =
  path.isAbsolute(configuredUploadDir)
    ? configuredUploadDir
    : path.join(
        __dirname,
        configuredUploadDir
      );

// =====================================================
// Fichiers uploadés
// =====================================================
app.use(
  "/uploads",
  express.static(uploadDirectory)
);

// =====================================================
// Route d'accueil API
// =====================================================
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Bienvenue sur l'API DjibJob 🚀",
  });
});

// =====================================================
// Vérification API
// =====================================================
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API opérationnelle",
    environment:
      process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// Routes principales
// =====================================================

// Authentification
app.use(
  "/api/auth",
  authRoutes
);

// Utilisateurs
app.use(
  "/api/users",
  userRoutes
);

// Offres
app.use(
  "/api/jobs",
  jobRoutes
);

// Candidatures
app.use(
  "/api/applications",
  applicationRoutes
);

// Uploads
app.use(
  "/api/uploads",
  uploadRoutes
);

// Notifications
app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// Espace entreprise
// =====================================================

// Dashboard entreprise
app.use(
  "/api/company",
  companyDashboardRoutes
);

// Profil entreprise
app.use(
  "/api/company/profile",
  companyProfileRoutes
);

// Statistiques entreprise
app.use(
  "/api/company/stats",
  companyStatsRoutes
);

// =====================================================
// Administration
// =====================================================

// Dashboard admin + utilisateurs
app.use(
  "/api/admin",
  adminRoutes
);

// Entreprises
app.use(
  "/api/admin/companies",
  companyAdminRoutes
);

// Offres
app.use(
  "/api/admin/jobs",
  jobAdminRoutes
);

// Candidatures
app.use(
  "/api/admin/applications",
  applicationAdminRoutes
);

// =====================================================
// Gestion des erreurs Multer
// =====================================================
app.use((error, req, res, next) => {
  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "Le fichier envoyé est trop volumineux.",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Erreur lors de l'envoi du fichier.",
    });
  }

  next(error);
});

// =====================================================
// Gestion globale des erreurs
// =====================================================
app.use((error, req, res, next) => {
  console.error(
    "Erreur globale :",
    error
  );

  if (
    error.message ===
    "Cette origine n'est pas autorisée par CORS."
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Origine non autorisée.",
    });
  }

  return res.status(
    error.status || 500
  ).json({
    success: false,
    message:
      process.env.NODE_ENV ===
      "production"
        ? "Une erreur interne est survenue."
        : error.message ||
          "Une erreur interne est survenue.",
  });
});

// =====================================================
// Route introuvable
// =====================================================
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route introuvable.",
  });
});

module.exports = app;