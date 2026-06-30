const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error en el carrito");
  }
  return data;
}

export const obtenerCarrito = () => request("/carrito");

export const agregarAlCarrito = (productoId, cantidad = 1) =>
  request("/carrito/items", {
    method: "POST",
    body: JSON.stringify({ producto_id: productoId, cantidad }),
  });

export const actualizarCantidad = (productoId, cantidad) =>
  request(`/carrito/items/${productoId}`, {
    method: "PATCH",
    body: JSON.stringify({ cantidad }),
  });

export const eliminarDelCarrito = (productoId) =>
  request(`/carrito/items/${productoId}`, { method: "DELETE" });
