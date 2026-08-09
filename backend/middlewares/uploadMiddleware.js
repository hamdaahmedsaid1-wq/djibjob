const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// Créer automatiquement un dossier s'il n'existe pas
// =====================================================
function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  }
}

// =====================================================
// Construire le chemin d'upload
// Compatible local + Render
// =====================================================
function getUploadBaseDirectory() {
  const configuredUploadDir =
    process.env.UPLOAD_DIR || "uploads";

  if (path.isAbsolute(configuredUploadDir)) {
    return configuredUploadDir;
  }

  return path.join(
    __dirname,
    "..",
    configuredUploadDir
  );
}

// =====================================================
// Configuration du stockage
// =====================================================
function createStorage(folderName) {
  const baseUploadDirectory =
    getUploadBaseDirectory();

  const destination = path.join(
    baseUploadDirectory,
    folderName
  );

  ensureFolder(destination);

  return multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, destination);
    },

    filename: (req, file, callback) => {
      const extension = path
        .extname(file.originalname)
        .toLowerCase();

      const uniqueName = [
        Date.now(),
        req.user?.id || "user",
        Math.round(Math.random() * 1e9),
      ].join("-");

      callback(
        null,
        `${uniqueName}${extension}`
      );
    },
  });
}

// =====================================================
// Filtre images
// JPG / JPEG / PNG / WEBP
// =====================================================
function imageFileFilter(req, file, callback) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extension)
  ) {
    return callback(null, true);
  }

  return callback(
    new Error(
      "Seules les images JPG, JPEG, PNG et WebP sont autorisées."
    ),
    false
  );
}

// =====================================================
// Filtre CV
// PDF / DOC / DOCX
// =====================================================
function cvFileFilter(req, file, callback) {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extension)
  ) {
    return callback(null, true);
  }

  return callback(
    new Error(
      "Seuls les fichiers PDF, DOC et DOCX sont autorisés."
    ),
    false
  );
}

// =====================================================
// Upload CV candidat
// Taille maximale : 5 Mo
// Dossier : uploads/cvs
// =====================================================
const uploadCv = multer({
  storage: createStorage("cvs"),
  fileFilter: cvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// Upload photo de profil
// Taille maximale : 3 Mo
// Dossier : uploads/profiles
// =====================================================
const uploadProfileImage = multer({
  storage: createStorage("profiles"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

// =====================================================
// Upload logo entreprise
// Taille maximale : 3 Mo
// Dossier : uploads/logos
// =====================================================
const uploadCompanyLogo = multer({
  storage: createStorage("logos"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

module.exports = {
  uploadCv,
  uploadProfileImage,
  uploadCompanyLogo,
};