require("dotenv").config();

const app = require("./app");
const { pool } = require("./config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check the database connection before starting the API.
    await pool.query("SELECT 1");

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