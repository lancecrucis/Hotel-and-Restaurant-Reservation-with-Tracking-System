require("dotenv").config();

const app = require("./app");
const { initializeDatabase } = require("./config/initializeDatabase");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Create the local database, tables, and sample data before serving requests.
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("PostgreSQL connected successfully");
    });
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exit(1);
  }
}

startServer();
