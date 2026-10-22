require("dotenv").config();

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured. Copy backend/.env.example to backend/.env and enter your PostgreSQL password.",
  );
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL connection error:", error);
});

function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
