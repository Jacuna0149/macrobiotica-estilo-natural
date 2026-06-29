import { verificarToken } from "./jwt.js";

// Exige un JWT válido en el header Authorization: Bearer <token>.
// Adjunta el payload decodificado en req.usuario.
export function autenticar(req, res, next) {
  const header = req.headers.authorization || "";
  const [esquema, token] = header.split(" ");
  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Restringe el acceso a los roles indicados (debe usarse tras autenticar)
export function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    next();
  };
}

// Envuelve handlers async para que sus errores lleguen al middleware de errores
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
