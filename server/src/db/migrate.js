import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "./pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Aplica el esquema definido en schema.sql contra la base de datos
async function migrate() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("Migración aplicada correctamente.");
  } catch (err) {
    console.error("Error al aplicar la migración:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
