import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Firma un token JWT con el payload indicado (ej. { id, rol })
export function firmarToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

// Verifica y decodifica un token JWT; lanza si es inválido o expiró
export function verificarToken(token) {
  return jwt.verify(token, SECRET);
}
