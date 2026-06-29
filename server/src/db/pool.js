import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Pool de conexiones a PostgreSQL usando la cadena DATABASE_URL del .env
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});
