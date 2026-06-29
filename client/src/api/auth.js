const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Realiza una petición POST con cuerpo JSON y devuelve la respuesta parseada
async function postJSON(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error en el servidor");
  }
  return data;
}

export const registrar = (datos) => postJSON("/auth/register", datos);
export const iniciarSesion = (credenciales) => postJSON("/auth/login", credenciales);

// Obtiene el usuario autenticado a partir de su token
export async function obtenerPerfil(token) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Sesión no válida");
  }
  const data = await res.json();
  return data.usuario;
}
