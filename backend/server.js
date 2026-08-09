require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

function startServer() {
  try {
    app.listen(PORT, HOST, () => {
      console.log("======================================");
      console.log("✅ Connexion MySQL réussie");
      console.log("🚀 DjibJob API démarrée");
      console.log(`🔌 Port : ${PORT}`);
      console.log(
        `🌐 Environnement : ${
          process.env.NODE_ENV || "development"
        }`
      );

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `📍 Local : http://localhost:${PORT}`
        );
      }

      console.log("======================================");
    });
  } catch (error) {
    console.error(
      "❌ Impossible de démarrer DjibJob :",
      error
    );

    process.exit(1);
  }
}

startServer();