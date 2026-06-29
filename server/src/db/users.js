import { pool } from "./pool.js";

// Inserta un nuevo usuario y devuelve sus datos públicos (sin el hash)
export async function crearUsuario({ nombre, apellido, email, passwordHash, rol = "cliente" }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, apellido, email, rol, creado_en`,
    [nombre, apellido, email, passwordHash, rol]
  );
  return rows[0];
}

// Busca un usuario por email. Incluye el hash para validar el login.
export async function buscarPorEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, nombre, apellido, email, password_hash, rol, creado_en
     FROM usuarios WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

// Busca un usuario por id y devuelve sus datos públicos
export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT id, nombre, apellido, email, rol, creado_en
     FROM usuarios WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}
