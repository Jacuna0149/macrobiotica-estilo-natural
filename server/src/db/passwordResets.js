import crypto from "node:crypto";
import { pool } from "./pool.js";

const EXPIRA_MINUTOS = 60;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Genera un token de recuperación, lo guarda hasheado y devuelve el token en claro
export async function crearTokenRecuperacion(usuarioId) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiraEn = new Date(Date.now() + EXPIRA_MINUTOS * 60 * 1000);

  await pool.query(
    `INSERT INTO password_resets (usuario_id, token_hash, expira_en)
     VALUES ($1, $2, $3)`,
    [usuarioId, tokenHash, expiraEn]
  );

  return token;
}

// Busca un token válido (no usado, no expirado)
export async function buscarTokenValido(token) {
  const tokenHash = hashToken(token);
  const { rows } = await pool.query(
    `SELECT id, usuario_id FROM password_resets
     WHERE token_hash = $1 AND usado = false AND expira_en > now()`,
    [tokenHash]
  );
  return rows[0] || null;
}

// Marca un token como usado para que no se pueda reutilizar
export async function marcarTokenUsado(id) {
  await pool.query("UPDATE password_resets SET usado = true WHERE id = $1", [id]);
}