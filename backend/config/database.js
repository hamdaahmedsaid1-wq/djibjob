const mysql = require("mysql2/promise");
require("dotenv").config();

// =====================================================
// Configuration MySQL
// Local + production
// =====================================================

const isProduction =
  process.env.NODE_ENV === "production";

const poolConfig = {
  host:
    process.env.DB_HOST ||
    "localhost",

  port:
    Number(process.env.DB_PORT) ||
    3306,

  user:
    process.env.DB_USER ||
    "root",

  password:
    process.env.DB_PASSWORD ||
    "",

  database:
    process.env.DB_NAME ||
    "djibjob",

  waitForConnections: true,

  connectionLimit:
    Number(
      process.env.DB_CONNECTION_LIMIT
    ) || 10,

  queueLimit: 0,

  charset: "utf8mb4",
};

// =====================================================
// SSL production
//
// À activer uniquement si la base distante
// exige une connexion TLS.
// =====================================================

if (
  isProduction &&
  process.env.DB_SSL === "true"
) {
  poolConfig.ssl = {
    rejectUnauthorized:
      process.env.DB_SSL_REJECT_UNAUTHORIZED !==
      "false",
  };
}

// =====================================================
// Pool MySQL
// =====================================================

const pool =
  mysql.createPool(poolConfig);

// =====================================================
// Vérification de la connexion
// =====================================================

async function testDatabaseConnection() {
  let connection;

  try {
    connection =
      await pool.getConnection();

    console.log(
      "======================================"
    );

    console.log(
      `📂 Base utilisée : ${poolConfig.database}`
    );

    console.log(
      `🔌 Port MySQL : ${poolConfig.port}`
    );

    console.log(
      `🖥️ Serveur MySQL : ${poolConfig.host}`
    );

    console.log(
      "✅ Connexion MySQL réussie"
    );

    console.log(
      "======================================"
    );

    return true;
  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "❌ Connexion MySQL impossible"
    );

    console.error(
      "Message :",
      error.message
    );

    console.error(
      "Code :",
      error.code
    );

    console.error(
      "======================================"
    );

    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// =====================================================
// Afficher les tables en développement uniquement
// =====================================================

async function showDatabaseTables() {
  if (isProduction) {
    return;
  }

  try {
    const [tables] =
      await pool.query(
        "SHOW TABLES"
      );

    console.log(
      "📋 Tables trouvées :"
    );

    tables.forEach((table) => {
      console.log(table);
    });
  } catch (error) {
    console.error(
      "Impossible de récupérer les tables :",
      error.message
    );
  }
}

// =====================================================
// Initialisation automatique
// =====================================================

async function initializeDatabase() {
  try {
    await testDatabaseConnection();
    await showDatabaseTables();
  } catch (error) {
    console.error(
      "Erreur d'initialisation MySQL."
    );
  }
}

initializeDatabase();

// =====================================================
// Exports
// =====================================================

module.exports = {
  pool,
  testDatabaseConnection,
};