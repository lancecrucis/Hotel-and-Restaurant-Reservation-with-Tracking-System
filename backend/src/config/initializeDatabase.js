/*
Database Bootstrap

For a local setup, the backend can create the PostgreSQL database, apply all
migrations, and add sample rooms and tables automatically when it starts.
The database user must have the CREATEDB privilege for database creation.
*/

const fs = require("fs/promises");
const path = require("path");
const { Client } = require("pg");

const { pool } = require("./database");

const migrationsDirectory = path.resolve(
  __dirname,
  "../../../database/migrations",
);
const seedFile = path.resolve(
  __dirname,
  "../../../database/seeds/001_sample_data.sql",
);

function databaseSsl() {
  return process.env.DATABASE_SSL === "true"
    ? { rejectUnauthorized: false }
    : false;
}

function targetDatabaseName() {
  const databaseUrl = new URL(process.env.DATABASE_URL);
  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));

  if (!databaseName) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  return databaseName;
}

async function createDatabaseIfMissing() {
  if (process.env.AUTO_CREATE_DATABASE === "false") {
    return;
  }

  const targetDatabase = targetDatabaseName();
  const adminUrl = new URL(process.env.DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const client = new Client({
    connectionString: adminUrl.toString(),
    ssl: databaseSsl(),
  });

  try {
    await client.connect();

    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDatabase],
    );

    if (result.rowCount === 0) {
      // PostgreSQL does not allow a parameter for an identifier. Double-quote
      // and escape the name before placing it in CREATE DATABASE.
      const quotedDatabase = `"${targetDatabase.replaceAll('"', '""')}"`;
      await client.query(`CREATE DATABASE ${quotedDatabase}`);
      console.log(`Created PostgreSQL database: ${targetDatabase}`);
    }
  } finally {
    await client.end();
  }
}

async function runMigrations() {
  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDirectory, file), "utf8");
    await pool.query(sql);
    console.log(`Applied database migration: ${file}`);
  }
}

async function seedIfEmpty() {
  if (process.env.AUTO_SEED === "false") {
    return;
  }

  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM rooms) AS room_count,
      (SELECT COUNT(*) FROM restaurant_tables) AS table_count
  `);
  const { room_count: roomCount, table_count: tableCount } = result.rows[0];

  if (Number(roomCount) > 0 && Number(tableCount) > 0) {
    return;
  }

  await pool.query(await fs.readFile(seedFile, "utf8"));
  console.log("Added sample rooms and restaurant tables.");
}

async function initializeDatabase() {
  await createDatabaseIfMissing();
  await pool.query("SELECT 1");
  await runMigrations();
  await seedIfEmpty();
}

module.exports = {
  initializeDatabase,
};
