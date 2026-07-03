import bcrypt from "bcryptjs";
import { crearUsuario, buscarPorEmail } from "../db/users.js";
import { firmarToken } from "./jwt.js";
import { crearTokenRecuperacion, buscarTokenValido, marcarTokenUsado } from "../db/passwordResets.js";
import { actualizarPassword } from "../db/users.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

// POST /api/auth/register — crea un usuario y devuelve token + datos públicos
export async function registrar(req, res) {
  const { nombre, apellido, email, password } = req.body || {};

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }

  const existente = await buscarPorEmail(email);
  if (existente) {
    return res.status(409).json({ error: "El email ya está registrado" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const usuario = await crearUsuario({ nombre, apellido, email, passwordHash });
  const token = firmarToken({ id: usuario.id, rol: usuario.rol });

  return res.status(201).json({ usuario, token });
}

// POST /api/auth/login — valida credenciales y devuelve token + datos públicos
export async function iniciarSesion(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  const usuario = await buscarPorEmail(email);
  if (!usuario) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const valido = await bcrypt.compare(password, usuario.password_hash);
  if (!valido) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = firmarToken({ id: usuario.id, rol: usuario.rol });
  const { password_hash, ...publico } = usuario;

  return res.status(200).json({ usuario: publico, token });
}

// POST /api/auth/olvide-password — genera y "envía" un enlace de recuperación
export async function olvidePassword(req, res) {
  const { email } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  const usuario = await buscarPorEmail(email);
  if (!usuario) {
    return res.status(404).json({ error: "Correo no encontrado" });
  }

  const token = await crearTokenRecuperacion(usuario.id);

  // TODO: reemplazar por envío real de email (Nodemailer, SendGrid, etc.)
  const enlace = `${process.env.CLIENT_URL || "http://localhost:5173"}/restablecer-password?token=${token}`;
  console.log(`Enlace de recuperación para ${email}: ${enlace}`);

  return res.status(200).json({ mensaje: "Enlace de recuperación enviado al correo" });
}

// POST /api/auth/restablecer-password — cambia la contraseña usando el token
export async function restablecerPassword(req, res) {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }

  const registro = await buscarTokenValido(token);
  if (!registro) {
    return res.status(400).json({ error: "Token inválido o expirado" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await actualizarPassword(registro.usuario_id, passwordHash);
  await marcarTokenUsado(registro.id);

  return res.status(200).json({ mensaje: "Contraseña actualizada correctamente" });
}
